/*
 * @name Iteration
 * @description Iteration with a "for" structure to construct repetitive forms.
 */
var y;
var num = 14;

function setup() {

  createCanvas(720, 360);
  background(102);
  noStroke();
     
  // Draw white bars 
  fill(255);
  y = 60;
  for(var i = 0; i < num/3; i++) {
    rect(50, y, 475, 10);
    y+=20;
  }

  // Gray bars
  fill(51);
  y = 40;
  for(var i = 0; i < num; i++) {
    rect(405, y, 30, 10);
    y += 20;
  }
  y = 50;
  for(var i = 0; i < num; i++) {
    rect(425, y, 30, 10);
    y += 20;
  }
    
  // Thin lines
  y = 45;
  fill(0);
  for(var i = 0; i < num-1; i++) {
    rect(120, y, 40, 1);
    y+= 20;
  }
}