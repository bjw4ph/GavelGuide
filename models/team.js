var mongoose = require('mongoose');

module.exports = mongoose.model('Team', {
	_id : {type: String, required : true},
	name : {type: String, required : true},
	member1ID : {type: String, required : true},
	member2ID : {type: String, required : true},
	wins : {type: String, required : true},
	losses: {type: String, required : true}
});