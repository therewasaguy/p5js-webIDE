/**
 *  sidebar
 */

var $ = require('jquery');


module.exports = {
	template: require('./sidebar.html'),

	data: {
		sidebarWidth: undefined
	},

	components: {

		file: {
			template: require('./file.html'),
			computed: {
				hidden: function() {
					return this.name[0] === '.';
				},
				icon: function() {
					if (this.ext.match(/(png|jpg|gif|svg|jpeg)$/i)) return 'image';
					else if (this.ext.match(/db$/i)) return 'db';
					else return 'file';
				},
				className: function() {
					var c = 'item';
					if (this.$root.currentFile.name == this.name) c += ' selected';
					return c;
				}
			},

			methods: {
				popupMenu: function(target, event) {
					popupMenu.apply(this, arguments);
				}
			}
		}
	},

	computed: {
		className: function() {
			var container = this.container || $('#sidebar-container');

			if (this.$root.editorHidden || !this.$root.settings.showSidebar) {
				this.sidebarWidth = container.width();
				container.css({
					width: 10
				});
				ace.resize();
				return '';
			}
			else {
				container.css({
					width: 160 //this.sidebarWidth
				});
				console.log(this.sidebarWidth);
				ace.resize();
				return 'expanded'
			}
		},

		showEditorClass: function() {
			return this.$root.editorHidden ? 'show' : 'hide';
		}

	},

	ready: function() {
		this.container = $('#sidebar-container');
	}

};