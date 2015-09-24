/**
 * skeleton.js
 *
 */

function Skeletons(ledstrip) {

	this.ledstrip = ledstrip;
	this.size = ledstrip.size();
	this.count = 0;

    // Initialize some sub-animations
	this.skeletonss = [
		new this.Skeleton(),
		new this.Skeleton()
		];

	for (var idx = 0, len = this.skeletons.length; idx < len; ++idx) {
		this.chasers[idx].parent = this;
	}
}

Skeletons.prototype.init = function() {
}

Skeletons.prototype.animate = function() {
	animation = requestAnimationFrame(this.animate.bind(this));
	// slow things down. 1 == full speed
    if ((this.count++ % 3)) return;
	this.ledstrip.clear();
    // Step through each sub-animation
	for ( var i = 0; i < this.skeletons.length; i++ ) {
		this.skeletons[i].step(this.ledstrip.buffer);
	}
	this.ledstrip.send();
}

/**
 * SKELETON 
 */
Skeletons.prototype.Skeleton = function() {
	this.parent = {};

	return this;
}

Skeletons.prototype.Skeleton.prototype.step = function(buf) {
	this._step(this.parent.size);
	this._draw(buf);
}

Skeletons.prototype.Skeleton.prototype._step = function(size) {
}

Skeletons.prototype.Skeleton.prototype._draw = function(buf) {
    // Do something to fill the buffer
    for (var i = 0; i < this.parent.length; i++) {
        buf[i] = [128, 128, 128];
    }
}

