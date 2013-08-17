/** 
 * LEDStrip lib
 * 
 * Simulate fucntionality of individually-addressable RGB LED strips 
 * (WS2811/WS2812)
 * 
 * The physical LED strips are serially chained LED modules, which use
 * a simple, but timing-critical 800kHz protocol for handling data. The
 * controller pushes RGB values into the first module, bit-by-bit, until
 * all 24 bits are in. When the next RGB triplet comes in, the first 
 * module will push the previous value out to the next module in the chain.
 * After the controller pushes all of the values onto the stack, it latches
 * the data line low for an extended time, signaling the chain to display
 * the new color values.
 *
 * Each bit is sent in a 1250ns (1.25 us) timeframe. A zero is represented 
 * by pulling the data line high for the first 250ns, then going low for 
 * 1000ns. For a one, the line is pulled high for 1000ns, then low for 250ns.
 * After every three bytes of data is sent, the first module pushes the 
 * previous values out to the next module, and so forth down the chain. When 
 * latch signal is sent, every module displays its new color. This gives an 
 * update rate of 33,333 LED/sec. Or to put it another way, you could drive 
 * about 500 LEDs with a 60 frames/sec update rate.
 */

/**
 * Strip container -- houses one or more LED instances
 * 
 * We cheat a little by accepting an RGB triplet all at once, rather than 
 * just pushing individual byte values in sequence. As a consequence, we 
 * also don't attempt to simulate GRB ordering issues. Maybe later.
 */
function LEDStrip(count, stripElem, ledElem) {
	this.elem = {}; // HTML element the strip is bound to
	this.len = count || 30; // default to 30 lights
	this.lights = []; // Array of LED objects
	this.leds = Array(this.len); // Array of color values to send

	this.elem = stripElem;
	// REFACTOR: eliminate jQuery dependency
	$(this.elem).addClass('LEDStrip');

	$(ledElem).detach();

	/**
	 * add new lights
	 */
	for (var i = 0; i < this.len; i++) {
		var light = new LED;
		// REFACTOR: eliminate jQuery dependency
    	light.elem = $(ledElem).clone().addClass('LEDLight');
    	$(this.elem).append(light.elem);
		this.lights.push(light);
		if (i > 0) {
			this.lights[i-1].next = this.lights[i]; // previous chains to current
		}
	}
}

LEDStrip.prototype.pushRGB = function (r, g, b) {
		if (this.lights[0] && this.lights[0].datain) {
			this.lights[0].datain(r, g, b);
		}
}

LEDStrip.prototype.latch = function () {
		if (this.lights[0] && this.lights[0].latch) {
			this.lights[0].latch();
		}
}

// Set colors in one big batch. Array of RGB triplets.
LEDStrip.prototype.send = function(buf) {
	var leds = buf || this.leds;

	leds.forEach(function(l) {
		this.pushRGB(l[0], l[1], l[2]);
	}.bind(this));

	this.latch();
}

LEDStrip.prototype.clearLeds = function () {
	for (i=0; i < this.leds.length; i++)
		this.leds[i] = [0,0,0];
}

/**
 * Individual LED module
 */
function LED() {
	this.elem = {}; // HTML element the LED is bound to
	this.next = undefined; // next LED instance in chain
	this.rgb = []; // RGB value to be displayed upon next latch
}

LED.prototype.latch = function () {
	// REFACTOR: eliminate jQuery dependency
	$(this.elem).css('background-color', 
				'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')'
			);
	this.rgb = []; // clear buffer
	if ('next' in this && this.next) {
		this.next.latch();
	}
}

LED.prototype.datain = function (r, g, b) {
	/**
	 * If we already have a value set, pass the incoming value on to the next
	 * module. If not, keep it for ourselves.
	 */
	if (this.rgb.length) {
		this.dataout(r, g, b);
	} else {
		this.rgb = [r, g, b];
	}
}

LED.prototype.dataout = function (r, g, b) {
	if ('next' in this && this.next) {
		this.next.datain(r, g, b);
	}
}


/****
 * Do eet!
 * 
 * This code currently relies on some global variables, which I don't like.
 * It's a side-effect of my () translation of the original AVR C++ code. I 
 * need to wrap it up and encapsulate it better, maybe with some IoC for
 * the connection between my LEDStrip class and this controller code.
 */

var strip, animation;
var length = 37;
var r = g = b = count = 0;
var flare_count = 16;
var current_flare = 0;
var flare_pause = 1;
var flares = Array(flare_count);

var chasers = [
	new Chaser([200, 75, 75], 0, true),
	new Chaser([75, 200, 75], Math.floor(length * 0.2), false),
	new Chaser([75, 75, 200], Math.floor(length * 0.4), true),
	new Chaser([200, 200, 75], Math.floor(length * 0.6), false),
	new Chaser([220, 75, 175], Math.floor(length * 0.8), true),
	];

for (var i = 0; i < flare_count; i++) {
	//flares[i] = new Flare([255, 255, 255], Math.floor(length/i), i, i*2);
	flares[i] = new Flare();
}

var torture, cycle;

$(document).ready(function() {
	strip = new LEDStrip(length, $('.ledstrip'), $('.ledlight'));
	cycle = new ColorCycle(strip);
	cycle.init();
	torture = new water_torture(strip);
	torture.init();
	colorwave = new ColorWave(strip);
	colorwave.init();
	animation = requestAnimationFrame(chase);
  
  $('#animselect').change(function(e) {
  var newanim = $(e.target).val();
  //strip.clearLeds();
  strip.send();
  console.log('change! ' + newanim); 
  cancelAnimationFrame(animation);
  switch(newanim) {
    case 'torture': 
      torture.animate();
      console.log('torture ' + animation);
      break;
    case 'cycle': 
      cycle.color_cycle();
      console.log('torture ' + animation);
      break;
    case 'wave': 
      colorwave.animate();
      console.log('wave ' + animation);
      break;
    case 'chasers':
      chase();
      console.log('chasers ' + animation);
      break;
    case 'flares':
	  strip.clearLeds();
    
      flare();
      console.log('flares ' + animation);
      break;
    case 'stop':
      console.log('stop ' + animation);
      break;
  }
  });
});

function chase() {
	animation = requestAnimationFrame(chase);
	// slow things down. 1 == full speed
    if ((count++ % 3)) return;
	strip.clearLeds();
	for ( var i = 0; i < chasers.length; i++ ) {
		chasers[i].step(strip.leds);
	}
	strip.send();
}

/**
 * CHASERS: https://github.com/DannyHavenith/ws2811
 */
function Chaser(color, position, forward) {
	this.color = color;
	this.position = position;
	this.forward = forward;
  /* I changed these scaling values from the originals, because they were
   * too dark to show a good trail on a computer monitor.
   */
	this.amplitudes = [256, 200, 175, 150, 125, 100, 80, 60, 50, 40, 30, 20, 15, 10, 6, 1];

	return this;
}

Chaser.prototype.step = function(buf) {
	this._step(length);
	this._draw(buf);
}

Chaser.prototype._step = function(size) {
	if (this.forward) {
		if (++this.position >= size) {
			this.position = size - 1;
			this.forward = false;
		}
	} else {
		if (--this.position <= 0) {
			this.forward = true;
		}
	}
}

Chaser.prototype._draw = function(buf) {
	var step = this.forward ? -1 : 1;
	var pos = this.position;

	for (var count = 0; count < this.amplitudes.length; ++count) {
		var value = this._scale(this.color, this.amplitudes[count]);
		buf[pos] = this._addClipped(buf[pos], value);
		pos += step;

		if (pos >= length) {
			step = -step;
			pos = length - 1;
		} else if (pos <= 0) {
			step = -step;
			pos = 0;
		}
	}
}

Chaser.prototype._scale = function(color, amp) {
	var r, g, b;

	r = (color[0] * amp) >> 8;
	g = (color[1] * amp) >> 8;
	b = (color[2] * amp) >> 8;

	return [r, g, b];
}

Chaser.prototype._addClipped = function(rgb1, rgb2) {
	var newrgb = Array(3);
  // for some reason, we sometimes get undefined values. Error check.
	if (! Array.isArray(rgb1)) rgb1 = [0,0,0];
	if (! Array.isArray(rgb2)) rgb2 = [0,0,0];

	newrgb[0] = rgb1[0] + rgb2[0];
	newrgb[1] = rgb1[1] + rgb2[1];
	newrgb[2] = rgb1[2] + rgb2[2];

	newrgb[0] = newrgb[0] > 255 ? 255 : newrgb[0];
	newrgb[1] = newrgb[1] > 255 ? 255 : newrgb[1];
	newrgb[2] = newrgb[2] > 255 ? 255 : newrgb[2];

	return newrgb;	
}

function Flare(color, position, amplitude, speed) {
	this.color = color || [255,255,255];
	this.position = position || 0;
	this.amplitude = amplitude || 0;
	this.speed = speed || 0;

	return this;
}

Flare.prototype.step = function (buf) {
	this._step();
	this._set(buf);
}

Flare.prototype._step = function() {
	if (this.speed < 0 && -this.speed > this.amplitude) {
		this.amplitude = 0;
	} else {
		this.amplitude += this.speed;
		if (this.amplitude > 256) {
			this.amplitude = 256;
			this.speed = -this.speed >> 2 + 1;
		}
	}
}

Flare.prototype._set = function (buf) {
	buf[this.position] = this._scale(this.color);
}

Flare.prototype._scale = function(color) {
	var r, g, b;
	var amp = this.amplitude;

	r = (color[0] * amp) >> 8;
	g = (color[1] * amp) >> 8;
	b = (color[2] * amp) >> 8;

	return [r, g, b];
}

// Modified from original.
Flare.prototype._randomBrightness = function () {
	return 250 - Math.floor((Math.random() * 125));
}

Flare.prototype._randomize = function (count) {
	this.color = [this._randomBrightness(), this._randomBrightness(), this._randomBrightness()];
	this.amplitude = Math.floor(Math.random() * 100) + 100;
	this.position = Math.floor(Math.random() * count);
	this.speed = 2 * Math.floor(Math.random() * 8) + 4;
}

function flare() {
	animation = requestAnimationFrame(flare);

	// slow things down. 1 == full speed
    if ((count++ % 3)) return;

	if (flare_pause) {
		--flare_pause;
	} else {
		//console.log(flares);
		if(!flares[current_flare].amplitude) {
			flares[current_flare]._randomize(length);
			++current_flare;
			if (current_flare >= flare_count) current_flare = 0;
			//flare_pause = Math.floor(Math.random() * 80);
		}
	}

	for (var i = 0; i < flare_count; i++) {
		flares[i].step(strip.leds);
	}

	strip.send();
}
