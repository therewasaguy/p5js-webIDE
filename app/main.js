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

var modes = {
  p5web: require('./modes/p5/p5-web-mode')
};

Vue.config.debug = true;
Vue.config.silent = true;

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
		menu: require('./menu/index'),
		filemenu: require('./filemenu/index')
	},

	data: {
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
		recentProjects: [],
		examples: [],
		editorHidden: false
	},

	computed: {
		projectName: function() {
			return this.currentProject.name;
		},

		orientation: function() {
			var orientation = this.settings.consoleOrientation;
		},

		editorClass: function() {
			return this.settings.showEditor ? 'editor-visible' : 'editor-hidden';
		}
	},

	created: function() {
		var self = this;

		var pathname = window.location.pathname.split('/');
		if (pathname.length === 3) {

			// do not init a blank one, or one from local storage. We are loading one from db instead
			this.shouldLoadExistingProject = true;

			var username = pathname[1];
			var projectID = pathname[2];

			// get sketch from server
			$.ajax({
				url: '/loadproject',
				data: {username: username, projectID: projectID},
				type: 'GET',
				success: function(data) {
					var fileObjects = [];

					if (typeof(data) === 'string') {
						alert(data);
						window.open('/', '_self');
					}

					else {
						// // create files
						for (var i = 0; i < data.files.length; i++) {
							var dbFile = data.files[i];
							var newFile = new pFile(dbFile.name, dbFile.contents);
							fileObjects.push(newFile);
						}

						data.files = undefined;  // clear
						data.fileObjects = fileObjects;
					}

					var proj = new Project(data);
					proj.fileObjects = fileObjects;

					self.openProject(proj);
				}
			});
		}

		// get all example paths from server
		$.ajax({
			url: '/fetchexamples',
			type: 'GET',
			success: function(data) {
				var examples = [];

				for (var i = 0; i < data.length; i++) {

					var example = {
						'name': data[i].split('/').pop(),
						'path': data[i].slice(1,data[i].length)
					}
					examples.push(example);
				}

				self.examples = examples;
			}
		});

		// for testing
		window._app = this;

		// parse username and sketch ID

		// if (sketchID.length > 12) {
		// 	// get sketch from server
		// 	$.ajax({
		// 	  url: '/loadprojectbygistid',
		// 	  data: {'gistID': sketchID},
		// 	  success: gotsketchdata,
		// 		timeout: 8000,
		// 	  error: sketchdataerror
		// 	});
		// }

		// on success, load sketch
		function gotsketchdata(data) {

			newProjectFromGist( JSON.parse(data) );

		}

		// on fail, go to blank editor
		function sketchdataerror(e) {
			console.log('error with sketch data');
			console.log(e)
		}

		function newProjectFromGist(data) {
			var fileArray = [];
			var opentabnames = [];
			var openfile = '';

			var fileNames = Object.keys(data.files);

			for (var i = 0; i < fileNames.length; i++) {
				var key = fileNames[i];
				var f = data.files[key];
				console.log(f);

				fileArray.push(new pFile(f.filename, f.content) );
				opentabnames.push(f.filename);
				openfile = f.filename;
			}

			var options = {
				'fileObjects': fileArray,
				'name': data.id,
				'gistID': data.gistID,
				'openFileName': openfile,
				'openTabNames': opentabnames
			}

			var projObj = new Project(options);
			self.openProject(projObj)

		}

	},

	ready: function() {
		this.setupSettings();

		this.setupUser();

		if (!this.shouldLoadExistingProject) {
			this.initProject();
		}

		this.updateCurrentProject();

		this.$on('updateCurrentProject', this.updateCurrentProject);

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
			this.$watch('settings', function(value) {
				this.$broadcast('settings-changed', value);
				// this.editorHidden = !this.settings.showEditor;
				settings.save(value);
			})
		},

		toggleSettingsPane: function() {
			this.showSettings = !this.showSettings;
		},

		toggleFilemenu: function() {
			this.showFilemenu = !this.showFilemenu;
		},

		toggleSidebar: function() {
			console.log('toggle!');
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

					self.currentUser.authenticated = username && username.length > 0 ? true : false;
					console.log('user authenticated? ' + self.currentUser.authenticated);

					// load user recent projects if user is authenticated
					if (self.currentUser.authenticated) {
						console.log('recentProjects');
						self.recentProjects = self.findRecentUserProjects(self.currentUser);

						// set toast message
						self.$.menu.setToastMsg('Welcome back, ' + username);
					}


				})
				.fail(function(res) {

					// create a new user if there was not one in local storage
					if (!this.currentUser) {

						// current user remains annonymous
						// self.currentUser = new User();
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
			this.currentUser = new User();
			this.clearLocalStorage();
			window.open('/auth-logout', '_self');
		},

		clearLocalStorage: function() {
			window.localStorage.removeItem('recentProjects');
			window.localStorage.removeItem('user');
			window.localStorage.removeItem('latestProject');
		},

		// returns an array of recent user projects by ID
		findRecentUserProjects: function(user) {
			console.log(user);
			this.modeFunction('findRecentUserProjects', user);
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
			// var oldName = String(this.projectName);
			var newName = prompt('New project name:', this.projectName);
			if (newName) {
				this.currentProject.name = newName;
			}
		},

		closeProject: function() {
			var proj = this.currentProject;
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
		},

		openProject: function(projObj, gistData) {
			var self = this;
			// self.closeProject();

			self.currentProject = new Project(projObj);

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

			self.run();
		},

		// load project by our ID, not by the gistID
		loadProjectByOurID: function(projID) {
			var self = this;

			// if not logged in, open via '_'
			var username = this.currentUser.username ? this.currentUser.username : '_';
			window.open('/' + username + '/' + projID, '_self');

			// change url
			return;

			// // find project in the database (localStorage if offline...)
			// var projects = JSON.parse( localStorage.getItem('p5projects') );
			// var projObj = projects[ourID];
			// var gistID = projObj.gistID;

			// // open the project now
			// self.openProject(projObj)

			// // meanwhile, tell the server to fetch the gist data
			// $.ajax({
			// 	url: '/loadprojectbygistid',
			// 	type: 'get',
			// 	dataType: 'json',
			// 	data: {
			// 			'gistID': gistID,
			// 			'gh_oa': this.currentUser.gh_oa
			// 		}
			// 	})
			// 	.success(function(res) {
			// 		var gistData = res;
			// 		self.gotGistData(gistData);
			// 	})
			// 	.fail(function(res) {
			// 		console.log('error loading project' + res);
			// 	});
		},

		saveProjectToDatabase: function(proj) {
			this.modeFunction('saveProjectToDatabase', proj);
		},

		gotGistData: function(gistData) {
			console.log('got gist data!');
		},

		forkProject: function() {
			this.modeFunction('forkProject');
		},

		newProject: function(title, sketchContents) {
			this.modeFunction('newProject', title, sketchContents);
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
			this.$.editor.clearEditor();
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
			this.modeFunction('updateCurrentProject');
		},

		loadExample: function(listItem) {
			var self = this;
			var pathToExample = listItem.path.replace('/public', '');

			var name = listItem.name;

			// get example contents
			$.ajax({
				// type: 'GET',
				dataType: 'text',
				url: pathToExample,
				success: function(sketchContents) {

					// make examples full screen ~ they look cool!
					var createCanvasLines = sketchContents.match(/createCanvas\((.*?)\)/gmi);
					if (createCanvasLines.length === 1) {
						sketchContents = sketchContents.replace(createCanvasLines[0], 'createCanvas(windowWidth, windowHeight)');
					}

					if (typeof (sketchContents) == 'undefined') {
						self.$.menu.setToastMsg('Error loading sketch ' + name);
					} else {

						// create a new project with default files
						// except for a custom sketch and name

						var sketchFile = new pFile('sketch.js', sketchContents);
						console.log(sketchFile);

						var projectOptions = {
							'name': name,
							'openFileName': 'sketch.js',
							'openTabNames': ['sketch.js'],
							'fileObjects': [new pFile('p5.js'), sketchFile, new pFile('index.html'), new pFile('style.css')]
						}

						var newProj = new Project(projectOptions);
						self.closeProject();
						self.openProject(newProj)
					}

				},
				error: function(e) {
					console.log('fail');
				}
			});
		}

	}

};

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};