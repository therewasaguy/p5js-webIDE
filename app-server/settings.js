module.exports = {
	 dbURL: process.env.dbURL || 'mongodb://localhost:27017/p5test1',
	 GHSECRET: process.env.GHSECRET,
	 GHCLIENT: process.env.GHCLIENT,
	 port: process.env.PORT || 3000
};