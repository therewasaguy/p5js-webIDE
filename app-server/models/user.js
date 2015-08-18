// thx https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications

// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String },
  admin: {
    type: Boolean,
    default: false
  },

  github_uid: Number,
  github_profile_url: String,
  github_oa: String,

  email: String,
  avatar_url: String,

  tokens: {
    github: String
  },

  meta: {
    bio: String,
    website: String,
    location: String
  },

  created_at:  {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],



});

// on every save, add the date
userSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;