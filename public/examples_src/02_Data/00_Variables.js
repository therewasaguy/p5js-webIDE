/*
 * @name Variables
 * @description Variables are used for storing values. In this example, change 
 * the values of variables to affect the composition.
 */
function setup() {

  createCanvas(720, 400);
  background(0);
  stroke(153);
  strokeWeight(4);
  strokeCap(SQUARE);

  var a = 50;
  var b = 120;
  var c = 180;

  line(a, b, a+c, b);
  line(a, b+10, a+c, b+10);
  line(a, b+20, a+c, b+20);
  line(a, b+30, a+c, b+30);

  a = a + c;
  b = height-b;

  line(a, b, a+c, b);
  line(a, b+10, a+c, b+10);
  line(a, b+20, a+c, b+20);
  line(a, b+30, a+c, b+30);

  a = a + c;
  b = height-b;

  line(a, b, a+c, b);
  line(a, b+10, a+c, b+10);
  line(a, b+20, a+c, b+20);
  line(a, b+30, a+c, b+30);
}