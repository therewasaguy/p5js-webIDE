module.exports = {
	template: require('./template.html'),

	ready: function() {
	},

	methods: {
		selectRecentProject: function(e) {
			var projectID = e.$event.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		}
	}



};