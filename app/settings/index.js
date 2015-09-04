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

	methods: {
		updateTabSize: function(e) {
			var parsed = parseInt(e.target.value);
			this.tabSize = parsed >= 1 ? parsed : 1;
			this.tabSizeDisplay = this.tabSize;
		}
	}

};