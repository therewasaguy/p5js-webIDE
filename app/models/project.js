// either load default file, or load new file;
var Project = function(options) {

	var pFile = require('./pfile');

	// if no options are provided, set default files
	if (!options) {
		// is it necessary for the file to know if it is the current file?
		var sketchFile = new pFile('sketch.js');
		sketchFile.currentFile = true;

		/**
		 *  @property {Array} fileObjects Array of pFile objects
		 */
		this.fileObjects = [ new pFile('p5.js'), sketchFile, new pFile('index.html'), new pFile('p5.sound.js'), new pFile('p5.dom.js'), new pFile('style.css')];

		/**
		 *  [name description]
		 *  @type {String}
		 */
		this.name = 'new project';
		this.originalName = 'new project';

		/**
		 *  @property {String} openFileName name of the file that is open
		 */
		this.openFileName ='sketch.js';

		/**
		 *  @property {Array} openTabNames 	Name of the openTabNames, as array of strings
		 */
		this.openTabNames = ['sketch.js'];

		/**
		 *  @property {String} _id 	a unique ID for our application, set by the database.
		 */
		this._id = null;

		/**
		 *  @property {String} gistID 	a unique ID for GitHub API
		 */
		this.gistID = null;
		this.owner_id = null;
		this.owner_username = null;

		this.public = false,
		this.tags = []
	}


	else {
		this.fileObjects = options.fileObjects || options.files;
		this.name = options.name;
		this.originalName = options.originalName || options.name;
		this.openFileName = options.openFileName || options.openFile;
		this.openTabNames = options.openTabNames || options.openTabs;
		this.dateModified = options.dateModified;
		this._id = options._id || null;
		this.gistID = options.gistID || null;
		this.owner_id = options.owner_id || null,
		this.owner_username = options.owner_username || null,

		this.public = options.public,
		this.tags = options.tags
	}

	this.findFile = function(name) {

		for (var i = 0; i < this.fileObjects.length; i++) {
			if (this.fileObjects[i].name === name) {
				return this.fileObjects[i];
			}
		}
	};

	this.addFile = function(fileObj) {
		this.fileObjects.push(fileObj);
	};

	this.removeFile = function(fileName) {

		for (var i = 0; i < this.fileObjects.length; i++) {
			if (this.fileObjects[i].name === name) {
				delete this.fileObjects[i];
			}
		}

	};

	// return true if unsaved (user doesnt own proj, or files have changed)
	// otherwise, false
	this.unsaved = function() {
		var currentUserID = localStorage.user ? JSON.parse(localStorage.user)._id : -1;

		if (this.owner_id !== currentUserID || this.name !== this.originalName) {
			return true;
		}

		for (var i = 0; i < this.fileObjects.length; i++) {
			var f = this.fileObjects[i];
			if (f.contents !== f.originalContents) {
				return true;
			}
		}
		return false;
	}

};



module.exports = Project;