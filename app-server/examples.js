/**
 *  list all of the examples
 */

var fs = require('fs');
var path = require('path');

var exampleDir = "./public/examples_src"
var subDirs = [ '00_Structure',
								'01_Form',
								'02_Data',
								'03_Arrays',
								'04_Control',
								'05_Image',
								'07_Color',
								'08_Math',
								'09_Simulate',
								'11_Objects'
							];

// get proper prefixes for examples
var directoryAlias = {
	'./public/examples_src/00_Structure' : 'Structure',
	'./public/examples_src/01_Form' : 'Form',
	'./public/examples_src/02_Data' : 'Data',
	'./public/examples_src/03_Arrays' : 'Arrays',
	'./public/examples_src/04_Control' : 'Control',
	'./public/examples_src/05_Image' : 'Image',
	'./public/examples_src/07_Color' : 'Color',
	'./public/examples_src/08_Math' : 'Math',
	'./public/examples_src/09_Simulate' : 'Simulate',
	'./public/examples_src/11_Objects' : 'Objects',
	'./public/examples_src/15_Instance_Mode' : 'Instance Mode',
	'./public/examples_src/16_Dom' : 'Dom',
	'./public/examples_src/33_Sound' : 'Sound',
	'./public/examples_src/35_Mobile' : 'Mobile'
}

module.exports = {

	fetchExamples: function(callback) {

		// thank you http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
		var walk = function(dir, done) {
		  var results = [];
		  fs.readdir(dir, function(err, list) {

		  	//
		  	var prefix = directoryAlias[dir];

		    if (err) return done(err);
		    var i = 0;
		    (function next() {
		      var filePath = list[i++];
		      if (!filePath) return done(null, results);
		      filePath = dir + '/' + filePath;
		      fs.stat(filePath, function(err, stat) {
		        if (stat && stat.isDirectory()) {
		          walk(filePath, function(err, res) {
		            results = results.concat(res);
		            next();
		          });
		        } else {
		          results.push({
		          	'folder' : prefix,
								'name': filePath.split('/').pop().split('.js')[0].split(/_(.+)?/)[1].replace(/_/g, ' '),
								'path': filePath.slice(1,filePath.length) // <-- necessary to chop off . ?
		          });
		          next();
		        }
		      });
		    })();
		  });
		};

		walk(exampleDir, callback);

	}

}