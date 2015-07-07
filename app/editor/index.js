/**
 *  Editor
 */

var _ = require('underscore');
var beautify = require('js-beautify').js_beautify;

require('brace/mode/html');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/json');
require('brace/mode/text');
require('brace/theme/twilight');
require('brace/theme/tomorrow');
require('brace/ext/searchbox');

module.exports = {
	template: require('./template.html'),

	data: {
		newProject: true
	},

	ready: function() {
		this.sessions = [];
		this.ace = window.ace = ace.edit('editor');
		this.ace.setTheme('ace/theme/twilight');
		this.ace.setReadOnly(true);

		this.customizeCommands();

		this.openFile();
	},

	methods: {
		openFile: function(fileObject) {

			var session = this.ace.getSession();

			session.on('change', function() {
				// console.log('text changed');
			});

			session.setMode('ace/mode/javascript');

			this.sessions.push(session);

			this.ace.setReadOnly(false);
			this.updateSettings(this.$root.settings);
			this.ace.focus();

			if (this.newProject) {
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
		}
	}

};
