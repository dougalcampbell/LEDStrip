/**
 * color_wave.js
 *
 * sine waves generate pulsating colors
 *
 * LEDstrip plugin
 *
 * Copyright (c) 2013 Dougal Campbell
 *
 * Distributed under the MIT License
 */

function ColorWave (ledstrip) {
	this.ledstrip = ledstrip;
	this.ledstrip.clear();
	this.direction = 1;
	// tick counter
	this.t = 0;

	return this;
}

ColorWave.prototype.init = function() {}

/**
 * Map an integer so that 0..ledstrip.len => 0..2PI
 */
ColorWave.prototype.map2PI = function(tick) {
	return Math.PI * 2 * tick / this.ledstrip.size();
}

/**
 * scale values [-1.0, 1.0] to [0, 255]
 */
ColorWave.prototype.scale = function (val) {
	val += 1; 		// bump up to a zero base: [0, 2]
	val *= 255/2; 	// scale up

	return Math.floor(val); // return int
}

ColorWave.prototype.wave = function (tick) {
	var i, j, rsin, gsin, bsin, size = this.ledstrip.size(), offset = this.map2PI(tick);

	if (Math.random() > .999)  this.direction *= -1; // All skate, reverse direction!

	for (i = 0; i < size; i++) {
		/**
		 * Generate some RGBs, range [-1, +1]
		 * If you think about the LED strip as a unit circle, with 
		 * circumference 2 PI, then angle between the LEDs is simply
		 *   2 PI / count 
		 * And the angle for any particular LED will be
		 *   (2 PI / count) * position
		 * That's what the map2PI() method does.
		 */

		j = this.map2PI(i * this.direction) + offset;		// calculate angle
		rsin = Math.sin(j); 								// sin(t)
		gsin = Math.sin(2 * j / 3 + this.map2PI(size / 6)); // sin(2/3 t + 1/3 PI)
		bsin = Math.sin(4 * j / 5 + this.map2PI(size / 3)); // sin(4/5 t + 2/3 PI)

		this.ledstrip.buffer[i] = [this.scale(rsin), this.scale(gsin), this.scale(bsin)];
	}
}

ColorWave.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this)); // preserve our context

	this.wave(this.t++); // calculate waves and increment tick

	this.ledstrip.send(); // update strip
}

