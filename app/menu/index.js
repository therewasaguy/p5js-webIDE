module.exports = {
	template: require('./template.html'),

	// ref of most recently opened window, if there is one
	newWindowOpen: -1,

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

		},

		goFullScreen: function(e) {
			var div = document.getElementById('sketchframe-container');
			div.requestFullscreen();
		},

		// open the current code in a new window
		openInNewWindow: function(e) {

			// this only works if a project is saved

			var pathname = window.location.pathname.split('/');
			var username = pathname[1];
			var projectID = pathname[2];

			if (!username || !projectID) {
				alert('please save project before opening in a new window')
				return false;
			}

			// TO DO: open without fetching code from server

			// TO DO: refresh if a window is already open (is this possible?)
			if (this.newWindowOpen) {
				// the open tab will know to refresh
				this.newWindowOpen.postMessage('newcode', window.localStorage.fileObjects);
			} else {
				this.newWindowOpen = window.open('http://' + window.location.host + '/view/' + username + '/' + projectID); 
			}
		}


	}

};