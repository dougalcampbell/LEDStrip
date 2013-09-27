/**
 * larson.js
 *
 * Larson scanner (AKA Cylon or Knight Rider)
 *
 * LEDstrip plugin
 *
 * Copyright (c) 2013 Dougal Campbell
 *
 * Distributed under the MIT License
 */

function Larson (ledstrip, opts) {
	opts = opts || {};
	this.ledstrip = ledstrip;
	this.ledstrip.clear();
	this.direction = 1;
	this.color = opts.color || [255,0,0]; // default to red
	this.speed = opts.speed || 3; // run every Nth tick? 1 == full speed
	this.spread = opts.spread || 3; // spread N pixels on either side
	// tick counter
	this.t = 0;

	this.position = 0;

	return this;
}

Larson.prototype.init = function() {return this;}

Larson.prototype.setColor = function(color) {
	this.color = color;
	return this;
}

Larson.prototype.setSpeed = function(speed) {
	this.speed = speed;
	return this;
}

Larson.prototype.setSpread = function(spread) {
	this.spread = spread;
	return this;
}

Larson.prototype.setPosition = function(pos) {
	this.position = pos;
	return this;
}

Larson.prototype.setDirection = function(dir) {
	if (dir >= 0) {
		this.direction = 1;
	} else {
		this.direction = -1;
	}

	return this;
}

Larson.prototype.scan = function (tick) {
	var fade, i, spos, scol;
	if (!(tick % this.speed == 0)) return; // speed control

	this.ledstrip.clear();

	// Set the primary dot
	this.ledstrip.buffer[this.position] = this.color;	

	// handle spread
	if (this.spread > 0) {
		fade = 1 / (this.spread + 1);

		for (i = 1; i <= this.spread; i++) {
			scol = [
				Math.floor(this.color[0] * ((this.spread + 1 - i) / (this.spread + 1))),
				Math.floor(this.color[1] * ((this.spread + 1 - i) / (this.spread + 1))),
				Math.floor(this.color[2] * ((this.spread + 1 - i) / (this.spread + 1)))
				];
				
			if (this.position + i < this.ledstrip.buffer.length) {
				this.ledstrip.buffer[this.position + i] = scol;
			}

			if (this.position - i >= 0) {
				this.ledstrip.buffer[this.position - i] = scol;
			}
		}
	}


	/**
	 * Update position and direction for next pass
	 */
	this.position += this.direction;

	// check for out-of-bounds:
	if (this.position >= this.ledstrip.buffer.length) {
		this.position -= 2;
		this.direction = -1; // all skate, reverse direction!
	}
	if (this.position < 0) {
		this.position += 2;
		this.direction = 1;
	}

	this.ledstrip.send();

	return this;
}

Larson.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this)); // preserve our context

	this.scan(this.t++); // calculate waves and increment tick

	this.ledstrip.send(); // update strip
}

