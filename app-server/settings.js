module.exports = {
	dbURL: process.env.dbURL || 'mongodb://localhost:27017/p5test1',
	GHSECRET: process.env.GHSECRET,
	GHCLIENT: process.env.GHCLIENT,
	// GHOAUTH: process.env.GHOAUTH,
	port: process.env.PORT || 3000,
	address: process.env.ADDRESS || 'http://localhost:3000'
};