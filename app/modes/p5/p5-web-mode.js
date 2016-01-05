var Project = require('../../models/project');

var $ = require('jquery');
var JSZip = require('jszip');
var FileSaver = require('../../libs/FileSaver.js');

module.exports = {

	/**
	 *  Create a new empty project and close out everything else
	 *  
	 *  @param  {String} title 
	 */
	newProject: function(title) {
		var self = this;
		var proj;
		var name = title;

		// prompt for project name
		if (!name) {
			setTimeout(function() {
				self.$broadcast('prompt-general', {
					msg : 'Project Name',
					input: 'My sketch',
					callback: function(details){
						self.$emit('loading');
						gotName(details['gnrlinput']);
					}
				});
			}, 10);
		} else {
			gotName(name)
		}

		// if new name prompt succeeds:
		function gotName(name) {
			console.log('new name: ' + name);

			proj = new Project();
			proj.name = name;

			// close existing project
			self.closeProject();

			// load current file
			self.currentFile = proj.findFile(proj.openFileName);

			// this.$broadcast('open-file', this.currentFile);

			// set up tabs
			for (var i = 0; i < proj.openTabNames.length; i++) {
				var fileName = proj.openTabNames[i];
				// if (fileName === currentFile.name) return; // dont duplicate tabs

				var fileObj = proj.findFile(fileName);
				self.$broadcast('add-tab', fileObj, self.tabs);
			}

			// set current project
			self.currentProject = proj;
			self.updateProjectInLocalStorage();
		}
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

			this.$broadcast('clearErrors');
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