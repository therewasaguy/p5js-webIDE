module.exports = {
	template: require('./template.html'),

	data: {
		projectID: '',
		permalink: '',
		embedCode: '',
		callback: function() {},
	},

	computed: {
		projectID: function() {
			return this.$root.currentProject._id;
		},

		inputFields: function() {
			var res = {};
			var inputs = document.getElementsByClassName('dialog-input');

			for (var i = 0; i < inputs.length; i++) {
				res[inputs[i].id] = inputs[i].value;
			}
			return res;
		}

	},

	ready: function() {

		this.container = document.getElementById('dialog-container');
		this.container.classList.add('hidden');

		this.dialogShare = document.getElementById('dialog-share');
		this.dialogUnsaved = document.getElementById('dialog-unsaved');
		this.mainContainer = document.getElementById('main-container');

		// this.views = document.getElementsByClassName('dialog-view');
		this.viewSave = document.getElementById('save-as-view');
		this.viewShare = document.getElementById('share-view');


		this._defaultCallback = function(val) {
			console.log(val);
		};

		this.callback = this._defaultCallback;
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
			var currentProj = this.$root.currentProject;

			if ( currentProj.unsaved() ) {
				this.dialogShare.className = 'dialog-hidden';
				this.dialogUnsaved.className = '';
			}
			else {
				this.dialogShare.className = '';
				this.dialogUnsaved.className = 'dialog-hidden';
			}


			this.viewSave.classList.add('hidden');
			this.viewShare.classList.remove('hidden');

			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
		},

		promptSaveAs: function(callback) {
			this.callback = callback;

			var msg = 'Saving';
			if (!this.$root.currentUser.username) {
				msg += ' anonymously (not logged in)';
			} else {
				msg += ' as '+this.$root.currentUser.username;
			}

			var saveAsTitle = document.getElementById('save-as-title');
			saveAsTitle.innerHTML = msg;

			this.viewSave.classList.remove('hidden');
			this.viewShare.classList.add('hidden');

			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
		},

		promptRename: function(callback) {
			this.callback = callback;

			var saveAsTitle = document.getElementById('save-as-title');
			saveAsTitle.innerHTML = 'Rename Project';

			this.viewSave.classList.remove('hidden');
			this.viewShare.classList.add('hidden');

			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
		},

		accept: function() {
			console.log('accept');
			this.callback(this.inputFields);
			this.close();
		},

		cancel: function() {
			console.log('cancel');
			this.close();
		}
	}

};