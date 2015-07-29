var $ = require('jquery');
var Vue = require('vue');
var Path = require('path');

var pFile = function(name, isCurrentlyOpen) {
	this.id = null;

	// TO DO: either a string, or a function that returns file content
	this.contents = ''; 

	this.session = null;

	this.open = true;
	this.currentFile = isCurrentlyOpen || false;
	this.ext = Path.extname(name);

	this.name = name || 'untitled';

	var defaultFiles = ['index.html', 'p5.js', 'sketch.js', 'style.css'];

	if (defaultFiles.indexOf(name) > -1) {
		this.setDefaultContents(name);
	}


};


pFile.prototype.setDefaultContents = function(fileName) {
	var self = this;

	var contents = $.ajax({
		// type: 'GET',
		dataType: 'text',
		url: '../sketch/template/' + fileName,
		success: function(filedata) {
			self.contents = String(contents.responseText);

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

	// var contents = $.get('../sketch/template/' + fileName, function(data) {
	// 	self.contents = contents.responseText;
	// });
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