/**
 * bouncingballs.js
 *
 * Bouncing Balls by Danny Wilson, originally for the FastLED library
 *
 * Originally by Danny Wilson - see https://github.com/fibonacci162/LEDs
 *
 * LEDstrip plugin
 *
 * Copyright (c) 2013 Dougal Campbell
 *
 * Distributed under the MIT License
 */

function BouncingBalls (ledstrip, opts) {
	opts = opts || {};
	this.ledstrip = ledstrip;
	this.ledstrip.clear();

	this.NUM_LEDS = this.ledstrip.size();
	this.GRAVITY = -9.81;    								// Gravity constant m/s2
	this.h0 = 1;             								// Initial height of balls in meters
	this.NUM_BALLS = 5;      								// How many balls
	this.h = new Array(this.NUM_BALLS);						// height in meters
	this.vImpact0 = Math.sqrt(-2 * this.GRAVITY * this.h0);	// Initial impact velocity (v at t0)
	this.vImpact = new Array(this.NUM_BALLS);				// Impact velocity
	this.tCycle = new Array(this.NUM_BALLS);				// Time since last ground strike
	this.pos = new Array(this.NUM_BALLS);					// Position on LED strip
	this.tLast = new Array(this.NUM_BALLS);					// Clock time of last ground strike
	this.COR = new Array(this.NUM_BALLS);					// Coefficient of Restitution (bounce damping)
	this.t = 0;												// tick counter

	return this;
}

BouncingBalls.prototype.init = function() {
	for (var i = 0; i < this.NUM_BALLS; i++) {
		this.tLast[i] = (new Date()).valueOf();
		this.h[i] = this.h0;
		this.pos[i] = 0;
		this.vImpact[i] = this.vImpact0;
		this.tCycle[i] = 0;
		this.COR[i] = 0.90 - i/Math.pow(this.NUM_BALLS, 2);
	}
	return this;
}

BouncingBalls.prototype.bounce = function (tick) {
	var i;

	this.ledstrip.clear();

	for (i = 0; i < this.NUM_BALLS; i++) {
		this.tCycle[i] = (new Date()).valueOf() - this.tLast[i];

	    // A little kinematics equation calculates positon as a function of time, acceleration (gravity) and intial velocity
	   this.h[i] = 0.5 * this.GRAVITY * Math.pow( this.tCycle[i]/1000 , 2.0 ) + this.vImpact[i] * this.tCycle[i]/1000;

	    if ( this.h[i] < 0 ) {                      
     		this.h[i] = 0;                            // If the ball crossed the threshold of the "ground," put it back on the ground
			this.vImpact[i] = this.COR[i] * this.vImpact[i] ;   // and recalculate its new upward velocity as it's old velocity * COR
			this.tLast[i] = (new Date()).valueOf();

			if ( this.vImpact[i] < 0.01 ) this.vImpact[i] = this.vImpact0;  // If the ball is barely moving, "pop" it back up at vImpact0
			if ( this.vImpact[i] > this.vImpact0 ) this.vImpact[i] = this.vImpact0; // If gravity changes, cap the impact velocity
	    }
	    this.pos[i] = Math.round( this.h[i] * (this.NUM_LEDS - 1) / this.h0);       // Map "h" to a "pos" integer index position on the LED strip
	    // Stay within our boundaries:
	    if (this.pos[i] < 0) this.pos[i] = 0;
	    if (this.pos[i] > (this.NUM_LEDS - 1)) this.pos[i] = this.NUM_LEDs - 1;
	}

	//Choose color of LEDs, then the "pos" LED on
	for (i = 0 ; i < this.NUM_BALLS ; i++){
		this.ledstrip.buffer[this.pos[i]] = this.ledstrip.hsl2rgb(Math.floor(((i+1) / this.NUM_BALLS) * 360), 1.0, 0.5);
	}
	this.ledstrip.send();

	//Then off for the next loop around
	//for (i = 0 ; i < this.NUM_BALLS ; i++) {
	//	this.ledstrip.buffer[this.pos[i]] = [0,0,0];
	//}

	return this;
}

BouncingBalls.prototype.setGravity = function (G) {
	// Gravity should be a negative acceleration
	if (G > 0) G *= -1;

	this.GRAVITY = G;

	// Reset vImpact0
	this.vImpact0 = Math.sqrt(-2 * this.GRAVITY * this.h0);	
}

BouncingBalls.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this)); // preserve our context

	this.bounce(this.t++); // calculate waves and increment tick
}

