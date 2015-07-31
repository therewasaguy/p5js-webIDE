var http = require('http');
var request = require('request');
var auth = require('./auth');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/loadprojectbygistid', function(req, res) {
		var query = req.query;

		// github oauth
		var gh_oa = query.gh_oa ? gh_oa : auth.GH;
		console.log('github oauth: ' + gh_oa)

		var gistID = query.gistID;
		var ret = [];

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
			}
		});
	});


	app.post('/savegist', function(req, res) {
		var query = req.query;

		// github oauth
		var gh_oa = query.gh_oa ? gh_oa : auth.GH;
		console.log('github oauth: ' + gh_oa)

		var gistID = query.gistID;
		var ret = [];

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
			}
		});
	});

	app.get('/*', function(req, res) {
		res.send('404 error');
	});

};