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
var Files = require('./models/file.js');

var Users, Projects, Files, Tests;

module.exports = db = {

	init: function(context, callback) {
		var self = this;

		app = context;
		dbURL = settings.dbURL;

		mongoose.connect(dbURL);

		app.get('/users', function(req, res) {
			var x = User.find();
			console.log(x);
		})
	}

};

// };