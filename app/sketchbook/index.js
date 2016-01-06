// use list.js from /libs folder (not browserify safe)

var $ = require('jquery');
var timeago = require('timeago');
var Vue = require('vue');
Vue.filter('reverse', function (value) {
  return value.reverse();
});

module.exports = Vue.extend({
	template: require('./template.html'),

	replace: true,

	data: function() {
		var cols = [
				{'displayName': 'Name',
					'slug': 'name',
					'sortVal': 'name',
				},
				{
					'displayName': 'Modified',
					'slug': 'dateModified',
					'sortVal': 'timestampMod'
				},
				{
					'displayName': 'Created',
					'slug': 'dateCreated',
					'sortVal': 'timestampCreated'
				}
			];
		var sortOrders = {};

		cols.forEach(function (key) {
			sortOrders[key.slug] = 1;
		});

		return {
			columns: cols,
			sortKey: '',
			sortOrders: sortOrders,
			fkey: '',
			projectList : []
		}
	},

	ready: function() {
		var self = this;
		window._table = this;

		this.$on('dialog-open', function(e) {
			this.projectList = this.$root.recentProjects;

			// not sure why this is needed
			setTimeout(function(){
				console.log('time go');
				$("td.timeago").timeago();
				// self.update();
			}, 10);
		});

		this.$on('dialog-close', function(e) {
			document.getElementById('project-search-term').value='';
			// this.list.update();
		});
	},

	methods: {

		sortBy: function(key){
			this.sortKey = key.slug;
			this.sortOrders[key.slug] = this.sortOrders[key.slug] * -1;
		},

		// TO DO: pass custom data to the update function
		update: function() {
			try {
				// this.list = new List('projects', {
				// 	'valueNames': ['proj-name', 'timestamp-mod', 'timestamp-created']
				// });
				// console.log('list size: ' + this.list.size());
			} catch(e) {
				console.log(e);
			}
		},

		clickedOnProject: function(projectID) {
			console.log('clicked on proj');
			this.$root.loadProjectByOurID(projectID);
			this.$dispatch('close-dialog');
		}
	}

});