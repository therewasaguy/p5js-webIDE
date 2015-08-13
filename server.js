var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var favicon = require('serve-favicon');

var port = process.env.PORT || 3000;
var gh_clientID = process.env.GHCLIENT;
var gh_secret = process.env.GHSECRET;

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

var app = express();
app.GHOAUTH = process.env.GHOAUTH;

app.use(cookieParser());
app.use(session({secret: 'mysecret'}));
app.use(passport.initialize());
app.use(passport.session());

app.use( bodyParser.json() );				// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({			// to support URL-encoded bodies
	limit: '50mb',
	extended: true
}));

app.set('views', __dirname + '/public/views')
app.set('view engine', 'jade');
app.set('view options', { basedir: process.env.__dirname})

app.use(express.static('public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// routes 
require('./app-server/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

require('./app-server/login.js')(app, passport, GithubStrategy, gh_clientID, gh_secret);


app.listen(port);
console.log('Running on port ' + port);
