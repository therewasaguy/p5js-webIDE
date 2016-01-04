

module.exports = {

	// init example with reference to main
	initExample: function(sketchContents, name, main) {
		var pFile = require('./models/pfile');
		var Project = require('./models/project');

		// make examples full screen ~ they look cool!
		var createCanvasLines = sketchContents.match(/createCanvas\((.*?)\)/gmi);
		if (createCanvasLines.length === 1) {
			sketchContents = sketchContents.replace(createCanvasLines[0], 'createCanvas(windowWidth, windowHeight)');
		}

		if (typeof (sketchContents) == 'undefined') {
			main.$broadcast('Error loading sketch ' + name);
		} else {
			// create a new project with default files
			// except for a custom sketch and name
			var sketchFile = new pFile('sketch.js', sketchContents);

			var projectOptions = {
				'name': name,
				'openFileName': 'sketch.js',
				'openTabNames': ['sketch.js'],
				'fileObjects': [new pFile('p5.js'), new pFile('p5.dom.js'), new pFile('p5.sound.js'), sketchFile, new pFile('index.html'), new pFile('style.css')]
			}

			var newProj = new Project(projectOptions);
			main.closeProject();
			main.openProject(newProj);
		}
	}

}