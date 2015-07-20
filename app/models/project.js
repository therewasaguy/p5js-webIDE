var File = require('./file');

var Project = function(files) {
	this.id = null;

	// if no files are provided, set default files
	if (!files) {
		this.files = [ new File('p5.js'), new File('sketch.js', true), new File('index.html')];
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

module.exports = Project;