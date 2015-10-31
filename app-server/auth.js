exports.callback = function(req, res){
  // In the real application you might need to check 
  // whether the user exits and if exists redirect 
  // or if not you many need to create user.

  // res.send('Login success');
  res.redirect('/');
	// res.redirect(req.headers.referer);

};

exports.error = function(req, res){
	console.log(req);
  res.send('unable to login');
};