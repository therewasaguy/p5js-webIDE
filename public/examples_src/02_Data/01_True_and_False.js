/*
 * @name True and False
 * @description A Boolean variable has only two possible values: true or false. 
 * It is common to use Booleans with control statements to determine the flow 
 * of a program. In this example, when the boolean value "x" is true, vertical 
 * black lines are drawn and when the boolean value "x" is false, horizontal 
 * gray lines are drawn.
 */
function setup() {

  createCanvas(720, 400);
  background(0);
  stroke(255);

  var b = false;
  var d = 20;
  var middle = width/2;;

  for (var i = d; i <= width; i += d) {
    
    if (i < middle) {
      b = true;
    } else {
      b = false;
    }
    
    if (b == true) {
      // Vertical line
      line(i, d, i, height-d);
    }
    
    if (b == false) {
      // Horizontal line
      line(middle, i - middle + d, width-d, i - middle + d);
    }
  }
}