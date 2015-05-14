/**
 * twinklesparkle.js
 *
 * TwinkleSparkle by Danny Wilson, originally for the FastLED library
 *
 * Originally by Danny Wilson - see https://github.com/fibonacci162/LEDs
 *
 * LEDstrip plugin
 *
 * Copyright (c) 2013 Dougal Campbell
 *
 * Distributed under the MIT License
 */

function TwinkleSparkle (ledstrip, opts) {
	opts = opts || {};
	this.ledstrip = ledstrip;
	this.ledstrip.clear();

	this.NUM_LEDS = this.ledstrip.size();

	this.FRAMES_PER_SECOND = 30;
	this.COOLING = 			5;						// controls how quickly LEDs dim
	this.TWINKLING = 		150;					// controls how many new LEDs twinkle
	this.FLICKER = 			50;						// controls how "flickery" each individual LED is

	this.beatInterval = 	8912;     				// the interval at which you want the strip to "sparkle"
	this.nextBeat = 		0;
	this.nextTwinkle = 		3000;     				// twinkling doesn't start until after the sanity check delay
	this.seeds = 			0;
	this.loops = 			0;
	this.deltaTimeTwinkle = 0;
	this.deltaTimeSparkle = 0;
	this.beatStarted = 		false;

	this.heat = [];

	this.t = 0;										// tick counter

	return this;
}

TwinkleSparkle.prototype.init = function() {

	return this;
}

// Get a timestamp for ms milliseconds from now
TwinkleSparkle.prototype.addTime = function (ms) {
	return (new Date()).valueOf() + ms;
}

// Replicate random8() function
TwinkleSparkle.prototype.random8 = function(min, max) {
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
TwinkleSparkle.prototype.random16 = function(min, max) {
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

TwinkleSparkle.prototype.qadd8 = function(a, b) {
	var tmp = Math.round(a + b);
	if (tmp > 255) tmp = 255;

	return tmp;
}

TwinkleSparkle.prototype.qsub8 = function(a, b) {
	var tmp = Math.round(a - b);
	if (tmp < 0) tmp = 0;

	return tmp;
}


TwinkleSparkle.prototype.millis = function() {
	return (new Date()).valueOf();
}

TwinkleSparkle.prototype.Twinkle = function() {
	// Step 1. Create a randome number of seeds
	this.seeds = this.random8(10,this.NUM_LEDS-10);

	// Step 2. "Cool" down every location on the strip a little
	for( var i = 0; i < this.NUM_LEDS; i++) {
		this.heat[i] = this.qsub8( this.heat[i], this.COOLING);
	}

	// Step 3. Make the seeds into heat on the string
	for ( var j = 0 ; j < this.seeds ; j++) {
		if (this.random16() < this.TWINKLING) {
			this.heat[this.random8(this.NUM_LEDS)] = this.random8(50,255);
		}
	}

	// Step 4. Add some "flicker" to LEDs that are already lit
	//         Note: this is most visible in dim LEDs
	for ( var k = 0 ; k < this.NUM_LEDS ; k++ ) {
		if (this.heat[k] > 0 && this.random8() < this.FLICKER) {
			this.heat[k] = this.qadd8(this.heat[k] , 10);
		}
	}

	// Step 5. Map from heat cells to LED colors
	for( var j = 0; j < this.NUM_LEDS; j++) {
		this.ledstrip.buffer[j] = this.HeatColor( this.heat[j] );
	}
	this.nextTwinkle += 1000 / this.FRAMES_PER_SECOND ; // assign the next time Twinkle() should happen
}

TwinkleSparkle.prototype.Sparkle = function() {
	// Step 1. Make a random numnber of seeds
	this.seeds = this.random8(this.NUM_LEDS - 20 , this.NUM_LEDS);

	// Step 2. Increase the heat at those locations
	for ( var i = 0 ; i < seeds ; i++) {
		var pos = this.random8(this.NUM_LEDS);
		this.heat[pos] = this.random8(50,255);
	}
	this.nextBeat += this.beatInterval; // assign the next time Twinkle() should happen
	this.loops++ ;
}

//Play with this for different strip colors
TwinkleSparkle.prototype.HeatColor = function(temperature) {
	return this.ledstrip.hsl2rgb(29 * (360 / 255), 200/255, temperature/255);
}


TwinkleSparkle.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this)); 	// preserve our context

	// Wait for something in the serial monitor before "Sparkling" the first time.
	// This lets you time the sparkle to a particular beat in music.
	// In practice, just type a letter into the serial monitor and press enter
	// when you want the first sparkle to start.

	if (this.loops == 0) {
		this.nextBeat = this.millis();
	}
	else {
		if (this.loops == 0 && this.beatStarted == false) {
			this.nextBeat = this.millis();
			this.beatStarted == true;
			this.Sparkle();
		}
		else {
			this.deltaTimeSparkle = this.millis() - this.nextBeat;
			if ( this.deltaTimeSparkle > 0 ) this.Sparkle(); // if more time than 
		}
	}

	this.deltaTimeTwinkle = this.millis() - this.nextTwinkle;
	if ( this.deltaTimeTwinkle > 0 ) {
		this.Twinkle();
	}

	this.ledstrip.send(); // display the LED state

	this.t++; // increment tick
}

