var http = require('http');
var request = require('request');

var auth = require('./auth')

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		// res.render('default');
		res.redirect('/editor');
	});

	app.get('/editor', function(req, res) {
		var username = 'anonymous';

		try {
			var username = req.session.passport.user.profile.username;
		} catch(e) {
			console.log('not logged in');
		}

		console.log('username: ' + username);
		res.render('default', {'username': username});
	});


	app.get('/loadprojectbygistid', function(req, res) {
		var query = req.query;

		// github oauth
		// var gh_oa = query.gh_oa ? gh_oa : app.GHOAUTH;
		console.log('github oauth: ' + app.GHOAUTH);

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
		var token = app.GHOAUTH;

		// does the user have an access token? If so, upload to their account.
		if (req.user && req.user.githubToken) {
			console.log('user has a token');
			token = req.user.githubToken;
		}

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
		};

		// if the project exists, patch an update
		if (gistID) {
			url += '/' + gistID;
			reqType = 'patch';
			console.log('it is a patch');
		} else {
			console.log('not a patch');
		}

		var options = {
			url: url,
			headers: {
				'User-Agent': 'request',
				'Authorization': 'token ' + token
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
				console.log('response');
			}
		});
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


	// auth

	// github
	app.get('/auth-gh', passport.authenticate('github', { scope: 'repo, public_repo, gist, user' }));
	app.get('/auth-gh/error', auth.error);
	app.get('/auth-gh/callback',
	  passport.authenticate('github', {failureRedirect: '/auth-gh/error'}),
	  auth.callback
	);

	app.get('/auth-logout', function(req, res) {
		console.log('source: ' + req.headers.referer);

		req.session.destroy();
		req.logout();

		res.redirect(req.headers.referer);
	});

	app.get('/profile', ensureAuthenticated, function(req, res) {
		res.send('hi ' + req.user.username + ' you are logged in');
	});

	app.get('/authenticate', function(req, res) {
		try {

			// set github oauth to upload gists to the user's account
			// app.GHOAUTH = req.session.passport.user.accessToken;

			var username = req.session.passport.user.profile.username;
		} catch(e) {
			console.log('not logged in');
		}
		res.send(username);
	});

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login')
	}


	// app.get('/*', function(req, res) {
	// 	res.redirect('/editor');
	// });

};