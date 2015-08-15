var $ = require('jquery');

// mousetrap ~ https://craig.is/killing/mice
var Mousetrap = require('br-mousetrap');

module.exports = function(app) {

	Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
		console.log('save!');

		// prevent default
		return false;
	});

	Mousetrap.bind(['command+n', 'ctrl+n'], function(e) {
		console.log('new!');

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
}();