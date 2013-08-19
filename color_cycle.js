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
    this.ledstrip.leds.unshift(new_color);
    this.ledstrip.leds.pop();

    this.ledstrip.send();
}

/**
 * main animation loop
 */
ColorCycle.prototype.color_cycle = function () {
	animation = requestAnimationFrame(this.color_cycle.bind(this));
	var idx;

	for (idx = 0, seqcount = this.sequence.length - 1; idx < seqcount; ++idx) { //forwards...
		this.scroll(this.sequence[idx]);
	}

	for (idx = this.sequence.length; idx > 0; --idx) { //backwards
		this.scroll(this.sequence[idx - 1]);
	}
 
    return animation;
}

/** 
 * initialize color buffer
 */
ColorCycle.prototype.init = function(seq) {
	this.sequence = seq || [
			[0, 25, 50],
			[0, 50, 100],
			[0, 75, 150],
			[25, 75, 100],
			[50, 100, 125],
			[75, 125, 100],
			[100, 125, 100],
			[125, 125, 100],
			[150, 125, 100],
			[175, 125, 100],
			[250, 125, 100],
			[250, 100, 75],
			[250, 75, 50],
			[250, 50, 25],
			[250, 0, 0]
	];

}
