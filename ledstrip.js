/**
 * LEDstrip.js
 * 
 * Dougal Campbell <dougal@gunters.org>
 * http://dougal.gunters.org/
 * @dougal
 *
 * Copyright 2013 by Dougal Campbell
 * Released under the MIT License
 */

var LEDstrip = function LEDstrip(el, stripsize) {
	/**
	 * private variables
	 */

	/**
	 * reference to an LED object representing the WS2811/WS2812 module
	 */
	var _LED = {};

	/**
	 * new-less constructor
	 * http://jfire.io/blog/2013/03/20/newless-javascript/
	 */
	if (! (this instanceof LEDstrip)) return new LEDstrip(el, stripsize);

	/* NOP console.log shim if real console object is not available */
	if (typeof console === "undefined") {
		console = {};
		console.log = function() {};
		console.debug = console.log;
		console.warn = console.log;
	}

	/**
	 * private methods
	 */
	function _addlights(lights, count) {
		/**
		 * add new lights
		 */
		var i;
		var j = lights.length;
		var light;

		for (i = 0; i < count; ++i) {
			light = WS2812(); // new LED instance
	    	this.elem.appendChild(light.elem); // Add LED element to DOM as child of strip element
			lights.push(light); // add LED to strip's lights array
			if (j > 0) {
				lights[j-1].next = lights[j]; // previous chains to current
			}
			// fill in new buffer elements
			this.buffer[j] = [0,0,0];
			++j;
		}

		return count;
	}

	function _removelights(lights, count) {
		/**
		 * remove lights from end of strip
		 */
		var i = 0, j = lights.length;
		var light;
		if (count > j) count = j; // can't remove more lights than we have!
		if (count <= 0) return; // nothing to do!

		for (i = count; i > 0; --i) {
			light = lights.pop(); // remove last element from lights array
			light.elem.parentNode.removeChild(light.elem); // remove DOM element from parent
			light.next = undefined; // dereference any old light pointers
			light.elem = undefined; // dereference DOM element
		}

		if (lights.length) {
			lights[lights.length - 1].next = undefined; // terminate strip
		}

		return count;
	}

	/**
	 * public properties
	 */
	this.buffer = []; 	// array of [r,g,b] triplets
	this.elem = {};		// HTML element to inject light elements into
	this.lights = [];	// array of HTML light elements (DOM)

	/**
	 * public methods
	 */
	function attach(el) {
		this.elem = el || document.createElement('div');

		return this;
	}

	/**
	 * Add or remove lights to set the desired length
	 */
	function setsize(count) {
		var cursize = this.lights.length;
		if (count > cursize) {
			_addlights.bind(this)(this.lights, count - cursize);
		} else if (count < cursize) {
			_removelights.bind(this)(this.lights, cursize - count);
            // remove excess buffer elements
			this.buffer.length = count;
		}

		return this;
	}

	function pushrgb(color) {
		if (this.lights[0] && this.lights[0].datain) {
			this.lights[0].datain.bind(this.lights[0])(color);
		} else {
			console.log("ERR: No lights defined.");
		}

		return this;
	}

	/**
	 * After loading the buffer with color values, call latch() to 
	 * update the lights to the new colors.
	 */
	function latch() {
		if (this.lights[0] && this.lights[0].latch) {
			this.lights[0].latch();
		} else {
			console.log("ERR: No lights defined.");
		}

		return this;
	}

	/**
	 * Push all of the color values from the buffer into the lights,
	 * sequentially, then latch to display the new values.
	 */
	function send() {
		var pushrgb = this.pushrgb.bind(this); // capture scope
		this.buffer.forEach(function(val){pushrgb(val);});

		this.latch();

		return this;
	}

	/**
	 * Set all the pixels to black.
	 */
	function clear() {
		var buff = this.buffer;
		this.buffer.forEach(function(val, idx) {
			buff[idx] = [0,0,0];
		});

		this.send();

		return this;
	}

	/**
	 * Load the buffer with values. Mainly provided for chaining purposes.
	 *
	 */
	function setcolors(buf) {
		this.buffer = buf.valueOf(); // valueOf so we get a copy, not a reference

		return this;
	}

	/**
	 * getter for the size of the LED strip
	 */
	function size() {
		return this.lights.length;
	}

	/**
	 * Convert HSL to RGB. See: http://www.w3.org/TR/2011/REC-css3-color-20110607/#hsl-color
	 *
	 * h is in degrees [0 - 360]
	 * s and l are percentages, floats in the range [0.0 .. 1.0]
	 * 
	 * Input values are sanity-checked and coerced into the valid ranges.
	 * 
	 * Returns an array, [r, g, b], each value in the integer range [0 .. 255]
	 */
	function hsl2rgb(h, s, l) {
		// Sanity check inputs
		h = (Math.floor(h) % 360) / 360; // normalize to [0.0 .. 1.0]
		// If value is less than zero, make it zero
		if (s < 0) s = 0;
		if (l < 0) l = 0;
		// if the value is greater than one, make it one
		if (s > 1.0) s = 1.0;
		if (l > 1.0) l = 1.0;

		// Convert hsl to rgb...
		if ( l <= 0.5 ) {
			m2 = l * (s + 1);
		} else {
			m2 = l + s - l*s;
		}

		m1 = l*2 - m2;

		r = Math.floor(255 * hue2rgb(m1, m2, h + 1/3));
		g = Math.floor(255 * hue2rgb(m1, m2, h));
		b = Math.floor(255 * hue2rgb(m1, m2, h - 1/3));

		return [r, g, b];
	}

	/**
	 * Helper function for hsl2rgb conversion
	 */
	function hue2rgb(m1, m2, h) {
		if (h < 0) h++;
		if (h > 1) h--;
		if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
		if (h * 2 < 1) return m2;
		if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;

		return m1;
	}

	/**
	 * Wheel function. Basically a stripped down hsv2rgb, with constant
	 * s and l values... Often used in NeoPixel examples
	 *
	 * Input a value 0 to 255 to get a color value.
	 * The colours are a transition r - g - b - back to r.
	 */
	function Wheel(WheelPos) {
	  WheelPos = 255 - WheelPos;
	  if(WheelPos < 85) {
	   return [255 - WheelPos * 3, 0, WheelPos * 3];
	  } else if(WheelPos < 170) {
	    WheelPos -= 85;
	   return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
	  } else {
	   WheelPos -= 170;
	   return [WheelPos * 3, 255 - WheelPos * 3, 0];
	  }
	}

	/**
	 * showColors() -- FastLED compat
	 */
	function showColor(color) {
		var buff = this.buffer;
		this.buffer.forEach(function(val, idx) {
			buff[idx] = color;
		});

		this.send();

		return this;
	}


	/**
	 * Make these methods public
	 */
	this.attach = attach;
	this.setsize = setsize;
	this.pushrgb = pushrgb;
	this.latch = latch;
	this.send = send;
	this.clear = clear;
	this.setcolors = setcolors;
	this.size = size;
	this.hsl2rgb = hsl2rgb;
	this.Wheel = Wheel;
	this.showColor = showColor;

	if (el && el instanceof Node) {
		this.attach(el);
	}

	if (stripsize > 0) {
		this.setsize(stripsize);
	}

	return this;
};
