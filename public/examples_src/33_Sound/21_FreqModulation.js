/**
 * @name Frequency Modulation
 * @description <p>Frequency Modulation involves two oscillators, referred
 * to as the carrier and the modulator, where the modulator controls
 * the carrier's frequency.</p>
 * <p>The carrier oscillates at an audible frequency (i.e. 440 Hz)
 * and connected to master output by default. The carrier.amp is
 * set to zero because we will have the modulator control its amplitude.</p>
 * <p>The modulator is typically set to a frequency that is lower
 * than humans can hear (i.e. 1 Hz, or one cycle every second).
 * The modulator is disconnected from master output, and is connected
 * to the frequency of the carrier, like this: carrier.freq(modulator).</p>
 * <p>In this example,</p><p>
 * - MouseX controls the amplitude of the modulator from 0 to 1. When the
 * modulator's amplitude is set to 0, the amplitude modulation has no effect.</p>
 * <p>- MouseY controls the frequency of the modulator from 0 to 20hz.
 * Both impact our perception of the Carrier frequency. A subtle amount
 * of Amplitude Modulation can simulate effects such as Tremolo.
 * Ring Modulation is a type of Amplitude Modulation where the original
 * carrier signal is not present.</p>
 * <p>- The modulator output, a signal between -1 and 1,
 * is scaled to a range between 100 and 300 using .mult() and .add()</p>
 *
 * <p><em><span class="small">You will need to include the 
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * for this example to work in your own project.</em></span></p>
 */
var carrier; // this is the oscillator we will hear
var modulator; // this oscillator will modulate the amplitude of the carrier
var fft; // we'll visualize the waveform 

function setup() {
  createCanvas(800,400);
  noFill();

  carrier = new p5.Oscillator('sine');
  carrier.amp(1); // set amplitude
  carrier.freq(220); // set frequency
  carrier.start(); // start oscillating

  modulator = new p5.Oscillator('sawtooth');
  modulator.disconnect();
  modulator.amp(1); // will map to mouseX
  modulator.freq(4); // will map to mouseY
  modulator.start();

  // multiply the modulator's output (amplitude ranges from -1 to 1) by 100, then add 200
  carrier.freq( modulator.mult(400).add(100) );

  // create an fft to analyze the audio
  fft = new p5.FFT();
}

function draw() {
  background(30);

  // map mouseY to moodulator freq between 0 and 20hz
  var modFreq = map(mouseY, 0, height, 20, 0);
  modulator.freq(modFreq);

  // change the original amplitude of the sawOsc, before it's scaled.
  // negative amp reverses the waveform, and sounds percussive
  var modAmp = map(mouseX, 0, width, -1, 1);
  modulator.amp(modAmp);

  // analyze the waveform
  waveform = fft.waveform();

  // draw the shape of the waveform
  stroke(255);
  strokeWeight(10);
  beginShape();
  for (var i = 0; i<waveform.length; i++){
    var x = map(i, 0, waveform.length, 0, width);
    var y = map(waveform[i], -1, 1, -height/2, height/2);
    vertex(x, y + height/2);
  }
  endShape();
}