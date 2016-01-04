var Vue = require('vue');

var ace = require('brace');
var settings = require('./settings');
var debugView = require('./debug');
var $ = require('jquery');
var Files = require('./files');

var pFile = require('./models/pfile');
var Project = require('./models/project');
var User = require('./models/user');

require('./keybindings');

var AJAX = require('./ajax');

var modes = {
  p5web: require('./modes/p5/p5-web-mode')
};

// extend Vue with custom components

Vue.config.debug = true;
Vue.config.silent = true;

/**
 *  this is the app config
 *  
 *  @type {Object}
 */
var appConfig = {
	el: '#app',

	mode: modes.p5web,

	components: {
		editor: require('./editor/index'),
		settings: require('./settings/index'),
		tabs: require('./tabs/index'),
		sidebar: require('./sidebar/index'),
		sketchframe: require('./sketchframe/index'),
		debug: require('./debug/index'),
		pmenu: require('./menu/index'),
		floatingmenu: require('./floatingmenu/index'),
		pdialog: require('./dialog/index'),
		sketchbook: require('./sketchbook/index')
	},

	data: function() {
		return {
			shouldLoadExistingProject: false, // if url points to an existing project
			settings: {},
			showSettings: false,
			showFilemenu: false,
			tabs: [],
			files: [],
			running: false,
			fileTypes: ['txt', 'html', 'css', 'js', 'json', 'scss', 'xml', 'csv', 'less'],
			currentFile: null,
			currentProject: null,
			currentUser: null,

			// redundant, but helps watch computed userOwnsProject property
			currentUserID: null,
			currentProjectOwnerID: null,

			recentProjects: [],
			examples: [],
			editorHidden: false,
			newWindowOpen: -1
		}
	},

	// maybe not necessary since it's already in data
	running: false,

	computed: {
		projectName: {
			get: function() {
				return this.currentProject != undefined ? this.currentProject.name : '';
			},
			set: function(newVal) {
				this.currentProject.name = newVal;
			}
		},

		orientation: function() {
			var orientation = this.settings.consoleOrientation;
			return orientation;
		},

		editorContainerClass: function() {
			var c = this.settings.showEditor ? '' : 'editor-hidden';
			if (c == '' && !this.settings.runInFrame) {
				c = 'expanded';
			}
			return c;
		},

		floatingMenuClass: function() {
			var showHide = this.settings.showEditor ? 'expanded' : 'collapsed';
			var draggable = this.settings.runInFrame && this.running ? 'draggable' : 'prevent-drag';
			return showHide + ' ' + draggable;
		},

		theme: function() {
			return this.settings.editorTheme;
		},

		// redundant, but helps watch computed userOwnsProject property
		userOwnsProject: function() {
			if (this.currentUserID !== null && this.currentProjectOwnerID !== null && this.currentUserID === this.currentProjectOwnerID) {
				return true;
			} else {
				return false;
			}
		},

		isLoading: function() {
			return this.$root.shouldLoadExistingProject ? 'content-loading' : '';
		},

		authenticated: function() {
			return this.currentUser && this.currentUser.authenticated;
		},
	},

	created: function() {
		var self = this;
		var projectID = undefined;
		var username = undefined;

		// get projectID
		// #?sketch=567fa42b489845b161b3c11a (preferred)
		var theHash = window.location.hash.split('#')[1];
		if (theHash && theHash.indexOf('sketch') > -1) {
			projectID = getQueryVariable('sketch', theHash.split('?')[1]);
			username = getQueryVariable('user', theHash.split('?')[1]);
		}

		// compare with localStorageID
		var latestProj = localStorage.latestProject ? JSON.parse(localStorage.latestProject) : {_id:-1};
		if (projectID && (projectID !== latestProj._id)) {
			AJAX.loadProject(projectID, self);
		}
		// otherwise, resume recent project


		// get all example paths from server
		$.ajax({
			url: '/fetchexamples',
			type: 'GET',
			success: function(data) {
				// exampleObj: {
				// 	'folder' : 'dom',
				// 	'name': 'friendly name'
				// 	'path': filePath
				// }
				self.examples = data;
			}
		});

		// // for testing
		window._app = this;

		// on fail, go to blank editor

		/**
		 *  callback if there is an error getting sketch data
		 *  
		 *  @param  {Error} e The error
		 */
		function sketchdataerror(e) {
			console.log('error with sketch data');
			console.log(e)
		}

	},

	ready: function() {
		// might use this to re-open the window
		window.name = 'p5webide';

		this.setupSettings();

		this.setupUser();

		if (!this.shouldLoadExistingProject) {
			this.initProject();
		}

		// this.updateCurrentProject();

		this.$on('updateCurrentProject', this.updateCurrentProject);
		this.$on('open-sketchbook', this.openSketchbook);
		this.updatePageHash();

	},

	methods: {
		//runs a function named func in the mode file currently being used
		modeFunction: function(func, args) {
			var mode = this.$options.mode;
			if (typeof mode[func] === 'function') {
				// make args an array if it isn't already
				// typeof args won't work because it returns 'object'
				if (Object.prototype.toString.call(args) !== '[object Array]') {
				  args = [args];
				}
				mode[func].apply(this, args);
			}
		},

		setupSettings: function() {
			this.settings = settings.load();
			this.$on('settings-view-changed', this.broadcastSettingsChanged);
		},

		// when settings are updated via settings view
		broadcastSettingsChanged: function(settings) {
			this.$broadcast('settings-changed', settings);

			// saveSettings
			localStorage.userSettings = JSON.stringify(settings);
		},

		toggleSettingsPane: function() {
			this.showSettings = !this.showSettings;
		},

		toggleFilemenu: function() {
			this.showFilemenu = !this.showFilemenu;
		},

		toggleSidebar: function(e) {
			this.settings.showSidebar = !this.settings.showSidebar;
		},

		toggleRun: function() {
			if (this.running) {
				this.stop();
			} else {
				this.run();
			}
		},

		stop: function() {
			this.modeFunction('stop');
			// this.$broadcast('clearErrors');
			// show editor
			this.editorHidden = false;
		},

		run: function() {
			this.modeFunction('run');
		},


		initProject: function() {
			// if there is a recent project in local storage, load it.
			var latestProj = JSON.parse( localStorage.getItem('latestProject') );
			if (latestProj) {
				this.openProject(latestProj);
			}

			// Otherwise, load default
			else {
				this.newProject('Hello p5');
			}

		},

		// handle users
		setupUser: function() {
			var self = this;

			// get current user from local storage
			if (localStorage.user) {
				self.currentUser = JSON.parse( localStorage.getItem('user') );
			} else {
				self.currentUser = new User();
			}

			$.ajax({
					url: '/authenticate',
					type: 'get'
				})
				.success(function(res) {

					var username = res.username;
					var id = res._id;
					self.currentUser.username = username;
					self.currentUser._id = id;
					self.currentUserID = id; // redundant but necessary for watching property?

					self.currentUser.authenticated = username && username.length > 0 ? true : false;
					console.log('user authenticated? ' + self.currentUser.authenticated);

					// load user recent projects if user is authenticated
					if (self.currentUser.authenticated) {
						self.recentProjects = self.findRecentUserProjects(self.currentUser);

						// set toast message
						self.$broadcast('toast-msg', 'Welcome back, ' + username);
					}

					localStorage.setItem('user', JSON.stringify(self.currentUser));

				})
				.fail(function(res) {

					// create a new user if there was not one in local storage
					if (!this.currentUser) {

						// current user remains annonymous
						self.currentUser = new User();
						localStorage.setItem('user', JSON.stringify(self.currentUser));
					}

					// TO DO: reset recent projects
					console.log('ERROR');
					// self.recentProjects = []; //self.findRecentUserProjects(self.currentUser);

				});
		},

		authenticate: function() {
			window.open('/auth-gh', '_self');
		},

		logOut: function() {
			this.clearLocalStorage();
			window.open('/auth-logout', '_self');
		},

		clearLocalStorage: function() {
			window.localStorage.removeItem('recentProjects');
			window.localStorage.removeItem('user');
			window.localStorage.removeItem('latestProject');
			window.localStorage.clear();
		},

		// returns an array of recent user projects by ID
		findRecentUserProjects: function(user) {
			// this.modeFunction('findRecentUserProjects', user);
			AJAX.findRecentUserProjects(user, this);
		},

		sortRecentProjects: function(projects) {
			this.modeFunction('sortRecentProjects', projects);
		},

		// HANDLE FILES
		newFile: function() {
			var title = prompt('Choose a file name and type: \nSupported types: ' + this.fileTypes.toString()).replace(/ /g,'');
			var dotSplit = title.split(".");
			var re = /(?:\.([^.]+))?$/;

			if (!title) return false;

			if (this.fileTypes.indexOf(re.exec(title)[1]) < 0 || (dotSplit.length > 2)){
				window.alert("unsupported/improper file type selected.\nAutomaticallly adding a .js extension");
				title = dotSplit[0] + '.js';
			}

			var filename = title;

			var f = new pFile(filename);
			this.currentProject.addFile(f);
			this.openFile(f.name);

		},

		/**
		 *  open file by filename
		 */
		openFile: function(fileName, callback) {
			var file = this.currentProject.findFile(fileName);

			if (!file) {
				console.log('error opening file, it must first be added to project (maybe?)')
				return false;
			}

			this.currentFile = file;
			this.currentFile.open = true;
			this.$broadcast('open-file', this.currentFile);

			// find if there is a matching tab, only add if tab isnt already there
			var tabAlreadyExists = this.tabs.filter( function(tab) {
				return tab.name === file.name;
			});

			if (tabAlreadyExists.length === 0) {
				this.$broadcast('add-tab', this.currentFile, this.tabs);
			}

		},

		closeFile: function(fileName) {
			this.$broadcast('close-file', fileName);
			this.closeTab(fileName);
			// self.removeFileFromProject(fileObj);
		},

		closeTab: function(fileName) {
			if (!fileName) {console.log('closeFile without fileName!')};
			var fileToClose = fileName || this.currentFile.name;
			this.$broadcast('close-tab', fileToClose, this.tabs);
		},

		removeFileFromProject: function(fileName) {
			this.currentProject.removeFile(filename);
			this.closeTab(fileName);
		},

		renameProject: function() {
			var self = this;

			var callback = function(vars) {
				var newName = vars.newName;
				self.projectName = newName;

				// update project name in local storage
				self.updateProjectInLocalStorage();
			};

			// prompt dialog for new name, then update name
			self.$broadcast('prompt-rename', callback);
		},

		closeProject: function() {
			var proj = this.currentProject;
			if (proj != undefined) {

				var self = this;
				var filesToClose = [];
				this.editSessions = [];

				// populate the array of filesToClose
				self.tabs.forEach(function(tab) {
					var fileName = tab.name;
					var fileObj = proj.findFile(fileName);
					filesToClose.push(fileObj);
				});

				// close the files' tabs
				filesToClose.forEach(function(fileObj) {
					self.closeFile(fileObj.name);
				});


				proj.fileObjects = [];
				this.stop();
			}
		},

		openProject: function(projObj, gistData) {
			var self = this;

			self.currentProject = new Project(projObj);
			self.currentProjectOwnerID = projObj.owner_id; // redundant but necessary for watching properties?
			self.currentUserID = self.currentUser._id; // redundant?

			var curFileName = self.currentProject.openFileName;
			self.currentFile = self.currentProject.findFile(curFileName);
			self.openFile(self.currentFile.name);

			// self.$broadcast('open-file', self.currentProject.openFile);
			var tabNames = self.currentProject.openTabNames;

			for (var i = 0; i < tabNames.length; i++) {
				var tabName = tabNames[i];
				var fileObj = self.currentProject.findFile(tabName);

				if (typeof(fileObj) !== 'undefined') {
					self.$broadcast('add-tab', fileObj, self.tabs);
				} else {
					console.log('error loading file ' + tabName);
				}
			}

			// in case loading bar was visible, hide it:
			self.shouldLoadExistingProject = false;

			self.updateProjectInLocalStorage();
		},

		// load project by our ID, not by the gistID
		loadProjectByOurID: function(projID) {
			var self = this;

			// confirm before loading a new project
			if (self.currentProject && self.currentProject.unsaved() ) {
				this.$broadcast('prompt-general', {
					msg : 'Unsaved changes. Are you sure?',
					callback: okToLoad
				});
			} else {
				okToLoad();
			}

			// if ok to load
			function okToLoad() {
				self.closeProject();
				AJAX.loadProject(projID, self);
			}
		},

		saveAs: function() {
			var self = this;

			var callback = function(vars) {
				var newName = vars.newName;
				self.projectName = newName;
				self.saveToCloud('saveAs');
			};

			// prompt dialog for new name, then saveToCloud
			self.$broadcast('prompt-save-as', callback);
		},

		/**
		 *  Save to DB. This method handles saving new versions of
		 *  existing projects, forking, "save As" and saving new projects.
		 *  
		 *  @param  {String} flag Options: 'saveAs'
		 *  @return {[type]}        [description]
		 */
		saveToCloud: function(flag) {
			console.log('save to cloud', flag);

			this.$broadcast('toast-msg', 'Saving...', true);

			// var projectData = JSON.parse(localStorage.latestProject);
			var projectData = this.currentProject;

			var filesClean = [];
			var filesRaw = projectData.fileObjects;


			for (var i = 0; i < filesRaw.length; i++) {
				// original file data
				var fRaw = filesRaw[i];

				// file date necessary to send to server
				var fClean = {};

				// only save files if they dont have an ID or if their content was modified
				if (fRaw.contents !== fRaw.originalContents || fRaw._id == undefined) {
					// TO DO: only apply diff instead of all contents
					// fClean.contents = fRaw.contents;
					fClean.contentsChanged = fRaw.contents;
				}
					fClean._id = fRaw._id;
					fClean.name = fRaw.name;
					filesClean.push(fClean);
			}

			var postData = {
				_id: projectData._id,
				name: projectData.name,
				openFileName: projectData.openFileName,
				openTabNames: projectData.openTabNames,
				owner_id: projectData.owner_id,
				owner_username: projectData.owner_username,
				currentUserID: this.currentUser._id,
				currentUsername: this.currentUser.username,
				filesClean: filesClean,
				flag: flag // handle saveAs
				// fileObjects: Array[6],
				// gistID: null,
			};

			// save might not be necessary...
			if (this.currentProject.unsaved() || flag == 'saveAs') {
				// save files...
				AJAX.saveProject(postData, this);
			}
			else {
				this.$broadcast('toast-msg', 'Project is already up to date');
			}
		},

		// parse pre-December 2015 projects
		parseProjectOld: function(data) {
			var fileObjects = [];
			for (var i = 0; i < data.files.length; i++) {
				var dbFile = data.files[i];
				var newFile = new pFile(dbFile.name, dbFile.contents);
				fileObjects.push(newFile);
			}

			data.files = undefined;  // clear
			data.fileObjects = fileObjects;

			var proj = new Project(data);
			this.openProject(proj);
		},

		parseProject: function(data, callback) {
			var self = this;
			var fileObjects = [];
			var filesToGet = []; // array of file IDs w/o content

			for (var i = 0; i < data.pFiles.length; i++) {
				// TO DO: if we already have the file id locally,
				// dont load it

				// update current files and count down load count
				filesToGet.push(data.pFiles[i]._id);
			}

			AJAX.getFiles(filesToGet, gotFiles);

			function gotFiles(filesWeGot) {

				filesWeGot.forEach(function(dbFile) {
					var newFile = new pFile(dbFile.name, dbFile.contents, dbFile._id);
					fileObjects.push(newFile);
				})

				data.files = undefined;  // clear
				data.fileObjects = fileObjects;

				// once all files have loaded, open sketch...
				var proj = new Project(data);
				self.openProject(proj);
			}
		},

		// not used Dec 2015?
		// saveProjectToDatabase: function(proj) {
		// 	console.log('save proj to database');
		// 	console.log(proj);
		// 	this.modeFunction('saveProjectToDatabase', proj);
		// },

		// not used Dec 2015?
		gotGistData: function(gistData) {
			console.log('got gist data!');
		},

		forkProject: function() {
			this.modeFunction('forkProject');
		},

		newProject: function(title, sketchContents) {
			var self = this;

			var callback = function() {
				self.modeFunction('newProject', title, sketchContents);
			};

			// if contents are unsaved, prompt: are you sure?
			if (this.currentProject && this.currentProject.unsaved() ) {
				this.$broadcast('prompt-general', {
					msg : 'Unsaved changes. Are you sure?',
					callback: callback
				});
			} else {
				callback();
			}
		},

		downloadProject: function() {
			this.modeFunction('downloadProject');
		},

		commitGist: function() {
			this.modeFunction('commitGist');
		},

		downloadZip: function() {
			this.modeFunction('downloadZip');
		},

		clearEditor: function() {
			this.$broadcast('clear-editor');
		},

		// toggle whether to show or hide the editor
		toggleEditor: function() {
			this.editorHidden ? this.showEditor() : this.hideEditor();
		},

		hideEditor: function() {
			this.editorHidden = true;
			this.settings.showEditor = false;
		},

		showEditor: function() {
			this.editorHidden = false;
			this.settings.showEditor = true;
		},

		updateCurrentProject: function() {
			console.log('update current project was called (save now?)')
			// this.modeFunction('updateCurrentProject');
		},

		loadExample: function(listItem) {
			var self = this;

			// confirm before loading a new project
			if (self.currentProject && self.currentProject.unsaved() ) {
				this.$broadcast('prompt-general', {
					msg : 'Unsaved changes. Are you sure?',
					callback: okToLoad
				});
			} else {
				okToLoad();
			}

			// if ok to load
			function okToLoad() {
				self.closeProject();
				AJAX.loadExample(listItem, self);
			}
		},

		openShareDialog: function() {
			this.$broadcast('open-share-dialog');
		},

		/**
		 *  Stringify the current project data and
		 *  save it in local storage. This is useful
		 *  for autosaving and for saving new projects.
		 *  
		 *  @param  {String} [oldID] Previous ID of the project
		 *                           if the hash should change
		 *                           after saving. (optional)
		 */
		updateProjectInLocalStorage: function(oldID) {
			var self = this;

			// not sure why but this has been necessary to avoid empty 'content' for files
			setTimeout( function() {
				localStorage.latestProject = JSON.stringify(self.currentProject);

				if (oldID || window.location.hash == '') {
					self.updatePageHash(oldID);
				}
			}, 1);

		},

		/**
		 *  Update page hash i.e. #?sketch=newProjectID
		 *  @param  {String} [oldProjID] oldProjectID if there was one.
		 */
		updatePageHash: function(oldProjID) {
			var self = this;
			console.log('update page hash');
			if (!self.currentProject || self.currentProject._id == undefined) {
				window.location.hash = '';
				return;
			}
			if (window.location.hash.length == 0 || self.currentProject._id != oldProjID) {
				window.location.hash = '?sketch=' + self.currentProject._id;
			}
		},

		/**
		 *  Run current project in a new window at ./preview
		 *  
		 *  @method  openInNewWindow
		 */
		openInNewWindow: function() {

			// save latest code to localStorage, and a very short setTimeout to allow the code to finish saving
			this.updateProjectInLocalStorage();

			setTimeout(function() {

				// view draft -->
				if (this.newWindowOpen) {
					// the open tab will know to refresh
					try {
						this.newWindowOpen.location.reload();
						this.newWindowOpen.focus();
						return;
					} catch(e) {}
				}

				this.newWindowOpen = window.open(window.location.protocol + '//' + window.location.host + '/preview'); 
				return;
			}, 10);
		},

		// not currently used, was related to openInNewWindow
		openSavedProjectInNewWindow: function() {
			/*** open saved project: ***/

			// this only works if a project is saved
			var pathname = window.location.pathname.split('/');
			var username = pathname[1];
			var projectID = pathname[2];

			if (!username || !projectID) {
				alert('please save project before opening in a new window')
				return false;
			}

			// TO DO: open without fetching code from server

			// TO DO: refresh if a window is already open (is this possible?)

			// this opens saved project
			if (this.newWindowOpen) {
				// the open tab will know to refresh
				this.newWindowOpen.postMessage('newcode', window.localStorage.fileObjects);
			} else {
				this.newWindowOpen = window.open('http://' + window.location.host + '/view/' + username + '/' + projectID); 
			}
		},

		openSketchbook: function() {
			this.$broadcast('open-sketchbook');
		}

		// set project ID in localStorage (no longer necessary ?)
		// updateCurrentProjectID: function(projectID) {
		// 	localStorage.projectID = projectID;
		// }

	},



};

// http://stackoverflow.com/a/2091331/2994108
function getQueryVariable(variable, str) {
    var query = str || window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};