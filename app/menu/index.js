module.exports = {
	template: require('./template.html'),

	computed: {
		className: function() {
			return this.$root.running ? 'sketchrunning' : 'sketchstopped';
		}
	},

	methods: {
		selectRecentProject: function(e) {
			var projectID = e.$event.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		}
	}

};