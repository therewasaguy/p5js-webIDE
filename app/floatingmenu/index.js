var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	computed: {
		showEditorClass: function() {
			// return this.$root.editorHidden ? 'show' : 'hide';
			return this.$root.settings.showEditor ? 'isviz' : 'show';
		},
	},

	ready: function() {
		// this would make it draggable
		// $('#floating-menu').draggable({ cancel: ".prevent-drag"} );
	},

	methods: {
		toggleEditor: function() {
			console.log('toggle');
			this.$root.toggleEditor();
		}
	}

});