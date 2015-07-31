var Project = require('../../models/project');
var $ = require('jquery');
var AUTH = require('../../auth');

module.exports = {

	newProject: function(title) {
		var name = title ? title : prompt('Project Name', 'Cool Sketch');
		var proj = new Project();
		proj.name = name;

		// close existing project
		this.closeProject();

		// load current file
		this.currentFile = proj.findFile(proj.openFileName);
		// this.$broadcast('open-file', this.currentFile);

		// set up tabs
		for (var i = 0; i < proj.openTabNames.length; i++) {
			var fileName = proj.openTabNames[i];
			// if (fileName === currentFile.name) return; // dont duplicate tabs

			var fileObj = proj.findFile(fileName);
			this.$broadcast('add-tab', fileObj, this.tabs);
		}

		// set current project
		this.currentProject = proj;
	},

	getUserProjects: function() {
		var projects = JSON.parse(localStorage.getItem('p5projects'));
		var projectsToReturn = [];

		if (projects) {
			var projectKeys = Object.keys(projects);
			for (var i in projects) {
				var proj = projects[i];
				var projID = projects[i].id;

				// if the user owns this project, list it:
				if (this.currentUser.projects.indexOf(projID) > -1) {
					projectsToReturn.push(proj);
					console.log('project name: ' + proj.name + ', date modified: ' + proj.dateModified + 'gistID: ' + proj.gistID);
				}
			}
		} else {
			console.log('no recent projects');
		}
		return projectsToReturn;
	},


	// commit as a gist --> TO DO: move this to server side
	commitGist: function() {
		var self = this;

		var projectID = this.currentProject.id;
		var gistID = this.currentProject.gistID;

		var theFiles = {};
		var url = 'https://api.github.com/gists';
		var reqType = 'POST';

		// authenticate the user. If user is anonymous, use our default account.
		var oa = this.currentUser.gh_oa || AUTH.GH;

		var commitMessage = prompt('Describe what you changed', 'update');


		// if the project exists, patch an update
		if (gistID) {
			url += '/' + gistID;
			reqType = 'PATCH';
		}

		for (var i = 0; i < this.currentProject.fileObjects.length; i++) {
			var f = this.currentProject.fileObjects[i];
			theFiles[f.name] = {"content": f.contents};
		}

		var data = {
			"description": commitMessage,
			"public": true,
			"files": theFiles
		};

		$.ajax({
			url: url,
			type: reqType,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "token " + oa); 
			},
			dataType: 'json',
			data: JSON.stringify(data)})

		.success( function(res) {

			// save project gistID (only necessary if reqType === 'POST')
			self.currentProject.gistID = res.id;

			//   and update date modified
			var dateModified = JSON.stringify(new Date());
			self.currentProject.dateModified = dateModified;

			// update file original contents to reflect the most recently committed version
			for (var i = 0; i < self.currentProject.fileObjects.length; i++) {
				var f = self.currentProject.fileObjects[i];
				f.originalContents = f.contents;
			}

			// add or update the project listing
			var projects = JSON.parse( localStorage.getItem('p5projects') );
			if (!projects) projects = {};
			projects[projectID] = self.currentProject;
			localStorage.setItem('p5projects', JSON.stringify(projects));

			// add projectID to the user's table if it doesn't exist
			if (self.currentUser.projects.indexOf(projectID) === -1) {
				self.currentUser.projects.push(projectID);
				localStorage.setItem('user', JSON.stringify(self.currentUser));
			}

			self.findRecentUserProjects(self.currentUser);
			console.log(res);
		})

		.error( function(e) {
			console.warn('gist save error', e);
		});

	},

	// fork!
	forkProject: function() {
		// TO DO

		// var saveName = prompt('Save as ', this.projectName);

		// if (saveName) {
		// 	this.title = saveName;
		// 	this.currentProject.name = saveName;

		// 	// set date modified
		// 	var dateModified = new Date();
		// 	this.currentProject.dateModified = dateModified;

		// 	var projects = JSON.parse(localStorage.getItem('p5projects'));

		// 	if (!projects) {
		// 		projects = {};
		// 	}

		// 	//NO
		// 	// projects[this.title] = this.currentProject;

		// 	// TO DO: dont overwrite project names


		// 	localStorage.setItem('p5projects', JSON.stringify(projects));
		// }
	},

	// save latest version of files to local storage
	autoSave: function() {
	},

	downloadProject: function() {
		console.log('downloadProject!!!');
	},

	run: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		sketchFrame.src = sketchFrame.src;

		this.$.debug.clearErrors();

		// focus to catch key and mouse events
		// setTimeout( sketchFrame.contentWindow.focus(), 1000 );

		this.running = true;
	},

	stop: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		var frameSrc = window.location.origin +'/'+ sketchFrame.src;
		var data = {'msg':'stop'};
		window.postMessage( JSON.stringify(data), frameSrc);

		this.running = false;
	},

	// pause is not currently in use, sends a noLoop message
	pause: function() {
		var sketchFrame = document.getElementById('sketchFrame');
		var frameSrc = window.location.origin +'/'+ sketchFrame.src;
		var data = {'msg':'pause'};
		window.postMessage( JSON.stringify(data), frameSrc);

		this.running = false;
	}

};