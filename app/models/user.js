var User = function(name) {
	this.id = 0;

	// no github auth yet
	this.gh_oa = null;

	if (name) {
		this.username = name;
	} else {
		this.username = '_anon'
	}

	this.projects = {};
	this.settings = {};
};

module.exports = User;