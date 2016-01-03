/**
 *  Settings
 */
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	// two-way data binding
	props: ['settings'],

	ready: function() {
		var self = this;
	},

	computed: {
		hideSidebar: {
			get: function() {
				return !this.settings.showSidebar;
			},
			set: function() {
				this.settings.showSidebar = !this.settings.showSidebar;
			}
		},
		runInNewWindow: {
			get: function() {
				return !this.settings.runInFrame;
			},
			set: function() {
				this.settings.runInFrame = !this.settings.runInFrame;
			}
		},
		wordWrapOff: {
			get: function() {
				return !this.settings.wordWrap;
			},
			set: function() {
				this.settings.wordWrap = !this.settings.wordWrap;
			}
		},
		tabSizeDisplay: function() {
			return this.tabSize;
		}
	},

	methods: {
		incText: function(e) {
			this.$root.settings.fontSize++;
		},
		decText: function(e) {
			if (this.$root.settings.fontSize > 4) {
				this.$root.settings.fontSize--;
			}
		},
		incTabs: function(e) {
			if (this.$root.settings.tabSize < 4) {
				this.$root.settings.tabSize++;
			}
		},
		decTabs: function(e) {
			if (this.$root.settings.tabSize > 1) {
				this.$root.settings.tabSize--;
			}
		},
		toggleWordWrap: function() {
			this.settings.wordWrap = !this.settings.wordWrap;
		},
		toggleNewWindowSetting: function(e) {
			this.settings.runInFrame = !this.settings.runInFrame;
			this.$root.stop();
		},
		themeChanged: function() {
			var theme = this.editorTheme;
			console.log(theme);
		}

	}

});