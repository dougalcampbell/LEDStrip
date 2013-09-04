LEDStrip
========

JavaScript simulation of WS2812 LED strips commonly used with Arduino

Demo
----
There is a live demo available here:

http://dougalcampbell.github.io/LEDStrip/

Usage example
-------------

    var container = $('.mylights')[0]; // Container DIV in the page
    var colors = [ // blue gradient
      [0,0,50],
      [0,0,100],
      [0,0,150],
      [0,0,200],
      [0,0,250]
    ];
    var size = colors.length;

    
    var strip = LEDstrip(container, size) // Initialize
      .setcolors(colors)  // chain commands
      .send();
      
    colors.forEach(function(val,idx){ // fiddle with colors
      colors[idx][0] = colors[4-idx][2];
      colors[idx][1] = (colors[idx][0] + colors[idx][2]) >> 1; // g = (r + b) / 2
    });
    
    strip.buffer = colors; // set the color buffer directly
    strip.send();
    
    // assume that animate() is a function that manipulates strip.buffer[]...
    var rAF_id = requestAnimationFrame(animate);
    var i = 0;
    
    function animate() {
      rAF_id = requestAnimationFrame(animate);
      if (i == size) i = 0; // loop around the array

      /* generate random rgb values */
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);

      strip.buffer[i++] = [r, g, b];
      strip.send();
    }
    
Want to help?
-------------
If you find a bug, want to add a feature or new lighting driver, please
feel free to contribute! Pull requests welcome!

TODO
----
 * Add controls to demo for number of pixels and run speed
 * Add Adafruit NeoPixel library compatibility
 * Add simple 2D matrix support
 * MOAR LIGHTING ALGORITHMS!
