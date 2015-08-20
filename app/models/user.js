var User = function(name) {

	this._id = null; // set by database

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