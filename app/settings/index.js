/**
 *  Settings
 */
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	// two-way data binding
	props: ['settings'],
	data: function() {
		return {
			gutter: undefined,
			editorWidth: '50%',
			frameWidth: '50%',
			editorContainer: undefined,
			frameContainer: undefined
		}
	},

	ready: function() {
		var self = this;
		self.gutter = document.getElementsByClassName('gutter-horizontal')[0];

		// wait for vue components to register...
		setTimeout(function() {
			self.gutter = document.getElementsByClassName('gutter-horizontal')[0];
			self.editorContainer = document.getElementById('editor-container');
			self.frameContainer = document.getElementById('sketchframe-container');
			self.checkSplitPane();
		}, 100);

		this.$on('check-split-pane', this.checkSplitPane);
	},

	watch: {
		// TO DO do this instead:
		// https://github.com/vuejs/vue/issues/844#issuecomment-120104363
		'settings.runInFrame' : function() {
			this.checkSplitPane();
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
		},
		checkSplitPane: function() {
			console.log('check split pane');

			if (this.settings.runInFrame) {
				// set editor and frame container width and show Split.js to resize
				if (this.gutter) {
					this.gutter.style.display = 'block';
					if (this.editorWidth) {
						console.log('editor width: ' + this.editorWidth);
						this.editorContainer.style.width = this.editorWidth;
						this.frameContainer.style.width = this.frameWidth;
					}
				}
			} else {
				// hide split.js resize and save editor and frame container width for later
				if (this.gutter) {
					this.gutter.style.display = 'none';
					this.editorWidth = this.editorContainer.style.width;
					this.frameWidth = this.frameContainer.style.width;
					this.editorContainer.style.width = '100%';
					this.frameContainer.style.width = '0px';
				}
				console.log('run in frame, no');
			}
		}

	}

});