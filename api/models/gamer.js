var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var gamerSchema = new Schema({
	ips: { type: Array },
	game: {type: String, required: true},
	level: { type: Number },
	gamer_id: { type: Number },
	account_id: {type: Number},
	gamertag : { type: String , required: true},
	platform : { type: String , required: true },
	icon : {type: String, default: null},
	top_tags: { type: Array, default: [] },
	twitch : { type: String, default: null },
	youtube : { type: String, default: null },
	review_count : { type: Number, default: 0 },
	rep_review_count : { type: Number, default: 0 },
	profile_picture : { type: String, default: 'img/profile_picture.png' },
  flame_review_count : { type: Number, default: 0 },
	last_update: { type: Date, default: Date.now },
	reviews : [
		{
			_id : { type : Schema.ObjectId },
			date : { type: Date, default: Date.now },
			comment : { type: String },
			review_type: { type: String },
			rating: { type: Number },
			reviewer_id: { type: Schema.ObjectId },
			tags : [
				{
					id : { type: Schema.ObjectId, required : true },
			   	name : { type: String, required: true },
			   	type : { type: String }
				}
      ]
		}
	],
	stats: {
		ranked: [
			{
				name: { type: String },
				team_name: { type: String },
				type: { type: String },
				league_img_url: { type: String }, 
				wins: { type: Number },
				lost: { type: Number },
				winrate: { type: Number },
				points: { type: Number },
				extras: { type: Object },
				tier: { type: String },
				rank_in_number: { type: Number },
				rank: { type: String }
			}
		],
		frequent_champions: { type: Object },
		roles: { type: Object }
	}

}, { usePushEach: true });

module.exports = mongoose.model('Gamer', gamerSchema);
