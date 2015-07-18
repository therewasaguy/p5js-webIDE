/**
 *  sketchframe holds the iframe that loads the sketch folder
 */

// full screen polyfill by TRowbotham https://github.com/TRowbotham/FullscreenAPI-Polyfill/
(function(g,h){function c(a){27===a.keyCode&&(document.exitFullscreen(),a.stopPropagation(),a.preventDefault())}var f=function(a,b){var e=["webkit","moz","ms"],c=e.length;a=a.charAt(0).toUpperCase()+a.slice(1);for(var d=0;d<c;d++)if(e[d]+a in b)return e[d];return!1},b=f("exitFullscreen",document)||f("cancelFullScreen",document);"exitFullscreen"in document||!b||(Element.prototype.requestFullscreen=function(a){if(b+"RequestFullscreen"in this)this[b+"RequestFullscreen"](a);else this[b+"RequestFullScreen"](a)},
document.exitFullscreen=document[b+"ExitFullscreen"]||document[b+"CancelFullScreen"],Object.defineProperties(document,{fullscreenEnabled:{get:function(){return!!document[b+"FullScreenEnabled"]||!!document[b+"FullScreenEnabled"]},enumerable:!0},fullscreenElement:{get:function(){return document[b+"FullscreenElement"]||document[b+"FullScreenElement"]||document.webkitCurrentFullScreenElement||null},enumerable:!0}}),document.addEventListener(b+"fullscreenchange",function(){var a=document.createEvent("Event");
a.initEvent("fullscreenchange",!0,!1);document.dispatchEvent(a);document.fullscreenElement?document.addEventListener("keydown",c,!1):document.removeEventListener("keydown",c,!1)}),document.addEventListener(b+"fullscreenerror",function(){var a=document.createEvent("Event");a.initEvent("fullscreenerror",!0,!1);document.dispatchEvent(a)}),"allowfullscreen"in HTMLIFrameElement.prototype||Object.defineProperty(HTMLIFrameElement.prototype,"allowfullscreen",{get:function(){return this.hasAttribute("allowfullscreen")||
this.hasAttribute(b+"allowfullscreen")},set:function(a){var c=b+"AllowFullscreen";a?(this.setAttribute("allowfullscreen",""),this.setAttribute(c.toLowerCase(),"")):(this.removeAttribute("allowfullscreen"),this.removeAttribute(c.toLowerCase()))},enumerable:!0}))})(window);


module.exports = {
	template: require('./template.html'),

	ready: function() {
		var self = this;
		self.presentationMode = false;
		self.sketchFrame = document.getElementById('sketchFrame');

		self.initSketchFrame();

		document.addEventListener('fullscreenchange', function(e) {
			self.presentationMode = !self.presentationMode;
			// if( window.innerHeight == screen.height) {

			// 	// browser is fullscreen
			// 	self.presentationMode = true;
			// } else {
			// 	self.presentationMode = false;
			// }
			console.log('full screen: ' + self.presentationMode);
		});

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
		}

	}

};