/**
 *  Settings
 */

module.exports = {
	template: require('./template.html'),

	data: {
		tabSizeDisplay: 1
	},

	ready: function() {
		var self = this;

		if (parseInt(self.tabSize) < 1) {
			self.tabSize = 1;
		}
		self.tabSizeDisplay = self.tabSize;
	},

	computed: {
		hideSidebar: function() {
			return !this.showSidebar;
		},
		runInNewWindow: function() {
			return !this.runInFrame;
		},
		wordWrapOff: function() {
			return !this.wordWrap;
		},
		tabSizeDisplay: function() {
			return this.tabSize;
		}
	},

	methods: {
		updateTabSize: function(e) {
			var parsed = parseInt(e.target.value);
			this.tabSize = parsed >= 1 ? parsed : 1;
			this.tabSizeDisplay = this.tabSize;
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
			this.wordWrap = !this.wordWrap;
		},

		toggleNewWindowSetting: function(e) {
			this.$root.stop();
			this.$root.settings.runInFrame = !this.$root.settings.runInFrame;
		},

		themeChanged: function() {
			var theme = this.editorTheme;
			console.log(theme);
		}

	}

};