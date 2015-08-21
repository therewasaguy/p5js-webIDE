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

	data: {
		toastMsg: 'hello world'
	},

	methods: {
		profileClicked: function() {
			this.loggedIn ? window.open('/profile', '_self') : this.$root.authenticate();
		}
	}

};