var pFile = require('./pFile');

// either load default file, or load new file;
var Project = function(options) {

	// if no options are provided, set default files
	if (!options) {
		/**
		 *  @property {Array} fileObjects Array of pFile objects
		 */
		this.fileObjects = [ new pFile('p5.js'), new pFile('sketch.js', true), new pFile('index.html'), new pFile('style.css')];

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
		 *  @property {String} id 	a unique ID for our application
		 */
		this.id = '_' + Math.random().toString(36).substr(2, 9);

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
		this.id = options.id;
		this.gistID = options.gistID;
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
};



module.exports = Project;