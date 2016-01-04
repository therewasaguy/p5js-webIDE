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
var PFile = require('./models/file.js');

var ProjectBuilder = require('./projectBuilder');


module.exports = db = {

	init: function(context, callback) {
		var self = this;

		app = context;
		dbURL = settings.dbURL;

		mongoose.connect(dbURL);

		context.mongooseConnection = mongoose.connection;

		app.get('/loadproject', function(req, res, next) {
			var username = req.query.username;
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
					console.log('found the project');
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
		var max = 80;
		var userID = req.query.userID || false;
		var limit = req.query.limit || 10;
		var pageNumber = req.query.page;
		var skipCount = pageNumber > 0 ? (pageNumber-1) * limit : 0;

		// to avoid limit Executor error until old projects are removed from database
		// Overflow sort stage buffered data usage exceeds internal limit of 33554432 bytes
		if (limit > max || limit === 'max') limit = max;

		var dataFields = {'name': 1, 'owner_id': 1, 'owner_username': 1, 'updated_at':1, 'created_at':1, 'pFiles': 1, 'forkedFrom': 1 };
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


	// view a project as its own html page
	// '/view/:username/:projectID'
	// '/view/:projectID'
	viewProject: function(req, res) {
		var username = req.params.username;
		var projectID = req.params.projectID
		var data = {
			'username': username,
			'projectname': projectID
		}

		// to do: render loading screen first

		// load project from database
		Project.findOne({'_id': projectID}, function(err, proj) {
			if (err) { console.log('no project found'); res.send('Error: No project found'); return; }
			else if (proj) {

				// NEW DATABASE requires us to fetch files
				if (proj.pFiles && (!proj.files || proj.files.length == 0) ){
					var fileIDs = proj.pFiles.map(function(pF) {
						return pF._id;
					});

					// console.log(fileIDs);

					// find multiple pfiles
					PFile.find({'_id': { $in: fileIDs} }, function(err, docs) {
						if (err) throw err;
						proj.files = docs;
						ProjectBuilder.build(data, proj, res);
					});
				} else {
					ProjectBuilder.build(data, proj, res);
				}


			}
			else {
				console.log('no project found :(');
				res.send('Error: No project found');
				return;
			}
		});
	},

	// /api/files ?ids=[id,id,id]
	getFiles: function(req, res) {
		var fileIDs = req.query.ids || [];

		// find multiple pfiles
		PFile.find({'_id': { $in: fileIDs} }, function(err, docs) {
			if (err) console.log( err );
			res.send(docs);
		});
	},

	// NEW Dec 2015
	saveProject: function (req, res) {
		var returnData = {
			owner_username : req.body.currentUsername || undefined,
			owner_id : req.body.currentUserID || undefined,
			name : req.body.name,
			forkedFrom : req.body.forkedFrom,
			openFileName : req.body.openFileName,
			openTabNames : req.body.openTabNames,
		};

		var newProjData = returnData;

		var filesClean = req.body.filesClean;
		var projID = req.body._id;

		// var postData = {
		// 	_id: projectData._id,
		// 	name: projectData.name,
		// 	openFileName: projectData.openFileName,
		// 	openTabNames: projectData.openTabNames,
		// 	owner_id: projectData.owner_id,
		// 	owner_username: projectData.owner_username,
		// 	currentUserID: this.currentUserID,
		// 	currentUsername: this.currentUser.username,
		// 	filesClean: filesClean
		// 	flag: 'saveAs' or undefined
		// };


		// if no project ID...
		if (!req.body._id) {
			returnData.msg = 'creating new project bc this one has no ID. User: '+ req.body.currentUserID;
			// create new proj, get ID
			var newProj = new Project(newProjData);
			projID = newProj._id;

			saveProject(newProj);
		}

		// saveAs or Fork
		else if (req.body.flag == 'saveAs' || req.body.currentUserID !== req.body.owner_id) {
			returnData.msg = 'fork project to ' + req.body.currentUserID;

			// create a new project
			var newProj = new Project(newProjData);

			// save reference to forkedFrom ID
			newProj.forkedFrom = projID;
			returnData.forkedFrom = projID;

			// new ID
			projID = newProj._id;
			saveProject(newProj);
		}

		else {
			returnData.msg = 'Project already exists. Just updating files';

			// find and update
			Project.findOne({'_id' : projID}, function(err, doc) {
				if (err) console.log(err);
				saveProject(doc);
			});
		}

		// if req.body.currentUserID !== 'null'
		// --> add project to User
		// for (var i = 0; i < filesClean.length; i++) {

		// }

		function saveProject(newProj) {

			newProj.save( function(err, data) {
				if (err) console.log(err);

				console.log('no error!');
				console.log(data);

				// if user exists, save to user
				if (newProj.owner_id) {
					db.addProjectToUser(newProj.owner_id, newProj._id);
				}

				// update list of document id's for this project
				saveProjectFiles( function(newFileIDs) {
					newProj.set({'pFiles' : newFileIDs});
					newProj.save( function(err) {
						if (err) {
							res.send(err)
						}
						else {
							returnData._id = projID;
							returnData.pFiles = newFileIDs;
							res.send(returnData);
						}
					});
				});
			});
		}

		function saveProjectFiles(callback, err) {
			// make sure we have the new project ID at this point...!
			db.updateFiles(filesClean, projID, function(newFileIDs) {
				callback(newFileIDs);
			});
		}

		console.log(returnData.msg);

	},

	// TO DO
	// saveProjectAs: function() { },

	/**
	 *  Save, fork and/or update a list of files recursively.
	 *  Called by saveProject.
	 *  
	 *  @method  updateFiles
	 *  @param  {Array}   fileArray Array of files with contentsChanged
	 *                              if their content was changed.
	 *  @param  {String}   projectID ID for this project
	 *  @param  {Function} callback Callback with array of new file ID's
	 */
	updateFiles: function(fileArray, projectID, callback) {
		var total = fileArray.length;
		var result = []; // array of file ID's
		console.log('update files for project id: ' + projectID);

		// via http://stackoverflow.com/a/10266852/2994108
		function saveAll() {
			var fileData = fileArray.pop();
			var fileObj = {
				'_id' : fileData._id,
				'name' : fileData.name
			};

			// if (fileData has ID and was not changed)
			if (fileData._id && !fileData.contentsChanged) {
				result.push(fileObj);
				saveNext();
			}
			// if file doesnt have ID
			else if (!fileData._id) {
				// TO DO:
				// check to see if any other files in the database have the same content
				// else:
				saveNewFile();
			}

			// if file has id but content was changed
			else {
				PFile.findOne({'_id' : fileData._id}, function(err, doc) {
					if (err) throw err; //handle error

					// if file belongs to projects other than this one, save a new one
					var proj_ids = doc.project_ids;
					if (proj_ids.length > 1 && doc.project_ids.indexOf(projectID > -1)) {
						saveNewFile();
					}
					// otherwise, update with contents & add project ID (is that necessary?)
					else {
						doc.contents = fileData.contentsChanged;

						// necessary?
						if ( doc.project_ids.indexOf(projectID > -1) ) {
							doc.project_ids.push(projectID);
						}
						saveDoc(doc);
					}
				});
			}

			// helper to save new file
			function saveNewFile() {
				console.log('save new file');
				var doc = new PFile({
					name : fileData.name,
					contents : fileData.contentsChanged,
					project_ids : [projectID]
				});
				saveDoc(doc);
			}

			// helper to save existing file
			function saveDoc(doc) {
				console.log('save doc file ' + doc.name);
				if (doc.name == undefined) saveNext();
				doc.save(function(err, saved) {
					if (err) throw err; //handle error
					fileObj._id = saved._id;
					result.push(fileObj);
					saveNext();
				});
			}
		}

		function saveNext() {
			console.log(total);
			if (--total) saveAll();
			else callback(result);
		}

		saveAll();
	},

	// OLD dec 2015
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
							db.addProjectToUser(data.owner_id, project._id);
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
						db.addProjectToUser(data.owner_id, project._id);
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
		console.log('about to add project to user', ownerID, projectID);
		User.update({_id: ownerID}, {$addToSet: {projects: projectID}}, function(err) {
			if (err) console.log( err );

			console.log('added project to user!');
		});
	},


	saveOrUpdateFile: function(req, res) {

	}

};

// };