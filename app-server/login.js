module.exports = function(app, passport, GithubStrategy, gh_clientID, gh_secret) {

  // config Passport

  // via http://blog.revathskumar.com/2014/06/express-github-authentication-with-passport.html
  passport.use(new GithubStrategy({
    clientID: gh_clientID,
    clientSecret: gh_secret,
    callbackURL: 'http://localhost:3000/auth-gh/callback'
  }, function(accessToken, refreshToken, profile, done){

    console.log(profile.username);
    app.GHOATH = accessToken;

    done(null, {
      accessToken: accessToken,
      profile: profile
    });
  }));

  passport.serializeUser(function(user, done) {
    // for the time being tou can serialize the user 
    // object {accessToken: accessToken, profile: profile }
    // In the real app you might be storing on the id like user.profile.id 
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {

    // If you are storing the whole user on session we can just pass to the done method, 
    // But if you are storing the user id you need to query your db and get the user 
    //object and pass to done() 
    done(null, user);
  });

};