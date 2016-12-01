var mongoose = require('mongoose');

module.exports = mongoose.model('Location', {
	_id : {type: String, required : true},
	name : {type: String, required : true},
	address : {type: String, required : true},
	location : {type: String, required : false},
	latitude : {type: String, required : false},
	longitude : {type: String, required : false}
});