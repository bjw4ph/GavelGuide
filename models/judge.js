var mongoose = require('mongoose');

module.exports = mongoose.model('Judge', {
	_id : {type: String, required : true},
	name : {type: String, required : true},
	code : {type: String, required : true}
});