var pFile = require('./pFile');

// either load default file, or load new file;
var Project = function(options) {

	// if no options are provided, set default files
	if (!options) {
		/**
		 *  @property {Array} files Array of pFile objects
		 */
		this.files = [ new pFile('p5.js'), new pFile('sketch.js', true), new pFile('index.html'), new pFile('style.css')];

		/**
		 *  [name description]
		 *  @type {String}
		 */
		this.name = 'new project';

		/**
		 *  @property {String} openFile name of the file that is open
		 */
		this.openFile ='sketch.js';

		/**
		 *  @property {Array} openTabs 	Name of the openTabs, as array of strings
		 */
		this.openTabs = ['sketch.js', 'style.css'];

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
		this.files = options.files;
		this.name = options.name;
		this.openFile = options.openFile;
		this.openTabs = options.openTabs;
		this.dateModified = options.dateModified;
		this.id = options.id;
		this.gistID = options.gistID;
	}

	this.findFile = function(name) {
		for (var i = 0; i < this.files.length; i++) {
			if (this.files[i].name === name) {
				return this.files[i];
			}
		}
	};

	this.addFile = function(fileObj) {
		this.files.push(fileObj);
	};

};



module.exports = Project;