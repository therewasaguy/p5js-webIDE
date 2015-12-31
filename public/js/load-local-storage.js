/**
 *  Loads all code from localstorage and injects it into the page.
 *  Inspired by doodledoo https://github.com/jrc03c/doodledoo/blob/gh-pages/p5js_sketch.html
 */

(function() {

	var project = JSON.parse(localStorage['latestProject']);
	var title = project.name;
	window.document.title = 'Preview ' + project.name;
	var fileArr = project.fileObjects;

	initCode(fileArr, window);

	// parse stuff
	// get all of the project files into a dictionary
	function initCode(fileArray, w) {
		var w = w || window;
		var fileDict = {};

		// create dictionaries to easily look up each type of file
		for (var i = 0; i < fileArray.length; i++) {
			fileDict[fileArray[i].name] = fileArray[i];
		}

		// parse html elements from body and the head of index.html
		var elems = parseIndexHTML(fileDict, w);
		var userHead = elems.head;
		var userBody = elems.body;

		// add elems from user code to frameHead and frameBody
		var frameHead = w.document.getElementsByTagName('head')[0];
		var frameBody = w.document.getElementsByTagName('body')[0];

		var userHeadChildren = [].slice.call(userHead.children);
		for (var i = 0; i < userHeadChildren.length; i++) {
			var elem = userHeadChildren[i];
			frameHead.appendChild(elem);
		}

		var userBodyChildren = [].slice.call(userBody.children);
		for (var i = 0; i < userBodyChildren.length; i++) {
			var elem = userBodyChildren[i];
			frameBody.appendChild(elem);
		}

		// add some more code to the body
		var ideCode = '';

		// create a new p5 otherwise p5 wont be instantiated
		// ideCode += '\n try { new p5();} catch(e){console.log("no p5");} ';

		var elem = injectJS(ideCode, w);
		frameBody.appendChild(elem);
	}

	/**
	 *  Find relative paths mentioned in the index.html file
	 *  and replace those script/link tags with the actual code.
	 *  
	 *  @param  {Object} fileDict a dictionary of the Project's files
	 *  @return {String}          Returns new contents as a string
	 */
	function parseIndexHTML(fileDict, w) {
		// w = window or sketchFrame.contentWIndow

		var indexHTMLFileObj = fileDict['index.html'];
		var contents = indexHTMLFileObj.contents;
		var newContents = removeComments(contents);

		// append elements to these elements
		var body = w.document.createElement('body');
		var head = w.document.createElement('head');

		// find if content belongs in the HEAD or the BODY, and append it there
		var headTag = newContents.match(/<head.*?>([\s\S]*?)<\/head>/gmi);
		var bodyTag = newContents.match(/<body.*?>([\s\S]*?)<\/body>/gmi);

		// figure out contents of the Head and Body and add them to the new head and body
		var regex = new RegExp('head', 'i');
		var headContents = headTag[0].split(regex)[1];
		headContents = headContents.slice(1, headContents.length-2); // remove extra junk
		head.innerHTML = headContents;

		var regex = new RegExp('body', 'i');
		var bodyContents = bodyTag[0].split(regex)[1]; //.split('>')[1].split('</')[0];
		bodyContents = bodyContents.slice(1, bodyContents.length-2);
		body.innerHTML = bodyContents;


		var scriptTagsInHead = headContents.match(/<script.*?>([\s\S]*?)<\/script>/gmi);
		var styleTagsInHead = headContents.match(/<link.*?([\s\S]*?)>/gmi);

		var scriptTagsInBody = bodyContents.match(/<script.*?>([\s\S]*?)<\/script>/gmi);
		var styleTagsInBody = bodyContents.match(/<link.*?([\s\S]*?)>/gmi);

		// script tags in head
		if (scriptTagsInHead) {
			scriptTagsInHead.forEach( function(tag) {

				var fileName = findFileNameInTag(tag, 'src');

				if (fileName) {

					try {
						var fileContents = fileDict[fileName].contents;

						// replace index.html tag with the actual contents
						var htmlTag = injectJS(fileContents, w);
						head.innerHTML = head.innerHTML.replace(tag, '');

						// add to body, if we add to head it wont load (why?)
						body.appendChild(htmlTag);

					} catch(e) {
						console.log(e);
						console.log('ERROR: Could not find a file named ' + fileName);
						return;
					}
				}
			});
		}

		// style tags in head
		if (styleTagsInHead) {
			styleTagsInHead.forEach( function(tag) {
				var fileName = findFileNameInTag(tag, 'href');

				if (fileName) {

					try {
						var fileContents = fileDict[fileName].contents;

						// replace index.html tag with the actual contents
						var htmlTag = injectCSS(fileContents, w);
						head.innerHTML = head.innerHTML.replace(tag, '');
						head.appendChild(htmlTag);

					} catch(e) {
						console.log('ERROR: Could not find a file named ' + fileName);
						// TO DO: throw error
						return;
					}

				}

			});
		}

		// script tags in BODY
		if (scriptTagsInBody) {
			scriptTagsInBody.forEach( function(tag) {

				var fileName = findFileNameInTag(tag, 'src');

				if (fileName) {

					try {
						var fileContents = fileDict[fileName].contents;

						// replace index.html tag with the actual contents
						var htmlTag = injectJS(fileContents, w);
						body.innerHTML = body.innerHTML.replace(tag, '');
						body.appendChild(htmlTag);

					} catch(e) {
						console.log('ERROR: Could not find a file named ' + fileName);
						return;
					}
				}

			});
		}

		// style tags in body
		if (styleTagsInBody) {
			styleTagsInBody.forEach( function(tag) {
				var fileName = findFileNameInTag(tag, 'href');

				if (fileName) {

					try {
						var fileContents = fileDict[fileName].contents;

						// replace index.html tag with the actual contents
						var htmlTag = injectCSS(fileContents, w);
						body.innerHTML = body.innerHTML.replace(tag, '');
						body.appendChild(htmlTag);

					} catch(e) {
						console.log('ERROR: Could not find a file named ' + fileName);
						// TO DO: throw error
						return;
					}

				}

			});
		}

		return {'head': head, 'body': body};
	}



	/**
	 *  Helper function to parse file names from script/link tags in index.html file
	 *  
	 *  @param  {String} tag     tag from an index.html
	 *  @param  {String} tagType 'src' or 'href'
	 *  @return {[type]}         [description]
	 */
	function findFileNameInTag(tag, tagType) {
		var splits, fileName;
		var regex = new RegExp(tagType, 'i');
		var tagSplit = tag.split(regex);

		if (tagSplit.length === 1) {
			// no src tag
			return null;
		}

		var srcTag = tagSplit[1];

		// match single or double quotes, possibly with spaces
		var src = srcTag.match(/"[^\\"\n]*(\\["\\][^\\"\n]*)*"|'[^\\'\n]*(\\['\\][^\\'\n]*)*'|\/[^\\\/\n]*(\\[\/\\][^\\\/\n]*)*\//);
		src = src[0];

		// split at either single or double quotes
		splits = src.indexOf("\'") > -1 ? src.split("\'") : splits = src.split("\"");

		fileName = splits[1];

		// if filename is an external file, i.e. contains //, then do not replace its contents
		if (fileName.indexOf('//') > -1) {
			console.log('load external js file: ' + fileName);
			return null;
		}

		// otherwise return the filename
		return fileName;
	}



	function injectJS(someCode, w) {
		var w = w || window;
		var userScript = w.document.createElement('script');
		userScript.type = 'text/javascript';
		userScript.text = someCode;
		userScript.async = false;
		return userScript;
	}


	function injectCSS(someCode, w) {
		var w = w || window;
		var userStyle = w.document.createElement('style');
		userStyle.type = 'text/css';
		userStyle.innerText = someCode;
		return userStyle;
	}

	/**
	 *  add input as innerhtml of a div
	 *  
	 *  @param  {String} someCode [description]
	 *  @return {[type]}          [description]
	 */
	function injectDIV(someCode, w) {
		var w = w || window;
		var userHTML = w.document.createElement('div');
		userHTML.className = 'userHTML';
		userHTML.innerHTML = someCode;
		return userHTML;
	}

	function removeComments(contents) {
		// remove comments
		var htmlComments = contents.match(/<!--(.|\s)*?-->/g);

		if (htmlComments) {
			htmlComments.forEach( function(comment) {
				contents = contents.replace(comment, '');
			});
		}
		return contents;
	}
})();