module.exports = {
	template: require('./template.html'),

	data: {
		projectID: '',
		permalink: '',
		embedCode: '',
	},

	computed: {
		projectID: function() {
			return this.$root.currentProject._id;
		}
	},

	ready: function() {


		this.container = document.getElementById('dialog-container');
		this.container.classList.add('hidden');

		this.dialogShare = document.getElementById('dialog-share');
		this.dialogUnsaved = document.getElementById('dialog-unsaved');
		this.mainContainer = document.getElementById('main-container');
	},

	methods: {

		open: function() {
			// update relevant data fields for template.html
			this.projectID = localStorage.projectID;
			this.permalink = window.location.origin  + '/view/' + this.projectID;
			this.embedCode = '<iframe src="' + this.permalink + '"></iframe>';
			this.openShareDialog();
		},

		close: function() {
			this.container.classList.add('hidden');
			this.mainContainer.classList.remove('blurred');
		},

		openShareDialog: function() {
			// find project username and id based on window.location.href
			var pathname = window.location.pathname.split('/');
			var username = "_anon";
			var projectID = false;

			// // ./username/project
			// if (pathname.length >= 3) {

			// 	username = pathname[1];
			// 	projectID = pathname[2];
			// }

			// // if (username && username == JSON.parse(localStorage.user).username) {
			// if (projectID == JSON.parse(localStorage.latestProject)._id) {
				this.dialogShare.className = '';
				this.dialogUnsaved.className = 'dialog-hidden';
			// }

			// // otherwise,
			// else {
			// 	this.dialogShare.className = 'dialog-hidden';
			// 	this.dialogUnsaved.className = '';
			// }
			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
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