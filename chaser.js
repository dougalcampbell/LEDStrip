/**
 * chaser.js
 *
 * TODO: REFACTOR
 */

/*
var chasers = [
	new Chaser([200, 75, 75], 0, true),
	new Chaser([75, 200, 75], Math.floor(length * 0.2), false),
	new Chaser([75, 75, 200], Math.floor(length * 0.4), true),
	new Chaser([200, 200, 75], Math.floor(length * 0.6), false),
	new Chaser([220, 75, 175], Math.floor(length * 0.8), true),
	];
*/
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

