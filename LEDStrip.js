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
	this.len = 30; // default to 30 lights
	this.lights = [];

	if (count) {
		this.len = count;
	}

	this.elem = stripElem;
	$(this.elem).addClass('LEDStrip');

	/**
	 * remove any old lights
	 */
	while (this.lights.length) {
		var rem = this.lights.pop();
		rem.next = undefined; // help with garbage collection?
	}

	$(ledElem).detach();

	/**
	 * add new lights
	 */
	for (var i = 0; i < this.len; i++) {
		var light = new LED;
    	light.elem = $(ledElem).clone().addClass('LEDLight');
    	$(this.elem).append(light.elem);
		this.lights.push(light);
		if (i) { // > zero
			this.lights[i-1].next = this.lights[i]; // pointer
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

/**
 * Individual LED module
 */
function LED() {
	this.elem = {}; // HTML element the LED is bound to
	this.next = undefined; // next LED instance in chain
	this.rgb = [];
}

LED.prototype.latch = function () {
	$(this.elem).css('background-color', 
				'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')'
			);
	this.rgb = []; // clear buffer
	if ('next' in this && this.next) {
		this.next.latch();
	}
}
LED.prototype.datain = function (r, g, b) {
	if (this.rgb.length) {
		this.dataout(this.rgb[0], this.rgb[1], this.rgb[2]);
	}
	this.rgb = [r, g, b];
}

LED.prototype.dataout = function (r, g, b) {
	if ('next' in this && this.next) {
		this.next.datain(r, g, b);
	}
}

