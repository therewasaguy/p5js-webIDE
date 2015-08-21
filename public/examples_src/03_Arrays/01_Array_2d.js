/*
 * @name Array 2D
 * @description Demonstrates the syntax for creating a two-dimensional (2D)
 * array. Values in a 2D array are accessed through two index values.  
 * 2D arrays are useful for storing images. In this example, each dot 
 * is colored in relation to its distance from the center of the image. 
 */
var distances = [];
var maxDistance;
var spacer;

function setup() {
  createCanvas(720, 360);
  maxDistance = dist(width/2, height/2, width, height);
  for (var x = 0; x < width; x++) {
    distances[x] = []; // create nested array
    for (var y = 0; y < height; y++) {
      var distance = dist(width/2, height/2, x, y);
      distances[x][y] = distance/maxDistance * 255;
    }
  }
  spacer = 10;
  noLoop();  // Run once and stop
}

function draw() {
  background(0);
  // This embedded loop skips over values in the arrays based on
  // the spacer variable, so there are more values in the array
  // than are drawn here. Change the value of the spacer variable
  // to change the density of the points
  for (var x = 0; x < width; x += spacer) {
    for (var y = 0; y < height; y += spacer) {
      stroke(distances[x][y]);
      point(x + spacer/2, y + spacer/2);
    }
  }
}