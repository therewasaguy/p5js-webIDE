require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var favicon = require('serve-favicon');

var settings = require('./app-server/settings.js');
var port = settings.port;
var gh_clientID = settings.GHCLIENT;
var gh_secret = settings.GHSECRET;
var databaseURL = settings.dbURL;

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

var app = express();

// set up db
app.db = require('./app-server/dbcontroller.js'); // load our routes and pass in our app and fully configured passport
app.db.init(app, function() {
	console.log('db initted');
});

app.use(cookieParser());
app.use(session({
		secret: 'mysecret',
		resave: true,
		saveUninitialized: true,
		store: new MongoStore({ mongooseConnection: app.mongooseConnection }),
		cookie: { 
			maxAge: 60000000000
		}
	}));
app.use(passport.initialize());
app.use(passport.session());

app.use( bodyParser.json() );				// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({			// to support URL-encoded bodies
	limit: '50mb',
	extended: true
}));

// view engine setup
app.set('views', __dirname + '/public/views')
app.set('view engine', 'jade');
app.set('view options', { basedir: process.env.__dirname})

// public static
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// routes 
require('./app-server/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

require('./app-server/login.js')(app, passport, GithubStrategy, gh_clientID, gh_secret);

app.listen(port, function(err) {
	console.log('Running on port ' + port);
});