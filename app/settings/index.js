/**
 *  Settings
 */
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	// two-way data binding
	props: ['settings'],

	ready: function() {
	},

	watch: {
		// TO DO do this instead:
		// https://github.com/vuejs/vue/issues/844#issuecomment-120104363
		'settings.runInFrame' : function() {
			this.emitSettingsChanged();
		},
		'settings.showSidebar' : function() {
			this.emitSettingsChanged();
		},
		'settings.wordWrap' : function() {
			this.emitSettingsChanged();
		},
		'settings.tabSize' : function() {
			this.emitSettingsChanged();
		},
		'settings.fontSize' : function() {
			this.emitSettingsChanged();
		},
		'settings.editorTheme' : function() {
			this.emitSettingsChanged();
		},
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
		emitSettingsChanged: function() {
			this.$dispatch('settings-view-changed', this.settings);
		},
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