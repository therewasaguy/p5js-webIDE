/**
 *  tabs
 */
var _ = require('underscore');

module.exports = {
	template: require('./template.html'),

	components: {
		tab: {
			template: require('./tab.html'),
			computed: {
				hidden: function() {
					return this.name[0] === '.'
				},
				className: function() {
					var c = '';
					if (this.$root.currentFile == this.file) {
						c += 'selected';
					}
					return c;
				}
			},

			methods: {

			}
		}
	},

	methods: {
		// closeFile
		closeTab: function(fileObject) {
			var tabs = this.$root.tabs;

			// find if there is a matching tab
			var target_tabs = tabs.filter( function(tab) {
				return tab.name === fileObject.name;
			});

			if (target_tabs[0]) {
				var newTarget;
				var index = _.indexOf(tabs, target_tabs[0]);

				switch(index) {
					case 0:
						newTarget = 0;
						break;
					case tabs.length -1:
						newTarget = tabs.length -2;
						break;
					default:
						newTarget = index -1;
						break;
				}

				tabs.splice(index, 1);
				this.$root.openFile( tabs[newTarget].name );
			}
		},

		addTab: function(fileObject, tabs) {

			if (fileObject.open) {
				var tabObject = {
					name: fileObject.name,
					path: fileObject.path,
					id: fileObject.path,
					type: 'file',
					open: true,
					file: fileObject
				};

				tabs.push(tabObject);
			}
		}
	},

	ready: function() {
		this.$on('add-tab', this.addTab);
		this.$on('close-file', this.closeTab);
	}
};