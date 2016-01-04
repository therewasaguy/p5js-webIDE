/**
 *  module AJAX for making AJAX requests
 *  from client
 */

var timeago = require('timeago');
var ProjectLoader = require('./projloader');

module.exports = {

	saveProject: function(postData, main) {

		$.ajax({
			url: '/save/project',
			type: 'POST',
			data: postData,
			dataType: 'json'
		})
		.success( function(res) {
			var oldProjID = main.currentProject._id;

			// update values in local storage AND main.currentProject
			main.currentProject._id = res._id;
			main.currentProject.owner_id = res.owner_id;
			main.currentProject.owner_username = res.owner_username;
			main.currentProject.forkedFrom = res.forkedFrom;
			main.currentProject.pFiles = res.pFiles;

			// update file ID's
			for (var i = 0; i < res.pFiles.length; i++) {
				var newF = res.pFiles[i];
				var pFile = main.currentProject.findFile( newF.name );
				pFile._id = newF._id;

				// set original contents to show that the file saved successfull
				pFile.originalContents = pFile.contents;
			}

			main.updateProjectInLocalStorage(oldProjID);
			main.updateRecentProjects(res);

			// notify the user that it worked
			main.$broadcast('toast-msg', res.name + ' Saved Successfully');
				// main.$emit('updateCurrentProject');
		})
		.error( function(res, error) {
			main.$broadcast('toast-msg', 'There was an error saving. Please try again');
		});

	},

	/**
	 *  load project from server with projectID,
	 *  username and reference to main app.
	 *  
	 *  @param  {String} projectID [description]
	 *  @param  {Object} main      reference to vue.js app (main.js)
	 */
	loadProject: function(projectID, main) {

		// show loading and hide editor main-container
		main.shouldLoadExistingProject = true;

		// get sketch from server
		$.ajax({
			url: '/loadproject',
			data: {projectID: projectID},
			type: 'GET',
		})
		.success( function(res) {
			var proj;

			// load project the old way (with 'files')
			// test example: therewasaguy/563ce6ca1bed2173b524889e
			if (res.files && res.files.length > 0) {
				main.parseProjectOld(res);
			}

			// load project the new way (with 'pFiles')
			// test example: /editor?sketch=5683673178eec01a029fae5c
			// another test: 								568368c7b1da2bb002bacd1f
			else if (res.pFiles && res.pFiles.length > 0) {
				main.parseProject(res);
			}

			// if no files, must be some error
			// test example: therewasaguy/567f7f3ddce613cb5f78ea16
			else {
				var e = new Error('Unable to parse project');
				throw e;
			}
		})
		.error( function(e) {
			throw e;
		});
	},

	/**
	 *  get file content from an array of file IDs.
	 *  
	 *  @param  {Array}   filesToGet Array of file IDs
	 *  @param  {Function} callback 
	 */
	getFiles: function(filesToGet, callback) {
		console.log('getting files with ajax');
		$.ajax({
			url: '/api/files',
			data: {ids: filesToGet},
			type: 'GET',
		})
		.success( function(res) {
			console.log('got file');
			console.log(res);
			callback(res);
		})
		.error( function(err) {
			console.log('error getting files ' + filesToGet[0]);
		});
	},

	loadExample: function(listItem, main) {
		var pathToExample = listItem.path.replace('/public', '');
		var name = listItem.name;
		// get example contents
		$.ajax({
			// type: 'GET',
			dataType: 'text',
			url: pathToExample,
			success: function(sketchContents) {
				ProjectLoader.initExample(sketchContents, name, main);
			},
			error: function(e) {
				console.log('fail');
			}
		});
	},

	/**
	 *  get recent projects of an authenticated user from the database and reset recentProjects
	 *  @param  {Object} user current user object
	 *  @param  {Object} main reference to main app
	 *  @return {[type]}      [description]
	 */
	findRecentUserProjects: function(user, main) {
		var projects = [];

		// start off with localstorage if it exists and user ID matches
		if (localStorage.recentProjects) {
			projects = JSON.parse( localStorage.getItem('recentProjects') );
			main.sortRecentProjects(projects); 
		}

		// // if user is not logged in, get recentProjects array from local storage
		if (!user.authenticated) {
			console.log('user not authenticated');
			return;
		}

		else {
			console.log('fetch user projects for user id: ' + user._id);

			$.ajax({
				url: '/api/projects?userID=' + user._id + '&limit=max',
				type: 'GET',
				success: function(projArray) {
					projects = [];

					for (var i = 0; i < projArray.length; i++) {
						var proj = projArray[i];

						var id = proj._id;
						var name = proj.name;
						var dateModified = proj.updated_at;
						var dateCreated = proj.created_at;
						var ownerID = proj.owner_id;

						projects.push({
							name: name,
							id: id,
							owner_id: ownerID,
							dateModified: dateModified,
							dateCreated: dateCreated,

							// for sorting
							timestampMod: new Date(dateModified).getTime(),
							timestampCreated: new Date(dateCreated).getTime(),

							forkedFrom: proj.forkedFrom,
							pFiles_ids: proj.pFiles ? proj.pFiles.map(function(pf) {return pf._id}) : []
						});
					}
					console.log(projects[10].timestamp);
					// update localStorage
					window.localStorage.removeItem('recentProjects');
					window.localStorage.setItem('recentProjects', JSON.stringify(projects));

					// reset recent projects
					main.recentProjects = projects;

				}
			});
		}
	},

};