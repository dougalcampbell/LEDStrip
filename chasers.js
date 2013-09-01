/**
 * chaser.js
 *
 * TODO: REFACTOR
 */

function Chasers(ledstrip) {

	this.ledstrip = ledstrip;
	this.size = ledstrip.size();
	this.count = 0;

	this.chasers = [
		new this.Chaser([200, 75, 75], 0, true),
		new this.Chaser([75, 200, 75], Math.floor(this.size * 0.2), false),
		new this.Chaser([75, 75, 200], Math.floor(this.size * 0.4), true),
		new this.Chaser([200, 200, 75], Math.floor(this.size * 0.6), false),
		new this.Chaser([220, 75, 175], Math.floor(this.size * 0.8), true),
		];

	for (var idx = 0, len = this.chasers.length; idx < len; ++idx) {
		this.chasers[idx].parent = this;
	}
}

Chasers.prototype.init = function() {}

Chasers.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this));
	// slow things down. 1 == full speed
    if ((this.count++ % 3)) return;
	this.ledstrip.clear();
	for ( var i = 0; i < this.chasers.length; i++ ) {
		this.chasers[i].step(this.ledstrip.buffer);
	}
	this.ledstrip.send();
}

/**
 * CHASERS: https://github.com/DannyHavenith/ws2811
 */
Chasers.prototype.Chaser = function(color, position, forward) {
	this.color = color;
	this.position = position;
	this.forward = forward;
	/* I changed these scaling values from the originals, because they were
	 * too dark to show a good trail on a computer monitor.
	 */
	this.amplitudes = [256, 220, 200, 175, 150, 125, 100, 70, 40, 20];
	this.parent = {};

	return this;
}

 Chasers.prototype.Chaser.prototype.step = function(buf) {
	this._step(this.parent.size);
	this._draw(buf);
}

Chasers.prototype.Chaser.prototype._step = function(size) {
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

Chasers.prototype.Chaser.prototype._draw = function(buf) {
	var step = this.forward ? -1 : 1;
	var pos = this.position;

	for (var count = 0; count < this.amplitudes.length; ++count) {
		var value = this._scale(this.color, this.amplitudes[count]);
		buf[pos] = this._addClipped(buf[pos], value);
		pos += step;

		if (pos >= this.parent.size) {
			step = -step;
			pos = this.parent.size - 1;
		} else if (pos <= 0) {
			step = -step;
			pos = 0;
		}
	}
}

Chasers.prototype.Chaser.prototype._scale = function(color, amp) {
	var r, g, b;

	r = (color[0] * amp) >> 8;
	g = (color[1] * amp) >> 8;
	b = (color[2] * amp) >> 8;

	return [r, g, b];
}

Chasers.prototype.Chaser.prototype._addClipped = function(rgb1, rgb2) {
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

