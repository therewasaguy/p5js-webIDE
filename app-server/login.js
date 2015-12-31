var User = require('./models/user.js');
var db = require('./dbcontroller.js');
var settings = require('./settings.js');

module.exports = function(app, passport, GithubStrategy, gh_clientID, gh_secret) {

  // via http://blog.revathskumar.com/2014/06/express-github-authentication-with-passport.html
  passport.use('github', new GithubStrategy({
    clientID: gh_clientID,
    clientSecret: gh_secret,
    callbackURL: settings.address + '/auth-gh/callback'
  }, function(accessToken, refreshToken, profile, done){

      db.createOrFindUser(accessToken, refreshToken, profile, done)

  }));

  passport.serializeUser(function(user, done) {
    // for the time being you can serialize the user 
    // In the real app you might be storing on the id like user.profile.id 
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {

    console.log('id: ' + id);
    // If you are storing the whole user on session we can just pass to the done method, 
    // But if you are storing the user id you need to query your db and get the user 
    //object and pass to done() 
    User.findById(id, function (err, user) {
      done(err, user);
    });
    // done(null, user);
  });

};