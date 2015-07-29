var pFile = require('./pFile');

var Project = function(files) {

	// generate random unique id:
	this.id = '_' + Math.random().toString(36).substr(2, 9);
	this.gistID = null;

	// if no files are provided, set default files
	if (!files) {
		this.files = [ new pFile('p5.js'), new pFile('sketch.js', true), new pFile('index.html'), new pFile('style.css')];
	}

	this.name = 'new project';
	this.openFile ='sketch.js';
	this.openTabs = ['sketch.js', 'style.css'];


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