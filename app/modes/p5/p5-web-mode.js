var Project = require('../../models/project');
var $ = require('jquery');
var JSZip = require('jszip');
var FileSaver = require('../../libs/FileSaver.js');
var timeago = require('timeago');

module.exports = {

	/**
	 *  Create a new empty project and close out everything else
	 *  
	 *  @param  {String} title 
	 */
	newProject: function(title) {
		var proj;

		var name = title ? title : prompt('Project Name', 'Cool Sketch');
		proj = new Project();
		proj.name = name;
		console.log(proj.fileObjects);
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
		this.updateProjectInLocalStorage();
	},

	// called when user hits 'save to cloud'
	updateCurrentProject: function() {
		var self = this;
		var projectID = self.currentProject._id;

		// update date modified
		var dateModified = JSON.stringify(new Date());
		self.currentProject.dateModified = dateModified;

		// update file original contents to reflect the most recently committed version
		for (var i = 0; i < self.currentProject.fileObjects.length; i++) {
			var f = self.currentProject.fileObjects[i];
			f.originalContents = f.contents;
		}

		// add or update the localStorage project listing with { key: ID - value: dateModified }
		var projects = JSON.parse( localStorage.getItem('recentProjects') );
		if (!projects) projects = {};

		// update localstorage if there is a project id
		if (typeof(projectID) !== 'undefined') {
			projects[self.currentProject._id] = {
				'dateModified': self.currentProject.dateModified,
				'name' : self.currentProject.name
			}
			localStorage.setItem('recentProjects', JSON.stringify(projects));

			// add projectID to the user's table if it doesn't exist (theoretically this has already been done DB-side if user authenticated)
			if (self.currentUser.projects.indexOf(projectID) === -1) {
				self.currentUser.projects.push(projectID);
				localStorage.setItem('user', JSON.stringify(self.currentUser));
			}
		}

		// reload / display recent user projects
		self.sortRecentProjects(projects);
	},

	// sort by object, as stored in localStorage
	sortRecentProjects: function(projects) {
		var self = this;

		// var recentUserProjects = [];
		// var projIDs = Object.keys(projects);

		// for (var i = 0; i < projIDs.length; i++) {
		// 	var id = projIDs[i];
		// 	var name = projects[id].name;
		// 	var dateModified = projects[id].dateModified;
		// 	var dateAgo = timeago(dateModified);

		// 	recentUserProjects.push( {
		// 		name: name,
		// 		id: id,
		// 		timeago: dateAgo

		// 	});
		// }

		self.recentProjects = projects;
	},

	// get recent projects of an authenticated user from the database and reset recentProjects
	findRecentUserProjects: function(user) {
		var self = this;
		var projects = [];

		// start off with localstorage if it exists and user ID matches
		if (localStorage.recentProjects) {
			projects = JSON.parse( localStorage.getItem('recentProjects') );
			self.sortRecentProjects(projects); 
		}

		// // if user is not logged in, get recentProjects array from local storage
		if (!user.authenticated) {
			console.log('user not authenticated');
			return;
		}

		else {
			console.log('fetch user projects for user id: ' + user._id);

			$.ajax({
				url: '/api/projects?userID=' + user._id + '&limit=max',
				type: 'GET',
				success: function(projArray) {
					projects = [];

					for (var i = 0; i < projArray.length; i++) {
						var proj = projArray[i];

						var id = proj._id;
						var name = proj.name;
						var dateModified = proj.updated_at;
						var dateAgo = timeago(dateModified);
						var ownerID = proj.owner_id;

						projects.push({
							name: name,
							id: id,
							dateModified: dateModified,
							timestamp: new Date(dateModified).getTime(),
							owner_id: ownerID,
							timeago: dateAgo
						});
					}
					console.log(projects[10].timestamp);
					// update localStorage
					window.localStorage.removeItem('recentProjects');
					window.localStorage.setItem('recentProjects', JSON.stringify(projects));

					// reset recent projects
					self.recentProjects = projects;

				}
			});
		}
	},

	// save latest version of files to local storage
	autoSave: function() {
	},

	downloadZip: function() {
		var zip = new JSZip();
		var currentProjectFileNames = Object.keys(this.currentProject.fileObjects);

		for (var i = 0; i < currentProjectFileNames.length; i++) {
			var f = this.currentProject.fileObjects[ currentProjectFileNames[i] ];
			zip.file(f.name, f.contents);
		}

		var content = zip.generate({type:"blob"});

		FileSaver.saveAs(content, this.currentProject.name);
	},

	run: function() {

		// run in page
		if (this.settings.runInFrame) {
			console.log('run in page');
			var sketchFrame = document.getElementById('sketchFrame');
			sketchFrame.src = sketchFrame.src;
			this.$.debug.clearErrors();
		}

		// run in new window
		else {
			console.log('run in new window');
			this.openInNewWindow();
		}

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