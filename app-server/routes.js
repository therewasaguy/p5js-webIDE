var http = require('http');
var request = require('request');
// var auth = require('./auth');
var GHOAUTH = process.env.GHOAUTH;

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		// res.render('default');
		res.redirect('/editor');
	});

	app.get('/editor', function(req, res) {
		console.log('hello');
		app.locals.hello = 'world';
		// app.locals.world = {
		// 	'hello': 'world',
		// 	'test': '123'
		// };

		res.render('default');
	});


	app.get('/loadprojectbygistid', function(req, res) {
		var query = req.query;

		// github oauth
		var gh_oa = query.gh_oa ? gh_oa : GHOAUTH;
		console.log('github oauth: ' + gh_oa)

		var gistID = query.gistID;
		console.log('looking for gist id ' + gistID);

		var options = {
			url: 'https://api.github.com/gists/' + gistID,
			headers: {
				'User-Agent': 'request',
				'Authorization': 'token ' + gh_oa
			}
		};

		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
			  res.send(body)
			} else if (error) {
				res.send({ error: 'Something blew up!' });
			}
		});
	});


	app.post('/savegist', function(req, res) {

		// default POST, but if there is a gistID, switch to PATCH
		var reqType = 'post';
		var gistID = req.body.gistID;

		var commitMessage = req.body.description;
		var isPublic = req.body['public'];
		var theFiles = req.body.theFiles;
		var url = 'https://api.github.com/gists';

		var data = {
			"description": commitMessage,
			"public": isPublic,
			"files": theFiles
		}

		// github oauth
		var gh_oa = GHOAUTH;

		// if the project exists, patch an update
		if (gistID) {
			url += '/' + gistID;
			reqType = 'patch';
		}

		var options = {
			url: url,
			headers: {
				'User-Agent': 'request',
				'Authorization': 'token ' + gh_oa
			},
			json: true,
			body: data
		};


		request[reqType](options, function(error, response, body) {
			if (!error && response.statusCode == 200 || response.statusCode == 201) {
				console.log('success!');
				res.send(body)
			} else {
				console.log(response.statusCode);
				console.log(response.error);
			}
		});
	});


	app.post('githubauthcallback', function(req, res) {

	});

	// TO DO...
	app.get('/gist/*', function(req, res) {
		var urlSplit = req.url.split('gist/');
		var gistID = urlSplit[1];

		var options = {
			url: 'https://api.github.com/gists/' + gistID,
			headers: {
				'User-Agent': 'request'
			}
		};

		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200 || response.statusCode == 201) {
				var data = JSON.parse(body);
				res.render('default');
			  // res.send(data);
			} else {
				res.send(error);
			}
		});

	});

	app.get('/*', function(req, res) {
		res.render('default');
				// res.send('404 error');
	});

};