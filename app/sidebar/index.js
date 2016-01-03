/**
 *  sidebar
 */
var Vue = require('vue');

var PFile = Vue.extend({
			template: require('./file.html'),

			props: ['data'],

			computed: {
				name : function() {
					return this.data.name;
				},
				ext: function() {
					return this.data.ext;
				},
				hidden: function() {
					return this.name && this.name[0] === '.';
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
				openFile: function(item) {
					this.$root.openFile(item);
				}
				// popupMenu: function(target, event) {
				// 	popupMenu.apply(this, arguments);
				// }
			},
			ready: function() {
			}
		});

module.exports = Vue.extend({
	template: require('./sidebar.html'),

	props: ['files'],

	data: function() {
		return {
			sidebarWidth: undefined
		}
	},

	components: {
		pfile: PFile
	},

	computed: {

		fileObjects: function() {
			return this.$root.currentProject != undefined ? this.$root.currentProject.fileObjects : [];
		},

		className: function() {
			var container = this.container || $('#sidebar-container');

			// if (this.$root.editorHidden || !this.$root.settings.showSidebar) {
			if (!this.$root.settings.showEditor || !this.$root.settings.showSidebar) {
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

		sidebarIconClass: function() {
			return this.$root.settings.showEditor ? 'show' : 'hide';
		}

	},

	ready: function() {
		// this.container = $('#sidebar-container');
		//this.sidebarUI();
	}

	// methods: {
		// sidebarUI: function() { 
		// }
	//}

});


