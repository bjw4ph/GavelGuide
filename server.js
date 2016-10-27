var express = require('express')
var app = express()
var mongoose = require('mongoose');
var database = require('./config/database.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

mongoose.Promise = global.Promise;
mongoose.connect(database.url);
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

var Team = require('./models/team.js');

app.get('/hello', function(req, res){
	res.json({message: "Whats up"});
});

app.post('/addTeam', function(req,res){
	var UserObj = {
		'name' : req.body.name,
	}

	var newTeam = new Team(TeamObj);
	newTeam.save(function(error, title){
		if(error){
			console.log("Error " + error);
		} else {
			console.log(title);
		}
	})
	res.json({message: "You added a Team"});
});

app.get('/getTeams', function(req,res){
	Team.find(function(error, results){
		res.json({results: results});
	})
})


app.listen(1234);
console.log("App listening on port 1234");