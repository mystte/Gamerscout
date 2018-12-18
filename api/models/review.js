var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
	_id: { type: Schema.ObjectId },
	gamer_id: { type: Number },
	date: { type: Date, default: Date.now },
	date_since: { type: String, default: null },
	comment: { type: String },
	review_type: { type: String },
	rating: { type: Number },
	reviewer_id: { type: Schema.ObjectId },
	tags: [
		{
			id: { type: Schema.ObjectId, required: true },
			name: { type: String, required: true },
			type: { type: String }
		}
	]
}, { usePushEach: true });

module.exports = mongoose.model('Review', reviewSchema);