module.exports = {

	newProject: function() {
		console.log('new proj!!!');
		this.tabs = [];
		// this.$editor.sessions = [];
		// this.openFile();
	},

	saveAs: function() {
		console.log('save as!!!');
		var saveName = prompt('Save as ', this.projectName);
		if (saveName) {
			this.title = saveName;
		}
	},

	downloadProject: function() {
		console.log('downloadProject!!!');
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

	// pause is not currently in use, sends a noLoop message
	pause: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		var frameSrc = window.location.origin +'/'+ sketchFrame.src;
		var data = {'msg':'pause'};
		window.postMessage( JSON.stringify(data), frameSrc);

		this.running = false;
	}

};