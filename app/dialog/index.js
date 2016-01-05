
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	data: function() {
		return {
			projectID: '',
			// projectName: '',
			projnameinput: '',
			permalink: '',
			editlink: '',
			embedCode: '',
			mode: '', // 'save' 'rename' 'general' 'sketchbook'
			callback: function() {},
			sketchbookview: false
		}
	},

	components: {
		sketchbook: require('../sketchbook/index')
	},

	computed: {
		projectID: function() {
			return this.$root.currentProject._id;
		},
		warning: function() {
			// 'save' and 'rename' warnings:
			if (['save', 'rename'].indexOf(this.mode) > -1) {
				if (this.$root.recentProjects) {
					for (var i = 0; i < this.$root.recentProjects.length; i++) {
						var proj = this.$root.recentProjects[i];
						if (this.projnameinput === proj.name) {
							return 'Save will overwrite existing project ' + proj.name;
						}
					}
				}
				if (this.projnameinput == '') {
					return 'Please give your project a name!';
				}
			}
			return '';
		}
	},

	ready: function() {
		var self = this;

		this.$on('open-sketchbook', function() {
			console.log('got the message');
			self.openSketchbook();
		});

		this.$on('open-share-dialog', this.openShareDialog);
		this.$on('prompt-rename', this.promptRename);
		this.$on('prompt-save-as', this.promptSaveAs);
		this.$on('prompt-general', this.generalPrompt);
		// this.$on('close-the-dialog'. this.close);

		this.container = document.getElementById('dialog-container');
		this.container.classList.add('hidden');

		this.dialogShare = document.getElementById('dialog-share');
		this.dialogUnsaved = document.getElementById('dialog-unsaved');
		this.mainContainer = document.getElementById('main-container');

		// this.views = document.getElementsByClassName('dialog-view');
		this.viewSave = document.getElementById('save-as-view');
		this.viewShare = document.getElementById('share-view');
		this.viewSketchbook = document.getElementById('sketchbook-view');
		this.viewGeneral = document.getElementById('general-view');

		this._defaultCallback = function(val) {
			console.log(val);
		};

		this.callback = this._defaultCallback;
	},

	methods: {

		open: function() {
			// this.show();
		},

		// should be renamed "open"
		show: function() {
			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
			this.$broadcast('dialog-open');
		},

		close: function() {
			this.mode = '';

			this.container.classList.add('hidden');
			this.mainContainer.classList.remove('blurred');
			this.$broadcast('dialog-close');
		},

		openShareDialog: function() {
			var currentProj = this.$root.currentProject;
			this.mode = 'share';

			// update relevant data fields for template.html
			this.projectID = localStorage.projectID;
			this.permalink = window.location.origin  + '/view/' + this.projectID;
			this.embedCode = '<iframe src="' + this.permalink + '"></iframe>';
			this.editlink = window.location.href;

			if ( currentProj.unsaved() ) {
				this.dialogShare.classList.add('hidden');
				this.dialogUnsaved.classList.remove('hidden');
			}
			else {
				this.dialogShare.classList.remove('hidden');
				this.dialogUnsaved.classList.add('hidden');
			}


			this.viewSave.classList.add('hidden');
			this.viewSketchbook.classList.add('hidden');
			this.viewGeneral.classList.add('hidden');
			this.viewShare.classList.remove('hidden');

			this.show();
		},

		promptSaveAs: function(callback) {
			this.callback = callback;
			this.mode = 'save';

			var msg = 'Saving';
			if (!this.$root.currentUser.username) {
				msg += ' anonymously (not logged in)';
			} else {
				msg += ' as '+this.$root.currentUser.username;
			}

			var saveAsTitle = document.getElementById('save-as-title');
			saveAsTitle.innerHTML = msg;

			this.viewGeneral.classList.add('hidden');
			this.viewSave.classList.remove('hidden');
			this.viewShare.classList.add('hidden');
			this.viewSketchbook.classList.add('hidden');

			this.show();
		},

		promptRename: function(callback) {
			this.mode = 'rename';
			this.callback = callback;

			var saveAsTitle = document.getElementById('save-as-title');
			saveAsTitle.innerHTML = 'Rename Project';

			this.viewGeneral.classList.add('hidden');
			this.viewSave.classList.remove('hidden');
			this.viewShare.classList.add('hidden');
			this.viewSketchbook.classList.add('hidden');

			this.show();
		},

		openSketchbook: function() {
			this.mode = 'sketchbook';
			this.show();

			this.viewGeneral.classList.add('hidden');
			this.viewSave.classList.add('hidden');
			this.viewShare.classList.add('hidden');
			this.viewSketchbook.classList.remove('hidden');
		},

		/**
		 *  Post a general message
		 *  @param  {Object} obj 	obj.msg
		 *                        obj.input (placeholder)
		 *                        obj.callback
		 */
		generalPrompt: function(obj) {
			var msg = obj.msg;
			var inputField = obj.input || null;
			this.mode = 'general';
			this.show();

			var gnrlInput = document.getElementById('gnrlinput');
			if (inputField) {
				gnrlInput.style.display = 'block';
				gnrlInput.placeholder = inputField;
			} else {
				gnrlInput.style.display = 'none';
			}

			var gnrlMsg = document.getElementById('general-title');
			gnrlMsg.innerHTML = msg;
			this.callback = obj.callback;
			this.viewGeneral.classList.remove('hidden');
			this.viewSave.classList.add('hidden');
			this.viewShare.classList.add('hidden');
			this.viewSketchbook.classList.add('hidden');

		},

		/**
		 *  Return an object with key-value pairs
		 *  where keys are input ID's
		 *  of the 'dialog-input' class
		 *  and vals are their values.
		 *  
		 *  @return {Object}
		 */
		calcInputs: function() {
			var res = {};
			var inputs = document.getElementsByClassName('dialog-input');
			for (var i = 0; i < inputs.length; i++) {
				res[inputs[i].id] = inputs[i].value;
			}
			return res;
		},

		accept: function() {
			var inputFields = this.calcInputs();

			this.callback(inputFields);
			this.close();
		},

		cancel: function() {
			this.close();
		}
	}

});