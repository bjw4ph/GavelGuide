var mongoose = require('mongoose');

module.exports = mongoose.model('Location', {
	_id : {type: String, required : true},
	name : {type: String, required : true},
	location : {type: String, required : false}
});