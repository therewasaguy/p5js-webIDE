var jsdom = require('jsdom');
var jquery = require('jquery')(jsdom.jsdom().defaultView);

module.exports = {

	build: function(data, proj, res) {
		console.log('found the project, it belongs to this user');
		data.projName = proj.name;

		data.jsFiles = proj.files.filter(function(fileObj) {
			if (fileObj.name.substr(fileObj.name.length - 2) == 'js') {
				return true;
			} else {
				console.log(fileObj.name);
				return false;
			}
		});

		data.cssFiles = proj.files.filter(function(fileObj) {
			if (fileObj.name.substr(fileObj.name.length - 3) == 'css') {
				return true;
			} else {
				return false;
			}
		});

		var htmlIndexArray = proj.files.filter(function(fileObj) {
			if (fileObj.name == 'index.html') {
				return true;
			} else {
				return false;
			}
		});

		console.log(htmlIndexArray);

		data.htmlIndex = htmlIndexArray[0];

		// index contents will be only the body
		var docContents = data.htmlIndex.contents;
		var localScriptsInOrder = [];
		var docBody = '';

		// filter index.html to parse out scripts that we have locally
		jsdom.env({
			html: docContents,
			done: function(err, window) {
				var head = window.document.getElementsByTagName('head')[0];
				var scriptTags = window.document.getElementsByTagName('script');
				for (var i = 0; i < scriptTags.length; i++) {
					var sTag = scriptTags[i];
					var src = sTag.src;
					var indexOfMatch = 0;

					// to do: remove these items from the head ONLY if they refer to localfiles
					if (data.jsFiles.filter(function(f) {
						if (f.name == src) {
							indexOfMatch = data.jsFiles.indexOf(f);
							// remove src and change content of script tag
							jquery(sTag).removeAttr('src');
							jquery(sTag).text(data.jsFiles[indexOfMatch].contents);
							return true;
						} else {
							return false;
						}
					})) {

					}
				}

				var headContent = head.innerHTML;
				var bodyContent = window.document.getElementsByTagName('body')[0].innerHTML

				data.htmlHead = headContent;
				data.htmlBody = bodyContent;
				res.render('viewproject', data);
			}
		});
	}

}

