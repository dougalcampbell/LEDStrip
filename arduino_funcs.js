/**
 * arduino_funcs.js
 *
 * Convenience functions from Arduino
 *
 * @author Dougal Campbell
 */


STARTTIME = (new Date()).valueOf();

function random(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    
    return Math.floor(Math.random() * (max - min)) + min;
}

function millis() {
    return (new Date()).valueOf() - STARTTIME;
}

function map(x, in_min, in_max, out_min, out_max) {
    return Math.floor( (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min );
}

function constrain(x, min, max) {
    if (x < min) {
        return min;
    }
    
    if (x > max) {
        return max;
    }
    
    return x;
}
