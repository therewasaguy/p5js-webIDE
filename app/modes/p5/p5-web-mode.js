var Project = require('../../models/project');
var $ = require('jquery');
var AUTH = require('../../auth');

module.exports = {

	newProject: function() {
		var proj = new Project();

		// load current file
		this.currentFile = proj.findFile(proj.openFile);

		// this.$broadcast('open-file', this.currentFile);

		// set up tabs
		for (var i = 0; i < proj.openTabs.length; i++) {
			var fileName = proj.openTabs[i];
			// if (fileName === currentFile.name) return; // dont duplicate tabs

			var fileObj = proj.findFile(fileName);
			this.$broadcast('add-tab', fileObj, this.tabs);
		}

		// set current project
		this.currentProject = proj;
	},

	getUserProjects: function() {
		var projects = JSON.parse(localStorage.getItem('p5projects'));

		var projectKeys = Object.keys(projects);
		for (var i in projects) {
			var proj = projects[i];
			console.log('project name: ' + proj.name + ', date modified: ' + proj.dateModified);
		}
	},

	postGist: function(message) {
		var self = this;
		var theFiles = {};
		var gistID = '89cf6f57a379a907b071';
		// var gistID = this.currentProject.gistID ? this.currentProject.gistID : false;
		var url = 'https://api.github.com/gists';
		var reqType = 'POST';
		var oa = this.currentUser.gh_oa || AUTH.GH;
		var commitMessage = message || 'update';

		// if the project exists, patch an update
		if (gistID) {
			url += '/' + gistID;
			reqType = 'PATCH';
		}

		for (var i = 0; i < this.currentProject.files.length; i++) {
			var f = this.currentProject.files[i];
			theFiles[f.name] = {"content": f.contents};
			console.log(theFiles);
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
			self.currentProject.gistID = res.id;
			console.log(res);
		})
		.error( function(e) {
			console.warn('gist save error', e);
		});

	},

	saveAs: function() {
		var saveName = prompt('Save as ', this.projectName);
		if (saveName) {
			this.title = saveName;
			this.currentProject.name = saveName;

			// set date modified
			var dateModified = new Date();
			this.currentProject.dateModified = dateModified;

			var projects = JSON.parse(localStorage.getItem('p5projects'));

			if (!projects) {
				projects = {};
			}

			projects[this.title] = this.currentProject;

			// TO DO: dont overwrite project names

			// save to user's project list
			this.currentUser.projects[this.title]

			localStorage.setItem('p5projects', JSON.stringify(projects));
		}
	},

	autoSave: function() {
		// save latest version of files to local storage
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