var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var gamerSchema = new Schema({
	ips: { type: Array },
	game: {type: String, required: true},
	gamer_id: {type: Number},
	gamertag : { type: String , required: true},
	platform : { type: String , required: true },
	icon : {type: String, default: null},
	top_tags: {type: Array, default: null},
	twitch : {type: String, default: null},
	youtube : {type: String, default: null},
	review_count : {type: Number, default: 0},
	rep_review_count : {type: Number, default: 0},
	profile_picture : {type: String, default: 'img/profile_picture.png'},
  flame_review_count : {type: Number, default: 0},
  expiration_date: { type: Date, default: Date.now },
	reviews : [
		{
			_id : {type : Schema.ObjectId},
			date : {type: Date, default: Date.now},
			comment : {type: String},
			review_type: {type: String},
			rating: {type: Number},
			reviewer_id: {type: Schema.ObjectId},
			tags : [
				{
					id : {type: Schema.ObjectId, required : true},
			   	name : {type: String, required: true},
			   	type : {type: String}
				}
      ]
		}
	]

}, { usePushEach: true });

module.exports = mongoose.model('Gamer', gamerSchema);
