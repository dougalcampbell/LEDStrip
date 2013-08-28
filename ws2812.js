/**
 * ws2812.js
 * WS2812 LED Factory
 * 
 * Dougal Campbell <dougal@gunters.org>
 * http://dougal.gunters.org/
 * @dougal
 *
 * Copyright 2013 by Dougal Campbell
 * Released under the MIT License
 */

var WS2812 = function WS2812() {
	/**
	 * public properties
	 */
	this.elem = document.createElement('div'); // bound HTML element, class 'WS2812-led'
	this.elem.setAttribute('class', 'WS2812-led');
	this.next = undefined;
	this.color = [];

	/**
	 * public methods
	 */

	/**
	 * Load a color value, or propogate it, as appropriate
	 */
	function datain(newcolor) {
		/**
		 * If we already have a value set, pass the incoming value on to the next
		 * module. If not, keep it for ourselves.
		 */
		if (this.color.length) {
			this.dataout(newcolor);
		} else {
			this.color = newcolor;
		}
	}

	/**
	 * Propogate a color value to the next available LED module
	 */
	function dataout(newcolor) {
		if (this.next && this.next.datain) {
			this.next.datain(newcolor);
		}
	}

	/**
	 * Lock in pending color value
	 */
	function latch() {
		if (! (this.elem && this.elem.style)) return;

		this.elem.style.backgroundColor = 'rgb(' + this.color.join() + ')';
		this.color = []; // clear buffer
		if (this.next) {
			this.next.latch();
		}
	}

	this.datain = datain;
	this.dataout = dataout;
	this.latch = latch;

	/**
	 * new-less constructor
	 * http://jfire.io/blog/2013/03/20/newless-javascript/
	 */
	if (! (this instanceof WS2812)) return new WS2812();

	//return this;
};
