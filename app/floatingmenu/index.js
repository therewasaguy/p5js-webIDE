module.exports = {
	template: require('./template.html'),

	computed: {
	},

	ready: function() {
		$('#floating-menu').draggable({ cancel: ".prevent-drag"} );
	},

	data: {
		
	},

	methods: {
	}

};