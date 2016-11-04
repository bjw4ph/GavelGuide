var mongoose = require('mongoose');

module.exports = mongoose.model('Debater', {
	_id : {type: Number, required : true},
	name : {type: String, required : true},
	school : {type: String, required : true},
	speaks : {type: String, required : true}
}, 'Debater');