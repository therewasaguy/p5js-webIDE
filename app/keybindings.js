var $ = require('jquery');
var editor = require('./editor');

// mousetrap ~ https://craig.is/killing/mice
var Mousetrap = require('br-mousetrap');

module.exports = function(app) {

	console.log(app);
	Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
		console.log('save!');

		app.saveToCloud();
		// prevent default
		return false;
	});

	Mousetrap.bind(['command+n', 'ctrl+n'], function(e) {
		console.log('new!');
		app.newProject();
		// prevent default
		return false;
	});

	Mousetrap.bind(['command+r', 'ctrl+r'], function(e) {
		console.log('run!');

		app.run();
		// prevent default
		return false;
	});

	Mousetrap.bind(['command+p', 'ctrl+p'], function(e) {
		console.log('play!');

		app.run();
		// prevent default
		return false;
	});

	// konami code!
	Mousetrap.bind('up up down down left right left right b a enter', function() {
		console.log('konami code');
	});

	// $(window).keydown(function(event) {

	// 	// command / control-S to save
	// 	if( (event.ctrlKey || event.metaKey) && event.keyCode == 83) { 
	// 		event.preventDefault(); 
	// 	}

	// 	// cmd-N --> New
	// 	if( (event.ctrlKey || event.metaKey) && event.keyCode == 78 ) { 
	// 		event.preventDefault(); 
	// 	}

	// });
};