module.exports = {

	newProject: function() {
		console.log('new proj!!!');
	},

	saveAs: function() {
		console.log('save as!!!');
	},

	run: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		sketchFrame.src = sketchFrame.src;

		this.$.debug.clearErrors();

		this.running = true;
	},

	stop: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		var frameSrc = window.location.origin +'/'+ sketchFrame.src;
		var data = {'msg':'stop'};
		window.postMessage( JSON.stringify(data), frameSrc);

		this.running = false;
	},

};