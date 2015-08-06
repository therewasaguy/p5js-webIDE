var express = require('express');
var app = express();

var bodyParser = require('body-parser')

var favicon = require('serve-favicon');
var port = process.env.PORT || 3000;

var passport = require('passport');

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



app.listen(port);
console.log('Running on port ' + port);
