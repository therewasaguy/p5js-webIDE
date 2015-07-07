/**
 *  tabs
 */

module.exports = {
	template: require('./template.html'),

	components: {
		tab: {
			tempalte: require('./tab.html'),
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
		closeFile: function(fileObject) {
			// TO DO
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
		this.$on('close-file', this.closeFile);
	}
};