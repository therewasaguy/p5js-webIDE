module.exports = {
	template: require('./template.html'),

	ready: function() {
		this.container = document.getElementById('dialog-container');
		this.container.className = 'hidden'

		this.mainContainer = document.getElementById('main-container');
		this.mainContainer.className = '';

		this.dialogShare = document.getElementById('dialog-share');
		this.dialogUnsaved = document.getElementById('dialog-unsaved');
	},

	methods: {

		open: function() {
			this.openShareDialog();
		},

		close: function() {
			this.container.className = 'hidden';
			this.mainContainer.className = '';
		},

		openShareDialog: function() {
			// find project username and id based on window.location.href
			var pathname = window.location.pathname.split('/');
			var username = "_anon";
			var projectID = false;

			// ./username/project
			if (pathname.length >= 3) {

				username = pathname[1];
				projectID = pathname[2];
			}

			// if (username && username == JSON.parse(localStorage.user).username) {
			if (projectID == JSON.parse(localStorage.latestProject)._id) {
				this.dialogShare.className = '';
				this.dialogUnsaved.className = 'dialog-hidden';
			}

			// otherwise,
			else {
				this.dialogShare.className = 'dialog-hidden';
				this.dialogUnsaved.className = '';
			}
			this.container.className = '';
			this.mainContainer.className = 'blurred';
		},

		accept: function() {
			console.log('accept');
			this.close();
		},

		cancel: function() {
			console.log('cancel');
			this.close();
		}
	}

};