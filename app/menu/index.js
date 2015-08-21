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

	ready: function() {
		this.toastSpan = document.getElementById('toast-msg');

		this.setToastMessage('welcome!!!');
	},

	data: {
		toastMsg: 'hello world'
	},

	methods: {
		profileClicked: function() {
			this.loggedIn ? window.open('/profile', '_self') : this.$root.authenticate();
		},

		setToastMessage: function(msg) {
			this.toastMsg = msg;

			var toastSpan = this.toastSpan;
			toastSpan.className = '';

			setTimeout(function() {
				toastSpan.className = 'hidden';
			}, 200);

			// fade message out
		}
	}

};