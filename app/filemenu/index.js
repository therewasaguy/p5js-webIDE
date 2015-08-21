module.exports = {
	template: require('./template.html'),

	ready: function() {
		this.setupUI();
	},

	methods: {
		selectRecentProject: function(e) {
			var projectID = e.$event.target.getAttribute('data-projectid');
			this.$root.loadProjectByOurID(projectID);
		},

		setupUI: function() {
			$( ".accordion" ).accordion({
			      heightStyle: "content"
			    });

			$( ".accordion" ).accordion({
			    collapsible: true
			    });

			$( "#examples" ).accordion({
			  active: 2
			});

			$( ".accordion" ).accordion({
			  icons: { "header": "src", "activeHeader": "data-altsrc" }
			});

			$(function(){ 
			   $("#exampleButton").click(function(){ 
			   $("#exampleIcon").attr('src',  
			                ($("#exampleIcon").attr('src') == 'images/arrow-down.svg'  
			                    ? 'images/arrow-up.svg'  
			                    : 'images/arrow-down.svg' 
			                     ) 
			                )  
			    }); 
			}); 

			$(function(){ 
			    $("#projectsButton").click(function(){ 
			   $("#projectIcon").attr('src',  
			                ($("#projectIcon").attr('src') == 'images/arrow-up.svg'  
			                    ? 'images/arrow-down.svg'  
			                    : 'images/arrow-up.svg' 
			                     ) 
			                )
			    }); 
			}); 
		}
	}



};