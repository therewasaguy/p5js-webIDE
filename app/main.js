var Vue = require('vue');
var ace = require('brace');
var settings = require('./settings');
var debugView = require('./debug');
var $ = require('jquery');
var Files = require('./files');

var pFile = require('./models/pfile');
var Project = require('./models/project');
var User = require('./models/user');


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
		menu: require('./menu/index')
	},

	data: {
		settings: {},
		showSettings: false,
		tabs: [],
		files: [],
		running: false,
		fileTypes: ['txt', 'html', 'css', 'js', 'json', 'scss', 'xml', 'csv', 'less'],
		currentFile: null,
		currentProject: null,
		currentUser: null,
		recentProjects: []
	},

	computed: {
		projectName: function() {
			return this.currentProject.name;
		},

		orientation: function() {
			var orientation = this.settings.consoleOrientation;
		}
	},

	ready: function() {
		this.setupSettings();

		this.setupUser();

		this.newProject('Hello p5');
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
		},

		run: function() {
			this.modeFunction('run');
		},

		// handle users
		setupUser: function() {

			if (localStorage.user) {
				this.currentUser = JSON.parse( localStorage.getItem('user') );
			} else {
				// current user is annonymous
				this.currentUser = new User();
				localStorage.setItem('user', JSON.stringify(this.currentUser));
			}

			this.recentProjects = this.findRecentUserProjects(this.currentUser);
		},

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

		closeFile: function() {
			this.$broadcast('close-file', this.currentFile);
		},

		renameProject: function() {
			// var oldName = String(this.projectName);
			var newName = prompt('New project name:', this.projectName);
			if (newName) {
				this.currentProject.name = newName;
			}
		},

		// load project by our ID, not by the gistID
		loadProjectByOurID: function(projID) {
			var ourID = projID;

			// find project in the database
			var projects = JSON.parse( localStorage.getItem('p5projects') );
			var projObj = projects[ourID];

			var gistID = projObj.gistID;

			// TO DO... finish this!

			// loadProjectByGistID(gistID);
		},

		// show recent user projects
		recentProjects: function() {
			this.modeFunction('getUserProjects');
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
		}

	}

};

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};