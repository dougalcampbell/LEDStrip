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

		for (i = count; i >= 0; --i) {
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
		this.buffer = buf.valueOf();

		return this;
	}

	/**
	 * getter for the size of the LED strip
	 */
	function size() {
		return this.lights.length;
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

	if (el && el instanceof Node) {
		this.attach(el);
	}

	if (stripsize > 0) {
		this.setsize(stripsize);
	}

	return this;
};
