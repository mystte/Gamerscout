var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var tagSchema = new Schema({
	name: { type: String, required: true, index: { unique: true } },
	type: { type: String, required: true }
}, { usePushEach: true });

module.exports = mongoose.model('Tag', tagSchema);