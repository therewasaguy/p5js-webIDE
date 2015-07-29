var User = function(name) {

	// generate random unique id, thank you https://gist.github.com/gordonbrander/2230317
	this.id = '_' + Math.random().toString(36).substr(2, 9);

	// no github auth yet
	this.gh_oa = null;

	if (name) {
		this.username = name;
	} else {
		this.username = '_anon'
	}

	this.projects = [];
	this.settings = {};
};

module.exports = User;