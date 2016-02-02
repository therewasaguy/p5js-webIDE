var inSub = false;

var $ = require('jquery');
var timeago = require('timeago');
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	props: ['currentUser', 'loggedIn'],

	// ref of most recently opened window, if there is one
	newWindowOpen: -1,

	computed: {
		className: function() {
			if (this.$root.running && this.$root.editorHidden && !this.$root.settings.runInFrame) {
				return 'hidden';
			} else {
				return 'visible';
			}
			// return this.$root.running ? 'sketchrunning' : 'sketchstopped';
		},
		// currentUserID : function() {
		// 	return this.currentUser > 0 ? this.currentUser._id : false;
		// },
		newWindowClass: function() {
			if (this.$root.settings.runInFrame) {
				return '';
			} else {
				return 'selected';
			}
		}

	},

	ready: function() {
		window._menu = this;
		this.toastSpan = document.getElementById('toast-msg');
		this.setToastMsg('Hello, welcome to p5!');

		this.$on('toast-msg', this.setToastMsg);
	},

	data: function() {
		return {
			toastMsg: ''
		}
	},

	computed: {
		userOwnsProject: function() {
			return this.$root.userOwnsProject;
		}
	},

	methods: {
		profileClicked: function() {
			this.loggedIn ? window.open('/profile', '_self') : this.$root.authenticate();
		},

		openSketchbook: function() {
			this.$dispatch('open-sketchbook');
		},

		/**
		 *  Display a message for the user.
		 *  
		 *  @param {String} msg    Message to display
		 *  @param {Boolean} [noFade] fades after 500ms unless this is true
		 */
		setToastMsg: function(msg, noFade) {
			this.toastMsg = msg;

			var toastSpan = this.toastSpan;

			// remove 'hidden' class to show the message
			toastSpan.classList.remove('hidden');

			// fade out
			if (!noFade) {
				setTimeout(function() {
					toastSpan.classList.add('hidden');
				}, 500);
			}

		},

		goFullScreen: function(e) {
			var div = document.getElementById('sketchframe-container');
			div.requestFullscreen();
		},


		selectRecentProject: function(e) {
			var projectID = e.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		},

		loadExample: function(item) {
			this.$root.loadExample(item);
		},

		// toggle setting to open the current code in a new window
		// toggleNewWindowSetting: function(e) {
		// 	this.$root.stop();
		// 	this.$root.settings.runInFrame = !this.$root.settings.runInFrame;
		// },

		// open dialog with share URL / embed code
		openShareDialog: function(e) {
			this.$root.openShareDialog();
		},

		openAboutDialog: function(e) {
			this.$root.openAboutDialog();
		},

		openOpenDropdown: function(e) {
			$('span.timeago').timeago();
			$('abbr.timeago').timeago();
		},

		/**
		 *  This is what happens when user hits default
		 *  'save' button rather than a menu option.
		 */
		defaultSave: function() {
			if (this.userOwnsProject) {
				this.$root.saveToCloud();
			} else {
				this.$root.saveAs();
			}
		}

	}

});