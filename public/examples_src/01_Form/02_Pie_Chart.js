/*
 * @name Pie Chart
 * @description Uses the arc() function to generate a pie chart from the data 
 * stored in an array.
 */
var angles = [ 30, 10, 45, 35, 60, 38, 75, 67 ];

function setup() {
  createCanvas(720, 400);
  noStroke();
  noLoop();  // Run once and stop
}

function draw() {
  background(100);
  pieChart(300, angles);
}

function pieChart(diameter, data) {
  var lastAngle = 0;
  for (var i = 0; i < data.length; i++) {
    var gray = map(i, 0, data.length, 0, 255);
    fill(gray);
    arc(width/2, height/2, diameter, diameter, lastAngle, lastAngle+radians(angles[i]));
    lastAngle += radians(angles[i]);
  }
}