/**
 *  sidebar
 */

var $ = require('jquery');


module.exports = {
	template: require('./sidebar.html'),

	data: {
		sidebarWidth: undefined
	},

	computed: {
		className: function() {
			var container = this.container || $('#sidebar-container');

			if (!this.$root.settings.showSidebar) {
				container.css({
					width: this.sidebarWidth
				});
				ace.resize();
				return 'expanded'
			} else {
				this.sidebarWidth = container.width();
				container.css({
					width: 10
				});
				ace.resize();
				return '';
			}
		}
	},

	ready: function() {
		this.container = $('#sidebar-container');
	}

};