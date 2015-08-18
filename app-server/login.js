var User = require('./models/user.js');

module.exports = function(app, passport, GithubStrategy, gh_clientID, gh_secret) {

  // config Passport

  // via http://blog.revathskumar.com/2014/06/express-github-authentication-with-passport.html
  passport.use('github', new GithubStrategy({
    clientID: gh_clientID,
    clientSecret: gh_secret,
    callbackURL: 'http://localhost:3000/auth-gh/callback'
  }, function(accessToken, refreshToken, profile, done){

      var email = profile.email ? profile.email : 'no email provided';

      User.findOne( {$or: [ {github_uid: profile.id}, {email: email} ] }, function(err, account) {

        if (err) { console.log('could not find user ' + account); return done(err); }
        if (account) { console.log('found user: ' + account.username); return done(err, account); }
        else {
          console.log('creating new user: ' + profile.username);
          console.log(profile);

          var user = new User({});
          user.username = profile.username;

          user.github_profile_url = profile.profileUrl;
          user.avatar_url = profile._json.avatar_url;
          user.github_uid = profile.id;
          user.email = profile._json.email;
          user.name = profile._json.name;
          user.meta.bio = profile._json.bio;
          user.meta.website = profile._json.website;
          user.meta.location = profile._json.location;

          user.tokens['github'] = accessToken;

          user.save(function(err) {
            if (err) throw err;

            console.log('User saved successfully!');
            return done(null, user);
          });
        }

      });
  }));

  passport.serializeUser(function(user, done) {
    // for the time being tou can serialize the user 
    // object {accessToken: accessToken, profile: profile }
    // In the real app you might be storing on the id like user.profile.id 

    // var obj = {
    //   accessToken: user.accessToken,
    //   username: user.username
    // }

    done(null, user);
  });

  passport.deserializeUser(function(user, done) {

    // If you are storing the whole user on session we can just pass to the done method, 
    // But if you are storing the user id you need to query your db and get the user 
    //object and pass to done() 
    done(null, user);
  });

};