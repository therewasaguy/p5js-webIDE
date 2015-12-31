/**
 *  module AJAX for making AJAX requests
 *  from client
 */

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

			// notify the user that it worked
			main.$.menu.setToastMsg('Project Saved Successfully');
				// main.$emit('updateCurrentProject');
		})
		.error( function(res, error) {
			console.log(res);
			console.log(error);
			main.$.menu.setToastMsg('There was an error saving. Please try again');
		});

	},

	/**
	 *  load project from server with projectID,
	 *  username and reference to main app.
	 *  
	 *  @param  {String} projectID [description]
	 *  @param  {String} username  project username 
	 *  @param  {Object} main      reference to vue.js app (main.js)
	 */
	loadProject: function(projectID, username, main) {

		// show loading and hide editor main-container
		main.shouldLoadExistingProject = true;

		// get sketch from server
		$.ajax({
			url: '/loadproject',
			data: {username: username, projectID: projectID},
			type: 'GET',
		})
		.success( function(res) {
			var proj;
			console.log(res);

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
				console.log(res);
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
		$.ajax({
			url: '/api/files',
			data: {ids: filesToGet},
			type: 'GET',
		})
		.success( function(res) {
			callback(res);
		});
	}

};