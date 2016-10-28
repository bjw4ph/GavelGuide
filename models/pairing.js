var mongoose = require('mongoose');

module.exports = mongoose.model('Pairing', {
	_id : {type: String, required : true},
	team1ID : {type: String, required : true},
	team2ID : {type: String, required : true},
	locationID : {type: String, required : true},
	judgeID : {type: String, required : true},
	roundNumber : {type: String, required : true},
	finished : {type: Boolean, required: true},
	recordings: {type: String, required : false},
	winningTeam : {type: String, required : false},
	speaker1ID : {type: String, required : false},
	speaker2ID : {type: String, required : false},
	speaker3ID : {type: String, required : false},
	speaker4ID : {type: String, required : false},
	speaker1Score : {type: String, required : false},
	speaker2Score : {type: String, required : false},
	speaker3Score : {type: String, required : false},
	speaker4Score : {type: String, required : false}
});