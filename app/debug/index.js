/**
 *  client debug console
 */

module.exports = {
	template: require('./template.html'),

	ready: function() {
		var self = this;
		console.log('loaded debug');
		// eventListener for messages from iframe:
		window.addEventListener('message', self.editorReceiveMsg.bind(self), false);
	},

	methods: {
		editorReceiveMsg: function(e) {
			var msg = JSON.parse(e.data);

			if (msg.type === 'error') {
				this.logError(msg);
			}
		},

		logError: function(data) {

			// only log error if the sketch is running
			if (!this.$root.running) {
				return;
			}

			// if sketch is unable to run, stop the sketch
			if (data.msg.indexOf('SyntaxError') > -1) {
				this.$root.running = false;
			}

			var dbg = document.getElementById('debugText');
			dbg.innerText = 'Error on line ' + data.num + ': ' + data.msg;

			var dbgArea = document.getElementById('debugContainer');
			dbgArea.style.opacity = 1.0;
		},

		clearErrors: function() {
			var dbgArea = document.getElementById('debugContainer');
			dbgArea.style.opacity = 0.0;
		}
	}

};