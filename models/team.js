var mongoose = require('mongoose');

module.exports = mongoose.model('Team', {
	_id : {type: String, required : true},
	name : {type: String, required : true},
	member1ID : {type: Number, ref: 'Debater'},
	member2ID : {type: Number, ref: 'Debater'},
	wins : {type: String, required : true},
	losses: {type: String, required : true}
},'Team');