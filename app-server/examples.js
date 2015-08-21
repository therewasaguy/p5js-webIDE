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

module.exports = {

	fetchExamples: function(callback) {

		// thank you http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
		var walk = function(dir, done) {
		  var results = [];
		  fs.readdir(dir, function(err, list) {
		    if (err) return done(err);
		    var i = 0;
		    (function next() {
		      var file = list[i++];
		      if (!file) return done(null, results);
		      file = dir + '/' + file;
		      fs.stat(file, function(err, stat) {
		        if (stat && stat.isDirectory()) {
		          walk(file, function(err, res) {
		            results = results.concat(res);
		            next();
		          });
		        } else {
		          results.push(file);
		          next();
		        }
		      });
		    })();
		  });
		};

		walk(exampleDir, callback);

	}

}