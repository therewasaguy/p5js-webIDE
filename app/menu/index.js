module.exports = {
	template: require('./template.html'),

	computed: {
		className: function() {
			if (this.$root.running && this.$root.editorHidden) {
				return 'hidden';
			} else {
				return 'visible';
			}
			// return this.$root.running ? 'sketchrunning' : 'sketchstopped';
		},
		loggedIn: function() {
			return this.$root.currentUser && this.$root.currentUser.authenticated;
		}

	},

	ready: function() {
		this.toastSpan = document.getElementById('toast-msg');

		this.setToastMsg('Hello World!');
	},

	data: {
		toastMsg: ''
	},

	methods: {
		profileClicked: function() {
			this.loggedIn ? window.open('/profile', '_self') : this.$root.authenticate();
		},

		setToastMsg: function(msg) {
			this.toastMsg = msg;
			console.log(msg);

			var toastSpan = this.toastSpan;

			// remove 'hidden' class to show the message
			toastSpan.className = '';

			// fade out
			setTimeout(function() {
				toastSpan.className = 'hidden';
			}, 200);

		}
	}

};