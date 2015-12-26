/**
 *  module AJAX for making AJAX requests
 *  from client
 */

module.exports = {

	saveProject: function(postData) {

		$.ajax({
			url: '/save/project',
			type: 'POST',
			data: postData,
			dataType: 'json'
		})
		.success( function(res) {
			console.log(res);
		})
		.error( function(res) {
			console.log(res);
		});

	}

};