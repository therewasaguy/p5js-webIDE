var pFile = require('./pFile');

// either load default file, or load new file;
var Project = function(options) {
	console.log('new project!!!!');
	console.log(options);
	if (options.fileObjects) {
		console.log(options.fileObjects);
	}
	// if no options are provided, set default files
	if (!options) {
		console.log('there were no options!');
		// is it necessary for the file to know if it is the current file?
		var sketchFile = new pFile('sketch.js');
		sketchFile.currentFile = true;

		/**
		 *  @property {Array} fileObjects Array of pFile objects
		 */
		this.fileObjects = [ new pFile('p5.js'), sketchFile, new pFile('index.html'), new pFile('style.css')];

		/**
		 *  [name description]
		 *  @type {String}
		 */
		this.name = 'new project';

		/**
		 *  @property {String} openFileName name of the file that is open
		 */
		this.openFileName ='sketch.js';

		/**
		 *  @property {Array} openTabNames 	Name of the openTabNames, as array of strings
		 */
		this.openTabNames = ['sketch.js', 'style.css'];

		/**
		 *  @property {String} _id 	a unique ID for our application, set by the database.
		 */
		this._id = null;

		/**
		 *  @property {String} gistID 	a unique ID for GitHub API
		 */
		this.gistID = null;
	}


	else {
		this.fileObjects = options.fileObjects || options.files;
		this.name = options.name;
		this.openFileName = options.openFileName || options.openFile;
		this.openTabNames = options.openTabNames || options.openTabs;
		this.dateModified = options.dateModified;
		this._id = options._id;
		this.gistID = options.gistID;
	}

	this.findFile = function(name) {
		console.log('looking for file ' + name);
		console.log(this.fileObjects);
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


};



module.exports = Project;