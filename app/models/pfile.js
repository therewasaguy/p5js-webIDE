var $ = require('jquery');
var Vue = require('vue');
var Path = require('path');

var pFile = function(name, contents, _id) {
	this._id = _id || null;

	// contents is the version of the file with any modifications
	this.contents = contents || '';

	// original contents is the last committed version of the file
	this.originalContents = contents || '';

	this.session = null;

	this.open = true;
	this.currentFile = false;
	this.ext = Path.extname(name);

	this.name = name || 'untitled';

	// TO DO: if files have no id but one of these names, load default
	var defaultFiles = ['index.html', 'p5.js', 'p5.sound.js', 'p5.dom.js', 'sketch.js', 'style.css'];

	if (defaultFiles.indexOf(name) > -1 && !this.contents) {
		this.setDefaultContents(name);
	}

};


pFile.prototype.setDefaultContents = function(fileName) {
	var self = this;

	var contents = $.ajax({
		// type: 'GET',
		dataType: 'text',
		url: '/sketch/template/' + fileName,
		success: function(filedata) {
			self.contents = String(contents.responseText);
			self.originalContents = self.contents;

			if (self.currentFile) {
				var e = new Event('loaded-file');
				e.file = self;
				document.dispatchEvent(e);
			}

		},
		error: function(e) {
			console.log('error ');
			console.log(e);
		}
	});

};


// when a commit is made, update the "original contents"
pFile.prototype.commitContents = function() {
	this.originalContents = this.contents;
};

// File.prototype.setContentsFromLatestP5 = function(fileName) {
// 	$.getJSON('https://api.github.com/repos/processing/p5.js/releases/latest', function(data) {
// 		data.assets.forEach(function(asset) {
// 			if (fileName === asset.name) {
// 				var url = asset.browser_download_url;
// 				$.get(url, function(contents) {
// 					this.contents = contents;
// 					console.log('got it');
// 					console.log(this);
// 				});
// 			}
// 		});
// 	});
// };

module.exports = pFile;