/*
 * water_torture.js
 *
 *  Created on: Feb 12, 2013
 *      Author: danny
 * 
 * Converted to JavaScript by Dougal Campbell, July 11, 2013
 */

function water_torture(ledstrip) {
	this.ledstrip = ledstrip;
	//this.ledstrip.clear();
	return this;
}

water_torture.prototype.init = function () {
	this.buffer = this.ledstrip.buffer;
	this.ledcount = this.ledstrip.size();
    this.droplet_count = 4;
    this.droplets = Array(this.droplet_count); // droplets that can animate simultaneously.
    this.current_droplet = 0; // index of the next droplet to be created
    this.droplet_pause = 1; // how long to wait for the next one

    for (var i = 0; i < this.droplet_count; i++) {
    	this.droplets[i] = new this.droplet();
    	this.droplets[i].parent = this;
    }
}

water_torture.prototype.mult = function (value, multiplier) {
		return Math.floor(value * multiplier / 256);
}

/// This class maintains the state and calculates the animations to render a falling water droplet
/// Objects of this class can have three states:
///    - inactive: this object does nothing
///    - swelling: the droplet is at the top of the led strip and swells in intensity
///    - falling: the droplet falls downwards and accelerates
///    - bouncing: the droplet has bounced of the ground. A smaller, less intensive droplet bounces up
///      while a part of the drop remains on the ground.
/// After going through the swelling, falling and bouncing phases, the droplet automatically returns to the
/// inactive state.
water_torture.prototype.droplet = function (color, gravity) {
	this.color = color || [50,70,220];
	this.gravity = gravity || 5;
	this.position = 0;
	this.speed = 0;

	this.inactive = 'INACTIVE';
	this.swelling = 'SWELLING';
	this.falling = 'FALLING';
	this.bouncing = 'BOUNCING';

	this.state = this.swelling;

	this.parent = {};
}

/// calculate the next step in the animation for this droplet
water_torture.prototype.droplet.prototype._step = function () {
		if (this.state == this.falling || this.state == this.bouncing) {
			this.position += this.speed;
			this.speed += this.gravity;

			// if we hit the bottom...
			//var maxpos16 = Math.floor(this.parent.ledcount * 256);
			var maxpos16 = (this.parent.ledstrip.size() - 1) * 256;
			if (this.position >= maxpos16)
			{
				if (this.state == this.bouncing)
				{
					// this is the second collision,
					// deactivate.
					this.state = this.inactive;
				}
				else
				{
					// reverse direction and dampen the speed
					this.position = maxpos16 - (this.position - maxpos16);
					this.speed = Math.floor(-this.speed/4);
					this.color = this.scale( this.color, 200);
					this.state = this.bouncing;
				}
			}
		}
		else if (this.state == this.swelling)
		{
			++this.position;
			if ( this.color[2] <= 100 || this.color[2] - this.position <= 10)
			{
				this.state = this.falling;
				this.position = 0;
			}

		}
	}

/// perform one step and draw.
water_torture.prototype.droplet.prototype.step = function () {
		this._step();
		this._draw();
}

/// Draw the droplet on the led string
/// This will "smear" the light of this droplet between two leds. The closer
/// the droplets position is to that of a particular led, the brighter that
/// led will be
water_torture.prototype.droplet.prototype._draw = function () {
	//console.log('drawing - state = ' + this.state);
	if (this.state == this.falling || this.state == this.bouncing)
	{
		var position8 = Math.floor(this.position / 256);
		var remainder = this.position % 256; // get the lower bits

		this.add_clipped_to(this.parent.buffer[position8], this.scale( this.color, 255 - remainder ));
		if (remainder)
		{
			this.add_clipped_to(this.parent.buffer[position8+1], this.scale(this.color, remainder));
		}

		if (this.state == this.bouncing)
		{
			this.add_clipped_to(this.parent.buffer[this.parent.ledstrip.size() - 1], this.color);
		}
	}
	else if (this.state == this.swelling)
	{
		this.add_clipped_to(this.parent.buffer[0], this.scale(this.color, this.position));
	}
	//console.log('after draw, droplet = ', this);
}

water_torture.prototype.droplet.prototype.is_active = function () {
	return this.state != this.inactive;
}

/// Add  two numbers and clip the result at 255.
water_torture.prototype.droplet.prototype.add_clipped = function (left, right) {
	var result = left + right;
	if (result > 255) result = 255;
	return result;
}

/// Add the right rgb value to the left one, clipping if necessary
water_torture.prototype.droplet.prototype.add_clipped_to = function (left, right) {
			left[0] = this.add_clipped(left[0], right[0]);
			left[1] = this.add_clipped(left[1], right[1]);
			left[2] = this.add_clipped(left[2], right[2]);
}

/// multiply an 8-bit value with an 8.8 bit fixed point number.
/// multiplier should not be higher than 1.00 (or 256).
water_torture.prototype.droplet.prototype.mult = function (value, multiplier) {
	return Math.floor(value * multiplier / 256);
}

/// scale an rgb value up or down. amplitude > 256 means scaling up, while
/// amplitude < 256 means scaling down.
water_torture.prototype.droplet.prototype.scale = function (value, amplitude) {
	return [
			this.mult(value[0], amplitude),
			this.mult(value[1], amplitude),
			this.mult(value[2], amplitude)
			]
}

water_torture.prototype.droplet.prototype.random_scale = function () {
	return 128 + Math.floor((Math.random() * 128));
}

water_torture.prototype.droplet.prototype.randomize_droplet = function () {
	this.color = [	this.mult(this.random_scale(), 150),
					this.mult(this.random_scale(), 200),
					this.mult(this.random_scale(), 512)
					];
	this.gravity = 5;
	this.state = this.swelling;
}

/// Create the complete water torture animation.
/// This will render droplets at random intervals, up to a given maximum number of droplets.
/// The maximum led count is 256
water_torture.prototype.animate = function animate() {
	//console.log(this);
    animation = requestAnimationFrame(this.animate.bind(this));

	// slow things down. 1 == full speed
    //if ((count++ % 3)) return;

	if (this.droplet_pause)
	{
		--this.droplet_pause;
	}
	else
	{
		if (! this.droplets[this.current_droplet].is_active() )
		{
			this.droplets[this.current_droplet].randomize_droplet();
			++this.current_droplet;
			if (this.current_droplet >= this.droplet_count) this.current_droplet = 0;
			this.droplet_pause = 200 + Math.floor(Math.random() * 400);
		}
	}

	this.ledstrip.clear();

	for (var idx = 0; idx < this.droplet_count; ++idx)
	{
		this.droplets[idx].step();
	}

	this.ledstrip.send();
}


