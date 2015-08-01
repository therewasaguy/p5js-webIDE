/**
 *  Editor
 */

var _ = require('underscore');
var beautify = require('js-beautify').js_beautify;
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;
var ace = require('brace');

require('brace/mode/html');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/json');
require('brace/mode/text');
require('brace/theme/twilight');
require('brace/theme/tomorrow');
require('brace/ext/searchbox');

var modes = {
  ".html": "html",
  ".htm": "html",
  ".js": "javascript",
  ".css": "css",
  ".json": "json",
  ".txt": "text"
};

module.exports = {
	template: require('./template.html'),

	data: {
		newProject: true
	},

	computed: {

		// this is not used...
		// isVisible: function() {
		// 	return this.$root.editorHidden;
		// }
	},

	ready: function() {
		var self = this;
		this.editSessions = [];
		this.ace = window.ace = ace.edit('editor');
		this.ace.$blockScrolling = Infinity;
		this.ace.setTheme('ace/theme/twilight');
		this.ace.setReadOnly(true);

		this.customizeCommands();

		this.$on('open-file', this.openFile);
		this.$on('close-file', this.closeFile);

		this.$on('clear-editor', this.clearEditor);

		// load and run the code that loaded is the file is the open file in the project
		document.addEventListener('loaded-file', function(e) {
			self.openFile(e.file);
			self.$parent.modeFunction('run');
		});

		// to do: initialize differently
		// this.openFile();
	},

	methods: {

		/**
		 *  Open file in the editor
		 *  @param  {pFile} fileObject a pFile object
		 */
		openFile: function(fileObject) {
			var self = this;
			var session;

			if (typeof(fileObject) !== 'undefined') {
				this.newProject = false;

				// do we need to get sessions from sessions, or can we get them from the file itself?
				session = _.findWhere(this.editSessions, {name: fileObject.name});

				if ( !session ) {
					// figure out file extension
					session = ace.createEditSession( fileObject.contents, 'ace/mode/' + modes[fileObject.ext]);
				} else {
					session = session.doc;
				}

				self.ace.setSession(session);

			} else {
				console.log('ACE Editor: Error opening file. File must be initialized first as a pFile object');
				return;
			}

			session.on('change', function() {
				fileObject.contents = session.getValue();

				// save project
				localStorage.latestProject = JSON.stringify(self.$root.currentProject);

			});

			// is this necessary or can it be stored from files?
			this.editSessions.push({
				'doc': session,
				'name': fileObject.name
			});

			this.ace.setReadOnly(false);
			this.updateSettings(this.$root.settings);
			this.ace.focus();

			if (this.newProject) {
				console.log('loading recent code');
				// load recent code
				var recentCode = localStorage.latestCode;
				if (recentCode) {
					session.setValue(JSON.parse(recentCode));
				}

				this.ace.gotoLine(2, 2);
				this.newProject = false;
			}

		},

		customizeCommands: function() {
			var self = this;

			var commands = [{
				name: "blockoutdent",
				bindKey: {win: 'Ctrl-[,',  mac: 'Command-['},
				exec: function(editor) { editor.blockOutdent(); },
				multiSelectAction: "forEachLine",
				scrollIntoView: "selectionPart"
			}, {
				name: "blockindent",
				bindKey: {win: 'Ctrl-],',  mac: 'Command-]'},
				exec: function(editor) { editor.blockIndent(); },
				multiSelectAction: "forEachLine",
				scrollIntoView: "selectionPart"
			}, {
				name: 'Preferences',
				bindKey: {win: 'Ctrl-,',  mac: 'Command-,'},
				exec: function(editor) {
					self.$root.toggleSettingsPane();
				}
			}];

			commands.forEach(function(command){
			  this.ace.commands.addCommand(command);
			});

		},

		updateSettings: function(settings) {
			this.ace.getSession().setTabSize(settings.tabSize);
			this.ace.getSession().setUseSoftTabs(settings.tabType === 'spaces');
			this.ace.getSession().setUseWrapMode(settings.wordWrap === true);
		},

		clearEditor: function() {
			session = ace.createEditSession( '', 'ace/mode/javascript');
			this.ace.setSession(session);
		},

		closeFile: function(fileName) {
			var session = _.findWhere(this.editSessions, {name: fileName});
			var index = this.editSessions.indexOf(session);
			this.editSessions.splice(index, 1);
		}

	}

};
