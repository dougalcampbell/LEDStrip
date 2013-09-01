/**
 * flares.js
 *
 * TODO: REFACTOR
 */

/*
var flare_count = 16;
var current_flare = 0;
var flare_pause = 20;
var flares = Array(flare_count);

for (var i = 0; i < flare_count; i++) {
	//flares[i] = new Flare([255, 255, 255], Math.floor(length/i), i, i*2);
	flares[i] = new Flare();
}

*/
function Flares(color, position, amplitude, speed) {
	this.color = color || [255,255,255];
	this.position = position || 0;
	this.amplitude = amplitude || 0;
	this.speed = speed || 0;

	return this;
}

Flares.prototype.step = function (buf) {
	this._step();
	this._set(buf);
}

Flares.prototype._step = function() {
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

Flares.prototype._set = function (buf) {
	buf[this.position] = this._scale(this.color);
}

Flares.prototype._scale = function(color) {
	var r, g, b;
	var amp = this.amplitude;

	r = (color[0] * amp) >> 8;
	g = (color[1] * amp) >> 8;
	b = (color[2] * amp) >> 8;

	return [r, g, b];
}

// Modified from original.
Flares.prototype._randomBrightness = function () {
	return 255 - Math.floor((Math.random() * 200));
}

Flares.prototype._randomize = function (count) {
	this.color = [this._randomBrightness(), this._randomBrightness(), this._randomBrightness()];
	this.amplitude = Math.floor(Math.random() * 55) + 200;
	this.position = Math.floor(Math.random() * count);
	this.speed = 2 * Math.floor(Math.random() * 10) + 4;
}

Flares.prototype.animate = function() {
	animation = requestAnimationFrame(flare);

	// slow things down. 1 == full speed
    if ((count++ % 1)) return;

	if (flare_pause) {
		--flare_pause;
	} else {
		//console.log(flares);
		if(!flares[current_flare].amplitude) {
			flares[current_flare]._randomize(length);
			++current_flare;
			if (current_flare >= flare_count) current_flare = 0;
			flare_pause = Math.floor(Math.random() * 50);
		}
	}

	for (var i = 0; i < flare_count; i++) {
		flares[i].step(strip.leds);
	}

	strip.send();
}
