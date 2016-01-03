var inSub = false;

var $ = require('jquery');
var timeago = require('timeago');
var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

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
		loggedIn: function() {
			return this.$root.currentUser && this.$root.currentUser.authenticated;
		},
		currentUser : function() {
			if (this.$root.currentUser) {
				return this.$root.currentUser;
			} else {
				return {};
			}

		},
		currentUserID : function() {
			return this.currentUser._id;
		},
		newWindowClass: function() {
			if (this.$root.settings.runInFrame) {
				return '';
			} else {
				return 'selected';
			}
		}

	},

	ready: function() {
		this.toastSpan = document.getElementById('toast-msg');
		this.setToastMsg('Hello, welcome to p5!');

		this.$on('toast-msg', this.setToastMsg);
	},

	data: function() {
		return {
			toastMsg: '',
			openDropdownClass: 'hidden',
			userDropdownClass: 'hidden',
			saveDropdownClass: 'hidden'
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
			toastSpan.className = '';

			// fade out
			if (!noFade) {
				setTimeout(function() {
					toastSpan.className = 'hidden';
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

		openOpenDropdown: function(e) {
			this.openDropdownClass = '';

			$('span.timeago').timeago();
			$('abbr.timeago').timeago();
			console.log('timeago open dropdown');
		},

		closeOpenDropdown: function(e) {
			if (inSub) return;
			this.openDropdownClass = 'hidden';
		},

		openSaveDropdown: function(e) {
			this.saveDropdownClass = '';
		},

		closeSaveDropdown: function(e) {
			this.saveDropdownClass = 'hidden'
		},

		openUserDropdown: function(e) {
			this.userDropdownClass = '';
		},

		closeUserDropdown: function(e) {
			this.userDropdownClass = 'hidden'
		// },

		// prevDef: function(e) {
		// 	inSub = true;
		// 	console.log('prev def');
		// },

		// clearDef: function() {
		// 	console.log('clear def');
		// 	inSub = false;
		}

	}

});