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
	examples = results;
});

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.redirect('/editor');
	});


	app.get('/view/draft', function(req, res) {
		res.render('fsdraft');
	});

	// view a project as its own html page
	app.get('/view/:username/:projectID', viewProject);

	app.get('/view/:projectID', viewProject);

	app.get('/editor', function(req, res) {
		res.render('default');
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
	// app.get('/api/user/:username', db.getUser);
	app.get('/api/user', db.getUser);
	app.get('/api/users', db.getUsers);


	app.get('/api/projects', db.getProjects)

	app.get('/auth-logout', logOut);

	app.get('/profile', ensureAuthenticated, function(req, res) {
		res.send('hi ' + req.user.username + ' you are logged in');
	});

	app.get('/authenticate', doAuthentication);

	app.get('/fetchexamples', function(req, res) {
		res.send(examples);
	});

	// route user/project
	app.get('/*/*', function(req, res, next) {
		if (url.parse(req.url).path.indexOf('.') === -1) {
			res.render('default');
		};
	});

	app.post('/save/project', db.saveProject);

	//============================== AUTH =============================================

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login');
	}


	function doAuthentication(req, res, next) {
		var resp = {};
		if (req.isAuthenticated()) { 
			resp.username = req.user.username; 	// req.session.passport.user.profile.username;
			resp._id = req.user._id; 	// req.session.passport.user.profile.username;
			res.send(resp);
		}
		else {
			// not authenticated
			res.send();
		}
	}

	function logOut(req, res) {
		req.session.destroy();
		req.logout();

		// res.redirect(req.headers.referer);
		res.clearCookie('userid');
		res.redirect('/');
	};


	// ============================== PROJECT =============================================

	// view/(user)/projectID as its own html page
	function viewProject(req, res) {
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

	}

};