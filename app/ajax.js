/**
 *  module AJAX for making AJAX requests
 *  from client
 */

module.exports = {

	saveProject: function(postData, self) {
		console.log('AJAX.saveProject ');
		$.ajax({
			url: '/save/project',
			type: 'POST',
			data: postData,
			dataType: 'json'
		})
		.success( function(res) {

			// update values in local storage AND self.currentProject
			self.currentProject._id = res._id;
			self.currentProject.owner_id = res.owner_id;
			self.currentProject.owner_username = res.owner_username;
			self.currentProject.forkedFrom = res.forkedFrom;
			self.currentProject.pFiles = res.pFiles;

			// update file ID's
			for (var i = 0; i < res.pFiles.length; i++) {
				var newF = res.pFiles[i];
				var pFile = self.currentProject.findFile( newF.name );
				pFile._id = newF._id;
				console.log(pFile);
			}

			self.updateProjectInLocalStorage();

			// if we are not on the page, open the page
			console.log(res);

/**
			// -- or -- redirect?
			if (window.location.pathname.indexOf( res._id ) === -1) {
				var username = res.owner_username && res.owner_username.length > 0 ? res.owner_username : '_';
				window.open('/' + username + '/' + res._id, '_self');
			}

			// otherwise, just notify the user that it worked
			else {
				self.currentProject._id = res._id;
				self.$.menu.setToastMsg('Project Saved Successfully');
				self.$emit('updateCurrentProject');
			}
**/
		})
		.error( function(res, error) {
			console.log(res);
			console.log(error);
			self.$.menu.setToastMsg('There was an error saving. Please try again');
		});

	}

};