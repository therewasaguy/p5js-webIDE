// var mongodb = require('mongodb');
var mongoose = require('mongoose');

var app;
var dB;
var postCollection;
var settings = require('./settings');
var dbURL;
var assert = require('assert');

var User = require('./models/user.js');
var Project = require('./models/project.js');

module.exports = db = {

	init: function(context, callback) {
		var self = this;

		app = context;
		dbURL = settings.dbURL;

		mongoose.connect(dbURL);

		// app.get('/users', function(req, res) {
		// 	User.find({}, function(err, users) {
		// 		res.send(users);
		// 	});
		// });

		// app.get('/projects', function(req, res) {
		// 	var limit = req.query.limit || 10;

		// 	Project.find({}, function(err, projects) {
		// 		res.send(projects);
		// 	}).limit(limit);
		// });

		// get 10 project title, id, dateModified
		app.get('/recentuserprojects', function(req, res) {
			var userID = req.query.userID;
			var limit = req.query.limit || 10;
			Project.find( {'owner_id': userID},  {'name': 1, 'owner_username': 1, 'updated_at':1, 'created_at':1 }, function(err, data) {
				res.send(data);
			}).limit(limit);
		});


		app.get('/loadproject', function(req, res, next) {
			var username = req.query.username;
			console.log('username: ' + username);
			var projectID = req.query.projectID;

			// res.send('hi');
			Project.findOne({'_id': projectID}, function(err, proj) {
				if (err) {
					console.log('no project found');
					res.send('Error: No project found');
					return;
				}

				// TO DO: ensure that owner === user...if not?
				// if (proj && proj.owner_username !== username) {
				// 	console.log('project does not belong to this user');
				// 	res.send('Error: project does not belong to this user');
				// 	return;
				// }
				else if (proj) {
					console.log('found the project, it belongs to this user');
					res.send(proj);
					return;
				}
				else {
					console.log('no project found :(');
					res.send('Error: No project found');
					return;

				}
			});

		});

		// save project to database
		app.post('/saveproject', function(req, res) {

			console.log(req.body.owner_username);

			var callback = function(error, successData) {
				if (error) {
					res.send(error)
				} else {
					res.send(successData);
				}
			}
			self.createOrUpdateProject(req.body, callback);
		});

	},

	// api routes

	// /api/user?username=therewasaguy
	getUser: function(req, res) {
		User.findOne({'username': req.query.username}, function(err, userdata) {
			if (err) {
				console.log('no user found');
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
	},

	// ?limit=&page=
	getUsers: function(req, res) {
		var limit = req.query.limit || 10;
		var pageNumber = req.query.page;
		var skipCount = pageNumber > 0 ? (pageNumber-1) * limit : 1;

		User.find({},{}, gotData)
		.skip(skipCount)
		.limit(limit)
		.sort('-updated_at');

		// callback
		function gotData(err, data) {
			if (err) res.send(err);
			else if (data) res.send(data);
			else res.send('Error: No users found');
		}
	},

	// /api/projects ?limit=&page=
	getProjects: function(req, res) {
		var userID = req.query.userID || false;
		var limit = req.query.limit || 10;
		var pageNumber = req.query.page;
		var skipCount = pageNumber > 0 ? (pageNumber-1) * limit : 1;

		// to avoid limit Executor error until old projects are removed from database
		// Overflow sort stage buffered data usage exceeds internal limit of 33554432 bytes
		if (limit > 80) limit = 80;

		var dataFields = {'name': 1, 'owner_username': 1, 'updated_at':1, 'created_at':1 };
		var searchFields = userID ? {'owner_id': userID} : {};

		Project.find(searchFields, dataFields, gotData)
			.skip(skipCount).limit(limit).sort( '-created_at' );

		// callback
		function gotData(err, data) {
			if (err) res.send(err);
			else if (data) res.send(data);
			else res.send('Error: No projects found');
		}
	},

	createOrUpdateProject: function(data, callback) {
		var self = this;

		// to do: change name to ID
		Project.findOne( {name: data.name}, function(err, proj) {
			if (err) {
				console.log('could not find project');
				callback(err, null);
				return;
			}

			// if the project already exists AND the user is the owner...
			if (proj) {
				console.log(proj.owner_id);
				console.log(data.owner_id);

				// check whether it is the owner
				if (String(proj.owner_id) == String(data.owner_id)) {

					console.log('found existing project: ' + proj.name);

					// update contents:
					var projFiles = [];
					var fileNames = Object.keys(data.fileObjects);
					for (var i = 0; i < fileNames.length; i++) {
						var f = data.fileObjects[fileNames[i]];
						projFiles.push({
							name: f.name,
							contents: f.contents
						});
					}

					// overwrite the files
					Project.update({_id: proj._id}, {files: projFiles}, function(err) {
						if (err) console.log( err );

						console.log('updated files for project ' + proj._id);
					});

					return callback(null, proj);

				}

				// otherwise, FORK
				else {

					var projFiles = [];
					var fileNames = Object.keys(data.fileObjects);
					for (var i = 0; i < fileNames.length; i++) {
						var f = data.fileObjects[fileNames[i]];
						projFiles.push({
							name: f.name,
							contents: f.contents
						});
					}

					var obj = {
						owner_username : data.owner_username || undefined,
						owner_id : data.owner_id || undefined,
						gist_id : data.gistID,
						name : data.name,
						files : projFiles,
						openFileName : data.openFileName,
						openTabNames : data.openTabNames,
						forkedFrom : proj._id
					}

					var newProj = new Project(obj);
					// proj._id = undefined;

					newProj.save(function(err) {
						if (err) console.log(err);

						// if user exists, save
						if (newProj.owner_id) {
							self.addProjectToUser(data.owner_id, project._id);
						}
						return callback(null, newProj);
					});
				}
			}
			else {
				console.log('creating new project: ' + data.name );

				var projFiles = [];
				var fileNames = Object.keys(data.fileObjects);
				for (var i = 0; i < fileNames.length; i++) {
					var f = data.fileObjects[fileNames[i]];
					projFiles.push({
						name: f.name,
						contents: f.contents
					});
				}

				var project = new Project({
					owner_username: data.owner_username,
					owner_id: data.owner_id || null,
					gist_id : data.gistID,
					name : data.name,
					files : projFiles,
					openFileName : data.openFileName,
					openTabNames : data.openTabNames
				});

				project.save(function(err) {
					if (err) console.log( err );

					console.log('project save successfully!');

					// if user exists, save
					if (data.owner_id) {
						self.addProjectToUser(data.owner_id, project._id);
					}
					return callback(null, project);
				});

			}

		});

	},

	createOrFindUser: function(accessToken, refreshToken, profile, done) {

		var email = profile.email ? profile.email : 'no email provided';

		User.findOne( {$or: [ {github_uid: profile.id}, {email: email} ] }, function(err, account) {

			if (err) { console.log('could not find user ' + account); return done(err); }
			if (account) { console.log('found user: ' + account.username); return done(err, account); }
			else {
				console.log('creating new user: ' + profile.username);
				console.log(profile);

				var user = new User({});
				user.username = profile.username;

				user.github_profile_url = profile.profileUrl;
				user.avatar_url = profile._json.avatar_url;
				user.github_uid = profile.id;
				user.email = profile._json.email;
				user.name = profile._json.name;
				user.meta.bio = profile._json.bio;
				user.meta.website = profile._json.website;
				user.meta.location = profile._json.location;

				user.tokens['github'] = accessToken;

				user.save(function(err) {
					if (err) console.log( err );

					console.log('User saved successfully!');
					return done(null, user);
				});
			}
		});

	},


	addProjectToUser: function(ownerID, projectID) {
		User.update({_id: ownerID}, {$addToSet: {projects: projectID}}, function(err) {
			if (err) console.log( err );

			console.log('added project to user!');
		});
	},


	saveOrUpdateFile: function(req, res) {

	}

};

// };