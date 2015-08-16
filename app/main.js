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
			return this.editorHidden ? 'editor-hidden' : 'editor-visible';
		}
	},

	created: function() {
		var self = this;
		var sketchID = window.location.pathname.split('/').pop();

		if (sketchID.length > 12) {
			// get sketch from server
			$.ajax({
			  url: '/loadprojectbygistid',
			  data: {'gistID': sketchID},
			  success: gotsketchdata,
				timeout: 8000,
			  error: sketchdataerror
			});
		}

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

			console.log(fileArray[0]);

			var options = {
				'fileObjects': fileArray,
				'name': data.id,
				'gistID': data.gistID,
				'openFileName': openfile,
				'openTabNames': opentabnames
			}

			console.log(options);

			var projObj = new Project(options);
			self.openProject(projObj)

		}

	},

	ready: function() {
		this.setupSettings();

		this.setupUser();

		this.initProject();

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

					username = res;
					self.currentUser.username = username;

					self.currentUser.authenticated = username.length > 0 ? true : false;
					console.log('user authenticated? ' + self.currentUser.authenticated);

					// load user recent projects
					self.recentProjects = self.findRecentUserProjects(self.currentUser);

				})
				.fail(function(res) {
					// create a new user if there was not one in local storage
					if (!this.currentUser) {

						// current user remains annonymous
						// self.currentUser = new User();
						localStorage.setItem('user', JSON.stringify(self.currentUser));
					}

					// load user recent projects
					self.recentProjects = self.findRecentUserProjects(self.currentUser);

				});
		},

		authenticate: function() {
			window.open('/auth-gh', '_self');
		},

		logOut: function() {
			this.currentUser = new User();
			window.open('/auth-logout', '_self');
		},

		// returns an array of recent user projects by ID
		findRecentUserProjects: function(user) {
			var recentUserProjects = [];

			// fetch projects from database / localStorage
			var projects = JSON.parse( localStorage.getItem('p5projects') );
			if (!projects) projects = {};


			user.projects.forEach(function(projID) {
				recentUserProjects.push( projects[projID] );
			});

			console.log(recentUserProjects);
			return recentUserProjects;
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

			// var f = Files.setup(filename);
			// Files.addToTree(f, this.files, this.projectPath);
			var f = new pFile(filename);
			this.currentProject.addFile(f);
			this.openFile(f.name);
			console.log('new file 4');

		},

		/**
		 *  open file by filename
		 */
		openFile: function(fileName, callback) {
			// var self = this;
			// var re = /(?:\.([^.]+))?$/;
			// var ext = re.exec(fileName)[1];
			console.log(this.currentProject);
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

		},

		openProject: function(projObj, gistData) {
			var self = this;

			self.closeProject();

			self.currentProject = new Project(projObj);

			var curFileName = self.currentProject.openFileName;
			self.currentFile = self.currentProject.findFile(curFileName);
			self.openFile(self.currentFile.name);

			// self.$broadcast('open-file', self.currentProject.openFile);
			var tabNames = self.currentProject.openTabNames;

			for (var i = 0; i < tabNames.length; i++) {
				var tabName = tabNames[i];
				var fileObj = self.currentProject.findFile(tabName);
				self.$broadcast('add-tab', fileObj, self.tabs);
			}

		},

		// load project by our ID, not by the gistID
		loadProjectByOurID: function(projID) {
			var self = this;
			var ourID = projID;

			// find project in the database (localStorage if offline...)
			var projects = JSON.parse( localStorage.getItem('p5projects') );
			var projObj = projects[ourID];
			var gistID = projObj.gistID;

			// open the project now
			self.openProject(projObj)

			// meanwhile, tell the server to fetch the gist data
			$.ajax({
				url: '/loadprojectbygistid',
				type: 'get',
				dataType: 'json',
				data: {
						'gistID': gistID,
						'gh_oa': this.currentUser.gh_oa
					}
				})
				.success(function(res) {
					var gistData = res;
					self.gotGistData(gistData);
				})
				.fail(function(res) {
					console.log('error loading project' + res);
				});
		},

		gotGistData: function(gistData) {
			console.log('got gist data!');
		},

		forkProject: function() {
			this.modeFunction('forkProject');
		},

		newProject: function(title) {
			this.modeFunction('newProject', title);
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
		},

		showEditor: function() {
			this.editorHidden = false;
		},

		updateCurrentProject: function() {
			console.log('update current proj');
			this.modeFunction('updateCurrentProject');
		}

	}

};

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};