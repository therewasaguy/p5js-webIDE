/**
 *  Files module to handle the file tree
 */

var _ = require('underscore');
var Path = require('path');


console.log(Path);

var Files = {

	/**
	 *  Setup a file
	 *  
	 *  @param  {String} path    path to file (relative to project root)
	 *  @param  {Object} options [description]
	 *  @return {File}         a file object that has been setup with options
	 */
	setup: function(path, options) {
		var name = Path.basename(path);
		var ext = Path.extname(path);

		// for now, path = name = id

		var fileObject = {
			name: name,
			path: path,
			id: path,
			ext: ext,
			type: 'file', // not sure why Vue throws unknown component: 'file' error here
			open: false,
			contents: '',
			originalContents: undefined
		};

		return _.extend(fileObject, options);
	},

	addToTree: function(fileObject, fileArray, projectRoot) {
		// if (Path.dirname(fileObject.path) === projectRoot && !Files.contains(fileArray, fileObject)) {
		fileArray.push(fileObject);
		return true;
		// }
		// to do: handle folders...
	},

	find: function(files, path) {
		var result = null;
		_find(files, path)
		return result;

		function _find(files, path) {
			if (result) return false;
			var f = _.findWhere(files, {
				path: path
			});
			if (f) {
				result = f;
				return true;
			}

			// to do: handle folders...

			// files.forEach(function(f) {
			// 	if (f.type === 'folder') {
			// 		_find(f.children, path)
			// 	}
			// })
		}
	}



};

module.exports = Files;