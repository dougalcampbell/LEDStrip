/**
 * lightning.js
 *
 * Lightning by Danny Wilson, originally for the FastLED library
 *
 * Originally by Danny Wilson - see https://github.com/fibonacci162/LEDs
 *
 * LEDstrip plugin
 *
 * Copyright (c) 2013 Dougal Campbell
 *
 * Distributed under the MIT License
 *
 * NOTE: I had to refactor this significantly from the original code due
 * to differences between Arduino's synchronous loop() and JavaScript's
 * asynchronous requestAnimationFrame(). I'm implementing the delay() 
 * functionality more in terms of a state machine.
 * 
 * States: IDLE -> FLASHINIT -> FLASHOFF -> FLASHON -> FLASHOFF -> [ FLASHON | IDLE ]
 */

function Lightning (ledstrip, opts) {
	opts = opts || {};
	this.ledstrip = ledstrip;
	this.ledstrip.clear();

	this.NUM_LEDS = this.ledstrip.size();
	this.FREQUENCY = 100;									// Controls the interval between strikes
	this.FLASHES = 8;										// Upper limit of flashes per strike
	this.dimmer = 1;

	// State machine vars
	this.STATE = 'IDLE';									// Current state
	this.TIMEOUT = 0;										// Time for next state check
	this.FLASHCOUNT = 0;									// Instance flash count (randomly set)

	this.t = 0;												// tick counter

	return this;
}

Lightning.prototype.init = function() {
	this.TIMEOUT = this.addTime(3000); 						// start with a 3-sec delay
	this.STATE = 'IDLE';
	this.FLASHCOUNT = 0;
	this.ledstrip.clear();

	return this;
}

Lightning.prototype.setFrequency = function (F) {
	this.FREQUENCY = F;
}

Lightning.prototype.setFlashes = function (F) {
	this.FLASHES = F;
}

// Get a timestamp for ms milliseconds from now
Lightning.prototype.addTime = function (ms) {
	return (new Date()).valueOf() + ms;
}

// Replicate random8() function
Lightning.prototype.random8 = function(min, max) {
	if (min === undefined) {
		min = 0;
		max = 255;
	}
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return (Math.round(Math.random() * (max - min)) + min) & 255;
}

// Replicate random16() function
Lightning.prototype.random16 = function(min, max) {
	if (min === undefined) {
		min = 0;
		max = 65535;
	}
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return (Math.round(Math.random() * (max - min)) + min) & 65535;
}


Lightning.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this)); 	// preserve our context

	switch (this.STATE) {
		case 'IDLE':
			if ((new Date()).valueOf() > this.TIMEOUT) {
				/* go to FLASHINIT state next */
				// How many flashes for this time around?
				this.FLASHCOUNT = this.random8(3, this.FLASHES);	// Reset flash count
				this.TIMEOUT = this.addTime(this.random8(4,10)); 	// Time until next action
				this.dimmer = 5; 									// lead strike is dimmer
				this.ledstrip.showColor(this.ledstrip.hsl2rgb(359, 0, Math.floor((255/this.dimmer)/255))); // on
				this.STATE = 'FLASHINIT';							// next state on timeout
				//console.log('IDLE -> FLASHINIT');
			}
			break;
		case 'FLASHINIT':
			if ((new Date()).valueOf() > this.TIMEOUT) {
				this.TIMEOUT = this.addTime(150); 					// initial delay is longer
				this.ledstrip.showColor(this.ledstrip.hsl2rgb(359, 0, 0)); // off
				this.STATE = 'FLASHOFF';
				//console.log('FLASHINIT -> FLASHOFF');
			}
			break;
		case 'FLASHON':
			if ((new Date()).valueOf() > this.TIMEOUT) {
				this.TIMEOUT = this.addTime(50 + this.random8(0, 100));	// delay between strokes
				this.ledstrip.showColor(this.ledstrip.hsl2rgb(359, 0, 0)); // off
				this.STATE = 'FLASHOFF';
				//console.log('FLASHON -> FLASHOFF');
			}
			break;
		case 'FLASHOFF':
			if ((new Date()).valueOf() > this.TIMEOUT) {

				if (this.FLASHCOUNT > 0) {
					this.FLASHCOUNT--;								// We've completed a stroke!
					this.TIMEOUT = this.addTime(this.random8(4,10)); // delay between strokes
					this.dimmer = this.random8(1,3);
					this.ledstrip.showColor(this.ledstrip.hsl2rgb(359, 0, Math.floor(255/this.dimmer)/255)); // on again
					this.STATE = 'FLASHON';							// next stroke...
					//console.log('FLASHOFF -> FLASHON');
				} else {
					this.FLASHCOUNT = 0;							// Completed all strokes. Go idle.
					this.TIMEOUT = this.addTime(this.random8(this.FREQUENCY) * 100);
					this.STATE = 'IDLE';
					//console.log('FLASHOFF -> IDLE');
				}
			}
			break;
		default: // unknown state. this should never happen.
			this.ledstrip.clear();
			console.error('What the?');
	}

	this.ledstrip.send(); // display the LED state

	this.t++; // increment tick
}

