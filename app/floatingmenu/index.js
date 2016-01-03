var Vue = require('vue');

module.exports = Vue.extend({
	template: require('./template.html'),

	computed: {
		showEditorClass: function() {
			// return this.$root.editorHidden ? 'show' : 'hide';
			return this.$root.settings.showEditor ? 'hide' : 'show';

		},
	},

	ready: function() {
		$('#floating-menu').draggable({ cancel: ".prevent-drag"} );
	},

	methods: {
	}

});