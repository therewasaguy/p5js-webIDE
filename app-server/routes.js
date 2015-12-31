var http = require('http');
var request = require('request');

var auth = require('./auth');
var settings = require('./settings');

var url = require('url');

var examples;

require('./examples').fetchExamples( function(error, results) {
	examples = results;
});

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.redirect('/editor');
	});

	app.get('/preview', function(req, res) {
		res.render('fsdraft');
	});

	// view a project as its own html page
	app.get('/view/:username/:projectID', db.viewProject);

	app.get('/view/:projectID', db.viewProject);

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


	app.get('/api/projects', db.getProjects);
	app.get('/api/files', db.getFiles);

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

};