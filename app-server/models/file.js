/**
 *  not currently in use, 8/20/2015
 *  bringing back 12/26/2015
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
  name: String,
  project_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  created_at: Date,
  updated_at: Date,
  contents: String,

  // TO DO:
  is_library: { type: Boolean, default: false },
  library_name: String
}, { collection: 'pfiles' });


fileSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var PFile = mongoose.model('PFile', fileSchema);

module.exports = PFile;