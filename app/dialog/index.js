/**
 *  Dialog / Modal window
 *  
 *  @type {[type]}
 */
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
			sketchbookview: false,
			overwriteID: null
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

							// set overwriteID
							this.overwriteID = proj.id || proj._id;
							return 'Save will overwrite existing project ' + proj.name;
						}
					}
				}
				if (this.projnameinput == '') {
					return 'Please give your project a name!';
				}
			}

			// set overwriteID
			this.overwriteID = null;
			return '';
		}
	},

	ready: function() {
		var self = this;
		window._dialog = this;

		this.$on('open-sketchbook', function() {
			console.log('got the message');
			self.openSketchbook();
		});

		this.$on('open-share-dialog', this.openShareDialog);
		this.$on('open-about-dialog', this.generalPrompt);
		this.$on('prompt-rename', this.promptRename);
		this.$on('prompt-save-as', this.promptSaveAs);
		this.$on('prompt-general', this.generalPrompt);
		this.$on('close-the-dialog', this.close);

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
			// console.log(val);
		};

		this.callback = this._defaultCallback;
	},

	methods: {

		open: function() {
			// clear overwriteID
			this.overwriteID = null

			// clear callback
			this.callback = this._defaultCallback;

			this.container.classList.remove('hidden');
			this.mainContainer.classList.add('blurred');
			this.$broadcast('dialog-open');

			this.addKeyListeners();
		},

		close: function() {
			this.mode = '';

			// clear callback
			this.callback = this._defaultCallback;

			this.container.classList.add('hidden');
			this.mainContainer.classList.remove('blurred');
			this.$broadcast('dialog-close');

			this.removeKeyListeners();
		},

		openShareDialog: function() {
			this.open();
			this.mode = 'share';

			var currentProj = this.$root.currentProject;

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
		},

		promptSaveAs: function(callback) {
			this.open();
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
		},

		promptRename: function(callback) {
			this.open();

			this.mode = 'rename';
			this.callback = callback;

			var saveAsTitle = document.getElementById('save-as-title');
			saveAsTitle.innerHTML = 'Rename Project';

			this.viewGeneral.classList.add('hidden');
			this.viewSave.classList.remove('hidden');
			this.viewShare.classList.add('hidden');
			this.viewSketchbook.classList.add('hidden');
		},

		openSketchbook: function() {
			this.mode = 'sketchbook';
			this.open();

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
			this.open();

			var gnrlInput = document.getElementById('gnrlinput');
			gnrlInput.value = '';

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
			var res = {'overwriteID' : this.overwriteID};
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
		},

		/**
		 *  Accept or Close dialog on Enter or Escape
		 *
		 *  @method  addKeyListeners
		 */
		addKeyListeners: function() {
			var self = this;

			self.listener = function(e){
				var key = e.which || e.keyCode;
				switch(key) {
					case 13: // enter
						self.accept();
						break;
					case 27: // escape
						self.close();
						break;
					default:
						break;
				}
			};

			document.addEventListener('keyup', self.listener);
		},

		/**
		 *  Remove listeners for Enter and Escape keypress
		 *
		 *  @method  removeKeyListeners
		 */
		removeKeyListeners: function() {
			document.removeEventListener('keyup', self.listener);
			self.listener = undefined;
		}
	}

});