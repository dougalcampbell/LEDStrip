//
// Copyright (c) 2013 Dougal Campbell
//
// Distributed under the MIT License

function ColorWave (ledstrip) {
	this.ledstrip = ledstrip;
	this.ledstrip.clearLeds();
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
	return Math.PI * 2 * tick / this.ledstrip.len;
}

/**
 * scale values [-1.0 .. 1.0] to [0 .. 255]
 */
ColorWave.prototype.scale = function (val) {
	val += 1; // bump up to a zero base: [0 .. 2]
	val *= 255/2; // scale up

	return Math.floor(val); // return int
}

ColorWave.prototype.wave = function (tick) {
	var offset = this.map2PI(tick);

	if (Math.random() > .999)  this.direction *= -1; // All skate, reverse direction!
	
	for (var i = 0; i < this.ledstrip.len; i++) {
		// Generate some RGBs, range [-1 .. +1]
		var j = this.map2PI(i * this.direction) + offset;
		var rsin = Math.sin(j); // sin(t)
		var gsin = Math.sin(2 * j / 3 + this.map2PI(this.ledstrip.len / 6)); // sin(2/3 t + 1/3 PI)
		var bsin = Math.sin(4 * j / 5 + this.map2PI(this.ledstrip.len / 3)); // sin(4/5 t + 2/3 PI)

		this.ledstrip.leds[i] = [this.scale(rsin), this.scale(gsin), this.scale(bsin)];
	}
}

ColorWave.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this));

	this.wave(this.t++);

	this.ledstrip.send();
}

