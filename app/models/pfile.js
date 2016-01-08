var $ = require('jquery');
var Path = require('path');
var AJAX = require('./../ajax');

/**
 *  [pFile description]
 *  @param  {String} name     name of file
 *  @param  {String} [contents] text content of file
 *                              or 'default' flag
 *  @param  {String} [_id]      id of file
 *  @return {PFile}          PFile object
 */
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
	var defaultFiles = ['sketch.js', 'style.css', 'index.html', 'p5.js', 'p5.sound.js', 'p5.dom.js'];

	if (defaultFiles.indexOf(name) > -1 && (!this.contents || this.contents == 'default')) {
		this.setDefaultContents(name);
	}

};

// set default contents for default files (index.html, p5.js, p5.sound, p5.dom, sketch.js)
pFile.prototype.setDefaultContents = function(fileName) {
	var self = this;
	var localFileExists = false;

	// ids of latest default content files:
	var latestIDs = {
		'p5.sound.js' : '568a02317811bb374d421bbe',
		'index.html' : '568ca5719bad3e030043ae45', //<-- no libraries by default
		'style.css' : '568ca5719bad3e030043ae44', // <-- css marign-right
		'p5.dom.js' : '568f651d52187803006890b1', /*! p5.dom.js v0.2.7 January 4, 2016 */
		'p5.js' : '568f650352187803006890b0', // /*! p5.js v0.4.21 January 04, 2016 */
		'sketch.js' : '568c2bab4b1e570300c16592'
	};

	var latestID = latestIDs[fileName];

	// if we have project locally and file has this id, then use it.
	// unless it's sketch.js
	if (fileName !== 'sketch.js') {
		var localFiles = localStorage.latestProject ? JSON.parse(localStorage.latestProject).fileObjects : [];
		for (var i = 0; i < localFiles.length; i++) {
			var f = localFiles[i];
			if (f.name === fileName) {
				if (f._id === latestID && f.originalContents == f.contents) {
					// duplicate props
					for (var k in f) {
						self[k]=f[k];
					}
					loadedFile();
				}
			}
		}
	}

	if (localFileExists) {
		console.log('already found ' + fileName + ' locally');
		return;
	} else {
		// otherwise, load contents from database...
		AJAX.getFiles([latestID], function(results) {
			var filedata = results[0];
			self.contents = filedata.contents;
			self.originalContents = self.contents;
			loadedFile();
		});
	}


	// once file has finished loading
	function loadedFile() {
		if (self.currentFile) {
			var e = new Event('loaded-file');
			e.file = self;
			document.dispatchEvent(e);
		}
		return;
	}

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