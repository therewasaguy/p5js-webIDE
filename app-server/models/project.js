// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var projectSchema = new Schema({
  name: String,

  owner_username: String,
  owner_id: Schema.Types.ObjectId,

  // gist_id: String,

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  },

  // user
  forkedFrom: Schema.Types.ObjectId,

  // new
  pFiles: [{
    id: {type: Schema.Types.ObjectId, ref: 'PFile'},
    name: String
  }],

  // keep instead of unique id's?
  openFileName: String,
  openTabNames: [String],

  public: {type: Boolean, default: false},

  tags: {type: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
    }]
  },


  // old
  files: [{
    name: String,
    contents: String
  }]
});

// on every save, add the date
projectSchema.pre('save', function(next) {
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
var Project = mongoose.model('Project', projectSchema);

// make this available to our users in our Node applications
module.exports = Project;