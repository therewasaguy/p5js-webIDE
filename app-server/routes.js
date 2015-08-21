var http = require('http');
var request = require('request');

var auth = require('./auth');
var settings = require('./settings');

var url = require('url');

var examples;

require('./examples').fetchExamples( function(error, results) {
	console.log('got examples');
	examples = results;
	console.log(examples);
});


module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.redirect('/editor');
	});

	app.get('/editor', function(req, res) {

		res.render('default');
	});


	app.get('/loadprojectbygistid', function(req, res) {
		var query = req.query;

		// github oauth
		// var gh_oa = query.gh_oa ? gh_oa : app.GHOAUTH;
		console.log('github oauth: ' + settings.GHOAUTH);

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
		var token = settings.GHOAUTH;
		console.log('token: ' + token);

		// does the user have an access token? If so, upload to their account.
		if (req.user && req.user.tokens.github) {
			console.log('user has a token');
			token = req.user.tokens.github;
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
				res.send(response);
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

		// res.redirect(req.headers.referer);
		res.clearCookie('userid');
		res.redirect('/');
	});

	app.get('/profile', ensureAuthenticated, function(req, res) {
		res.send('hi ' + req.user.username + ' you are logged in');
	});

	app.get('/authenticate', function(req, res) {
		var resp = {'username': null, '_id': null};

		try {
			// set github oauth to upload gists to the user's account
			// app.GHOAUTH = req.session.passport.user.accessToken;

			resp.username = req.user.username; 	// req.session.passport.user.profile.username;
			resp._id = req.user._id; 	// req.session.passport.user.profile.username;
			res.send(resp);

		} catch(e) {
			console.log('not logged in');
			res.send(resp);
		}

	});

	app.get('/fetchexamples', function(req, res) {
		res.send(examples);
	}),

	app.get('/loadexample', function(req, res) {
		// get example data
		// return
	}),

	// route user/project
	app.get('/*/*', function(req, res, next) {
		if (url.parse(req.url).path.indexOf('.') === -1) {
			res.render('default');
		};

		// if (url.parse(req.url).path.indexOf('.js') > -1) {
		// 	console.log('hey');
		// 	next();
		// }
		// parse username / projID --> this should actually happen clientside so it does nothing now.
		// var pathname = url.parse(req.url).path;
		// var args = pathname.split('/');
		// console.log(args);
		// var username = args[1];
		// var projectID = args[2];
		// console.log('username: ' + username);
		// console.log('projectID: ' + projectID);

		// res.send(username +','+ projectID);
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