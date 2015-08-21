var Project = require('../../models/project');
var $ = require('jquery');
var JSZip = require('jszip');
var FileSaver = require('../../libs/FileSaver.js');
var timeago = require('timeago');

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

	// getUserProjects: function() {
	// 	console.log('get user projects');

	// 	var projects = JSON.parse(localStorage.getItem('p5projects'));
	// 	var projectsToReturn = [];

	// 	if (projects) {
	// 		var projectKeys = Object.keys(projects);
	// 		for (var i in projects) {
	// 			var proj = projects[i];
	// 			var projID = projects[i].id;

	// 			// if the user owns this project, list it:
	// 			if (this.currentUser.projects.indexOf(projID) > -1) {
	// 				projectsToReturn.push(proj);
	// 				console.log('project name: ' + proj.name + ', date modified: ' + proj.dateModified + 'gistID: ' + proj.gistID);
	// 			}
	// 		}
	// 	} else {
	// 		console.log('no recent projects');
	// 	}
	// 	return projectsToReturn;
	// },


	// commit as a gist --> TO DO: move this to server side
	commitGist: function() {
		var self = this;

		var gistID = this.currentProject.gistID;

		var theFiles = {};
		var url = 'https://api.github.com/gists';
		var reqType = 'POST';

		// authenticate the user. If user is anonymous, use our default account.
		// var oa = this.currentUser.gh_oa || GHOAUTH;

		var commitMessage = prompt('Describe what you changed', 'update');

		// save
		self.currentProject.state = 'syncing';

		for (var i = 0; i < this.currentProject.fileObjects.length; i++) {
			var f = this.currentProject.fileObjects[i];
			theFiles[f.name] = {"content": f.contents};
		}

		var data = {
			"description": commitMessage,
			"public": true,
			"theFiles": theFiles,
			"gistID": gistID,
		}

		$.ajax({
			url: '/savegist',
			type: 'POST',
			data: data,
			dataType: 'json'
		})
		.success( function(res) {

			// save gistID
			self.currentProject.gistID = res.id;
			self.currentProject.state = 'syncSuccess';

			self.$.menu.setToastMsg('Gist Saved Successfully');

			self.saveProjectToDatabase(self.currentProject);
		})
		.error( function(e) {
			console.log(e);
			self.currentProject.state = 'syncError';

			self.$.menu.setToastMsg('Error Saving Gist. Please Try Again');

			console.warn('gist save error');

			// save anyway...
			self.saveProjectToDatabase(self.currentProject);

		});

	},

	saveProjectToDatabase: function(proj) {
		var self = this;

		var data = {
			owner_username: this.currentUser.username,
			owner_id: this.currentUser._id,
			gistID: proj.gistID,
			name: proj.name,
			_id: proj._id,
			fileObjects: proj.fileObjects,
			openFileName: proj.openFileName,
			openTabNames: proj.openTabNames
		};

		console.log(data);

		$.ajax({
			url: '/saveproject',
			type: 'POST',
			data: data,
			dataType: 'json'
		})
		.success( function(res) {
			self.currentProject._id = res._id;
			self.$.menu.setToastMsg('Project Saved Successfully');

			self.$emit('updateCurrentProject');
			console.log(res);
		})
		.error( function(res) {
			self.currentProject._id = res._id;
			self.$emit('updateCurrentProject');

			self.$.menu.setToastMsg('There was an error saving. Please try again');

			console.log(res);
		})
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
		console.log('sorting...');

		var recentUserProjects = [];
		var projIDs = Object.keys(projects);

		for (var i = 0; i < projIDs.length; i++) {
			var id = projIDs[i];
			var name = projects[id].name;
			var dateModified = projects[id].dateModified;
			var dateAgo = timeago(dateModified);
			recentUserProjects.push( {
				name: name,
				id: id,
				timeago: dateAgo
			});
		}

		self.recentProjects = recentUserProjects;
	},

	// get recent projects of an authenticated user from the database and reset recentProjects
	findRecentUserProjects: function(user) {
		var self = this;
		var projects = [];
		var recentUserProjects = [];

		// // if user is not logged in, get recentProjects array from local storage
		if (!user.authenticated) {
			console.log('user not authenticated');

			projects = JSON.parse( localStorage.getItem('recentProjects') );
			sortRecentProjects(projects); 
		}

		else {
			console.log('fetch user projects for user id: ' + user._id);

			$.ajax({
				url: '/recentuserprojects',
				data: {
					'userID' : user._id,
					'username' : user.username
				},
				type: 'GET',
				success: function(projArray) {

					for (var i = 0; i < projArray.length; i++) {
						var proj = projArray[i];

						var id = proj._id;
						var name = proj.name;
						var dateModified = proj.updated_at;
						var dateAgo = timeago(dateModified);

						recentUserProjects.push({
							name: name,
							id: id,
							timeago: dateAgo
						});

						console.log('add a proj');
					}

					window.localStorage.removeItem('recentProjects');

					// reset recent projects
					self.recentProjects = recentUserProjects;

				}
			});
		}
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