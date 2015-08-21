/*
 * @name Width and Height
 * @description The 'width' and 'height' variables contain the 
 * width and height of the display window as defined in the createCanvas() 
 * function.
 */
function setup() {
  createCanvas(720, 400);
}

function draw() {
  background(127);
  noStroke();
  for (var i = 0; i < height; i += 20) {
    fill(129, 206, 15);
    rect(0, i, width, 10);
    fill(255);
    rect(i, 0, 10, height);
  }
}