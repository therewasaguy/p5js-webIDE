var Vue = require('vue');
var ace = require('brace');
var settings = require('./settings');
var debugView = require('./debug');
var $ = require('jquery');
var Files = require('./files');

Vue.config.debug = true;
Vue.config.silent = true;

var appConfig = {
	el: '#app',

	components: {
		editor: require('./editor/index'),
		settings: require('./settings/index'),
		tabs: require('./tabs/index'),
		sidebar: require('./sidebar/index'),
		sketchframe: require('./sketchframe/index'),
		debug: require('./debug/index')
	},

	data: {
		title: 'my cool sketch',
		settings: {},
		showSettings: false,
		tabs: [],
		files: [],
		running: false,
		fileTypes: ['txt', 'html', 'css', 'js', 'json', 'scss', 'xml', 'csv', 'less'],
		currentFile: null
	},

	computed: {
		projectName: function() {
			return this.title;
		},

		orientation: function() {
			var orientation = this.settings.consoleOrientation;
		}
	},

	ready: function() {
		this.setupSettings();
	},

	methods: {
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

		run: function() {
			var sketchFrame = document.getElementById('sketchFrame');
			sketchFrame.src = sketchFrame.src;

			this.$.debug.clearErrors();

			this.running = true;
		},

		toggleRun: function() {
			if (this.running) {
				// this.modeFunction('stop');
				this.stopCode();
				this.running = false;
			} else {
				// this.modeFunction('run');
				this.run();
			}
		},

		stopCode:  function() {
			var frameSrc = window.location.origin +'/'+ $('#sketchFrame').attr('src');
			var data = {'msg':'stop'};
			window.postMessage( JSON.stringify(data), frameSrc);
		},

		pauseCode: function() {
			sketchIsPlaying = false;
			var frameSrc = window.location.origin +'/'+ $('#sketchFrame').attr('src');
			var data = {'msg':'pause'};
			window.postMessage( JSON.stringify(data), frameSrc);
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

			var f = Files.setup(filename);
			Files.addToTree(f, this.files, this.projectPath);
			this.openFile(f);
		},

		openFile: function(file, callback) {
			// var self = this;
			// var re = /(?:\.([^.]+))?$/;
			// var ext = re.exec(path)[1];
			console.log('path: ' + file.path);

			var file = Files.find(this.files, file.path);
			if (!file) return false;

			this.currentFile = file;
			this.currentFile.open = true;

			this.$broadcast('open-file', this.currentFile);
			this.$broadcast('add-tab', this.currentFile, this.tabs);

		},

		closeFile: function() {
			this.$broadcast('close-file', this.currentFile);
		}
	}

};

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};