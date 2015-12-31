exports.callback = function(req, res){
  // In the real application you might need to check 
  // whether the user exits and if exists redirect 
  // or if not you many need to create user.

  // TO DO: use session to redirect to proper page
  res.redirect('/');
	// res.redirect(req.headers.referer);

};

exports.error = function(req, res){
  res.send('unable to login');
};