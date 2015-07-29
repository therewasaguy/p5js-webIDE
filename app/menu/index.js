module.exports = {
	template: require('./template.html'),

	methods: {
		selectRecentProject: function(e) {
			var projectID = e.$event.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		}
	}

};