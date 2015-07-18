/**
 *  sketchframe holds the iframe that loads the sketch folder
 */

module.exports = {
	template: require('./template.html'),

	ready: function() {
		this.sketchFrame = document.getElementById('sketchFrame');

		this.initSketchFrame();
	},

	methods: {
		initSketchFrame: function() {
			var self = this;
			var sketchFrame = this.sketchFrame;

			sketchFrame.onload = function() {
				var code = window.ace.getValue();
				code += '\n new p5();\n'

				if (self.$root.settings.fullCanvas) {
					// to do: check to see if setup exists,
					// and if createCanvas exists,
					// if not make it windowWidth, windowHeight
					code += '\n  function windowResized() {\n' +
									'resizeCanvas(windowWidth, windowHeight);if(typeof(setup) !== "undefined") {setup();}\n'+
									'}\n'+
									'resizeCanvas(windowWidth, windowHeight); if(typeof(setup) !== "undefined") {setup();}';
				}

				var userScript = sketchFrame.contentWindow.document.createElement('script');
				userScript.type = 'text/javascript';
				userScript.text = code;
				userScript.async = false;
				sketchFrame.contentWindow.document.body.appendChild(userScript);

				self.$root.running = true;
			}
		},

		toggleFullScreen: function() {
			var elem = this.sketchFrame;
			if (elem.requestFullscreen) {
			  elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
			  elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
			  elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
			  elem.webkitRequestFullscreen();
			}
		}

	}

};