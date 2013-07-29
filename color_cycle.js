//
// Copyright (c) 2013 Danny Havenith
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//
// Converted to JavaScript by Dougal Campbell July 15, 2013

function ColorCycle (ledstrip) {
	this.ledstrip = ledstrip;
	this.ledstrip.clearLeds();
	this.sequence = [];

	return this;
}

/**
 * shift a new color into the buffer.
 */
ColorCycle.prototype.scroll = function (new_color) {
	var pos;
    if (++count % 100 == 0) {
    	console.log(count, 'before', strip.leds[29], strip.leds[30]);
    }
 /*
    for (pos = this.ledstrip.len - 1; pos > 0 ; --pos) {
        //console.log('pos: ', this.pos);
        //console.log(this.ledstrip.leds[this.pos], this.ledstrip.leds[this.pos - 1]);
        this.ledstrip.leds[pos] = this.ledstrip.leds[pos - 1].valueOf();
    }
*/
    this.ledstrip.leds.unshift(new_color);
    this.ledstrip.leds.pop();
    if (count % 100 == 0) {
    	console.log(count, 'after', strip.leds[29], strip.leds[30]);
    }

    //this.ledstrip.leds[0] = new_color.valueOf();	
    //console.log('new led[0]: ', this.ledstrip.leds[0]);
}

/**
 * shift and display
 */
ColorCycle.prototype.animate = function (new_color) {
    this.scroll(new_color);
}

/**
 * main animation loop
 */
ColorCycle.prototype.color_cycle = function () {
	animation = requestAnimationFrame(this.color_cycle.bind(this));
	var idx;

	//if ((animation % 1000) > 1) return;
	for (idx = 0, seqcount = this.sequence.length; idx < seqcount - 1; ++idx) { //forwards...
		this.animate(this.sequence[idx]);
	}

	for (idx = this.sequence.length; idx > 0; --idx) { //backwards
		this.animate(this.sequence[idx - 1]);
	}
    this.ledstrip.send();

    return animation;
}

/** 
 * initialize color buffer
 */
ColorCycle.prototype.init = function(seq) {
	this.sequence = seq || [
			//[0, 25, 50],
			[0, 50, 100],
			//[0, 75, 150],
			[25, 75, 100],
			//[50, 100, 125],
			[75, 125, 100],
			//[100, 125, 100],
			[125, 125, 100],
			//[150, 125, 100],
			[175, 125, 100],
			//[250, 125, 100],
			[250, 100, 75],
			//[250, 75, 50],
			[250, 50, 25],
			//[250, 0, 0]
	];

}
