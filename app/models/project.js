var pFile = require('./pFile');

var Project = function(files) {
	this.id = null;

	// if no files are provided, set default files
	if (!files) {
		this.files = [ new pFile('p5.js'), new pFile('sketch.js', true), new pFile('index.html')];
	}

	this.name = 'new project';
	this.openFile ='sketch.js';
	this.openTabs = ['sketch.js'];
};

Project.prototype.findFile = function(name) {
	for (var i = 0; i < this.files.length; i++) {
		if (this.files[i].name === name) {
			return this.files[i];
		}
	}
};

Project.prototype.addFile = function(fileObj) {
	this.files.push(fileObj);
};

module.exports = Project;