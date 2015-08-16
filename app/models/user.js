var User = function(name) {

	// generate random unique id, thank you https://gist.github.com/gordonbrander/2230317
	this.id = '_' + Math.random().toString(36).substr(2, 9);

	this.projects = [];
	this.username = '';
	this.email = '';
	this.settings = ''; // string of JSON data

	// authenticated stuff
	this.githubAccount = '';
	this.gh_oa = null;


	if (name) {
		this.username = name;
	} else {
		this.username = '_anon'
	}

};

module.exports = User;