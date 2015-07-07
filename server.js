var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var port = process.env.PORT || 3000;

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index.html');
});


app.get('/*', function(req, res) {
	res.send('404 error');
});

app.listen(port);
console.log('Running on port ' + port);
