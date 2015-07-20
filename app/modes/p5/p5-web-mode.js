var Project = require('../../models/project');

module.exports = {

	newProject: function() {
		var proj = new Project();

		// load current file
		this.currentFile = proj.findFile(proj.openFile);

		// this.$broadcast('open-file', this.currentFile);

		// set up tabs
		for (var i = 0; i < proj.openTabs.length; i++) {
			var fileName = proj.openTabs[i];
			// if (fileName === currentFile.name) return; // dont duplicate tabs

			var fileObj = proj.findFile(fileName);
			this.$broadcast('add-tab', fileObj, this.tabs);
		}

		this.currentProject = proj;
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

		// focus to catch key and mouse events
		// setTimeout( sketchFrame.contentWindow.focus(), 1000 );

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