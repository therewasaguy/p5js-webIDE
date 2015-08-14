module.exports = {
	template: require('./template.html'),

	computed: {
		className: function() {
			return this.$root.running ? 'sketchrunning' : 'sketchstopped';
		},
		loggedIn: function() {
			return this.$root.currentUser && this.$root.currentUser.authenticated;
		}

	},

	methods: {
		selectRecentProject: function(e) {
			var projectID = e.$event.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		}
	}

};