var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
	gamer_mongo_id : {type: Schema.ObjectId, required: true},
	_id : {type : Schema.ObjectId},
	date : {type: Date, default: Date.now},
	comment : {type: String},
	review_type: {type: String},
	tags : [
		{
			_id : {type: Schema.ObjectId, required : true},
			name : {type: String, required: true},
			type : {type: String}
		}
	]
});

module.exports = mongoose.model('Review', reviewSchema);