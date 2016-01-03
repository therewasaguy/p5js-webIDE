/**
 *  client debug console
 */

var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	computed: {
		// hide console if not running in frame or if editor is hidden
		className: function() {
			return this.$root.editorHidden || !this.$root.settings.runInFrame ? 'console-hidden' : 'console-visible';
		}
	},

	ready: function() {
		var self = this;
		console.log('loaded debug');
		// eventListener for messages from iframe:
		window.addEventListener('message', self.editorReceiveMsg.bind(self), false);

		self.dbg = document.getElementById('debugText');
		self.dbgArea = document.getElementById('debugContainer');

	},

	methods: {
		editorReceiveMsg: function(e) {
			console.log(e);
			return;
			var msg = JSON.parse(e.data);

			if (msg.type === 'error') {
				this.printError(msg);
			}

			else if (msg.type === 'log') {
				this.printLog(msg);
			}

		},

		// print log/print to the virtual console
		printLog: function(data) {
			var self = this;
			self.dbg.innerHTML += data.msg + '<br/>';
			self.dbgArea.style.opacity = 1.0;

			// self.dbg.maxHeight = self.dbgArea.style.height;

			// scroll to the bottom when a new message is printed
			self.dbg.scrollTop = self.dbg.scrollHeight;
		},

		// print an error to the virtual console
		printError: function(data) {
			var self = this;

			// only log error if the sketch is running
			if (!this.$root.running) {
				return;
			}

			// if sketch is unable to run, stop the sketch
			if (data.msg.indexOf('SyntaxError') > -1) {
				this.$root.running = false;
			}

			self.dbg.innerHTML += 'Error on line ' + data.num + ': ' + data.msg + '<br/>';
			self.dbgArea.style.opacity = 1.0;
		},

		clearErrors: function() {
			var self = this;
			self.dbgArea.style.opacity = 1.0;
			self.dbg.innerHTML = '';
			// to do: reset size
		},

		closeConsole: function() {
			this.$root.editorHidden = true;
		},

		openConsole: function() {
			this.$root.editorHidden = false;
		}

	}

});