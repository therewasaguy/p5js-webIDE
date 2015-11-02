var http = require('http');
var request = require('request');

var auth = require('./auth');
var settings = require('./settings');

var url = require('url');

var examples;

var Project = require('./models/project.js');
var User = require('./models/user.js');

var jsdom = require('jsdom');
var jquery = require('jquery')(jsdom.jsdom().defaultView);

require('./examples').fetchExamples( function(error, results) {
	console.log('got examples');
	examples = results;
});


module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.redirect('/editor');
	});

	// view a project as its own html page
	app.get('/view/:username/:projectID', function(req, res) {
		var username = req.params.username;
		var projectID = req.params.projectID
		var data = {
			'username': username,
			'projectname': projectID
		}

		// to do: render loading screen first

		// load project from database
		Project.findOne({'_id': projectID}, function(err, proj) {
			if (err) {
				console.log('no project found');
				res.send('Error: No project found');
				return;
			}
			else if (proj) {
				console.log('found the project, it belongs to this user');
				data.projName = proj.name;

				data.jsFiles = proj.files.filter(function(fileObj) {
					if (fileObj.name.substr(fileObj.name.length - 2) == 'js') {
						return true;
					} else {
						console.log(fileObj.name);
						return false;
					}
				});

				data.cssFiles = proj.files.filter(function(fileObj) {
					if (fileObj.name.substr(fileObj.name.length - 3) == 'css') {
						return true;
					} else {
						return false;
					}
				});

				var htmlIndexArray = proj.files.filter(function(fileObj) {
					if (fileObj.name === 'index.html') {
						return true;
					} else {
						return false;
					}
				});

				data.htmlIndex = htmlIndexArray[0];

				// index contents will be only the body
				var docContents = data.htmlIndex.contents;
				var localScriptsInOrder = [];
				var docBody = '';

				// filter index.html to parse out scripts that we have locally
				jsdom.env({
					html: docContents,
					done: function(err, window) {
						var head = window.document.getElementsByTagName('head')[0];
						var scriptTags = window.document.getElementsByTagName('script');
						for (var i = 0; i < scriptTags.length; i++) {
							var sTag = scriptTags[i];
							var src = sTag.src;
							var indexOfMatch = 0;

							// to do: remove these items from the head ONLY if they refer to localfiles
							if (data.jsFiles.filter(function(f) {
								if (f.name == src) {
									indexOfMatch = data.jsFiles.indexOf(f);
									return true;
								} else {
									return false;
								}
							})) {

								// remove src and change content of script tag
								jquery(sTag).removeAttr('src');
								jquery(sTag).text(data.jsFiles[indexOfMatch].contents);
							}
						}

						var headContent = head.innerHTML;
						var bodyContent = window.document.getElementsByTagName('body')[0].innerHTML

						data.htmlHead = headContent;
						data.htmlBody = bodyContent;
						res.render('viewproject', data);
					}
				});

			}
			else {
				console.log('no project found :(');
				res.send('Error: No project found');
				return;

			}
		});

	});

	app.get('/view/draft', function(req, res) {
		res.render('fsdraft');
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

	// api routes
	app.get('/api/user/:username', function(req, res) {
		User.findOne({'username': req.params.username}, function(err, userdata) {
			if (err) {
				console.log('no project found');
				res.send('Error: No project found');
				return;
			}
			else if (userdata) {
				res.send(userdata);
			}
			else {
				console.log('no user found :(');
				res.send('Error: No user found');
				return;

			}
		});
	});

	app.get('/api/projects', function(req, res) {
		console.log('loading projects');

		Project.find(function(err, data) {
			if (err) {
				console.log('no project found');
				res.send('Error: No project found');
				return;
			}
			else if (data) {
				res.send(data);
			}
			else {
				console.log('no data found :(');
				res.send('Error: No user found');
				return;

			}
		})
		.limit( 10 )
		.sort( '-created_at' );
	});


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