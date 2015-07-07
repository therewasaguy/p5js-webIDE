var Vue = require('vue');
var ace = require('brace');
var settings = require('./settings');

var appConfig = {
	el: '#app',

	components: {
		editor: require('./editor/index'),
		settings: require('./settings/index'),
		tabs: require('./tabs/index'),
		sidebar: require('./sidebar/index'),
		sketchframe: require('./sketchframe/index')
	},

	data: {
		title: 'my cool sketch',
		settings: {},
		showSettings: false,
		tabs: []
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
		}

	}

};

// init Vue
window.onload = function() {
	var app = new Vue(appConfig);
};