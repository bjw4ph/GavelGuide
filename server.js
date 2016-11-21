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
var Pairing = require('./models/pairing.js');
var Location = require('./models/location.js');
var Judge = require('./models/judge.js');
var Debater = require('./models/debater.js');

app.get('/hello', function(req, res){
	res.json({message: "Whats up"});
});

app.post('/addTeam', function(req,res){
	var TeamObj = {
		'_id' : req.body._id ,
		'member1ID': req.body.member1ID,
		'member2ID': req.body.member2ID,
		'wins' : req.body.wins,
		'losses': req.body.losses,
		'name' : req.body.name
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

app.post('/submitDecision', function(req, res){
	Pairing.findOne({"_id": req.body._id}, function(err, doc){
		doc.finished = true;
		doc.winningTeam = req.body.winningTeam;
		doc.speaker1ID = req.body.speaker1ID; 
		doc.speaker2ID = req.body.speaker2ID;
		doc.speaker3ID = req.body.speaker3ID;
		doc.speaker4ID = req.body.speaker4ID;
		doc.speaker1Score = req.body.speaker1Score;
		doc.speaker2Score = req.body.speaker2Score;
		doc.speaker3Score = req.body.speaker3Score;
		doc.speaker4Score = req.body.speaker4Score;
		doc.save();
		updateDebaterRanks(doc.speaker1ID, doc.speaker1Score);
		updateDebaterRanks(doc.speaker2ID, doc.speaker2Score);
		updateDebaterRanks(doc.speaker3ID, doc.speaker3Score);
		updateDebaterRanks(doc.speaker4ID, doc.speaker4Score);
		if(doc.winningTeam == "1"){
			updateTeamResult(doc.team1ID, true);
			updateTeamResult(doc.team2ID, false);
		} else {
			updateTeamResult(doc.team2ID, true);
			updateTeamResult(doc.team1ID, false);
		}
	} );
	res.json({message: "Decision Saved"});
})

app.get('/getTeams', function(req,res){
	Team.find(function(error, results){
		res.json({results: results});
	})
})

app.get('/getPairing/:pairingId', function(req,res){
	var query = Pairing.find({'_id': req.params.pairingId}).populate('team1ID', 'name').populate('team2ID', 'name').populate('locationID').populate('judgeID');
	query.exec(function(error,results){
		res.json({results: results});
	});
})

function updateDebaterRanks(id, addRank){
	Debater.findOne({"_id": id}, function(err,doc){
		var oldTotal = parseFloat(doc.speaks, 10);
		var addRanks = parseFloat(addRank, 10);
		var newTotal = oldTotal + addRanks;
		doc.speaks = newTotal.toString();
		doc.save();
	})
}
function updateTeamResult(id, result){
	Team.findOne({"_id": id}, function(err, doc){
		if(result){
			var oldWins = parseInt(doc.wins, 10);
			var newWins = oldWins+1;
			doc.wins = newWins.toString();
			doc.save();
		} else {
			var oldLosses = parseInt(doc.losses, 10);
			var newLosses = oldLosses+1;
			doc.losses = newLosses.toString();
			doc.save();
		}
	})
}

app.get('/getCurrentRoundPairings', function(req,res){

	var query = Pairing.find({'finished': false}).populate('team1ID', 'name').populate('team2ID', 'name').populate('locationID').populate('judgeID');
	query.exec(function(error,results){
		res.json({results: results});
	});
})

app.get('/getPreviousResults', function(req,res){

	var query = Pairing.find({'finished': true}).populate('team1ID', 'name').populate('team2ID', 'name').populate('locationID').populate('judgeID').sort({'roundNumber': -1});
	query.exec(function(error,results){
		res.json({results: results});
	});
})

app.get('/getAllPairings', function(req, res){
	var query = Pairing.find().populate('team1ID', 'name').populate('team2ID', 'name').populate('locationID').populate('judgeID').sort({'roundNumber': -1});
	query.exec(function(error,results){
		res.json({results: results});
	});
})

app.get('/getRankedTeams', function(req,res){
	var query = Team.find().sort('wins');
	query.exec(function(error,results){
		res.json({results: results});
	})

})
app.get('/getRankedTeamsJoin', function(req,res){
	// var query = Team.find().populate('member1ID').populate('member2ID').sort([['wins', -1], ['member1ID.speaks', -1], ['member2ID.speaks', -1]]);
	// var query = Team.find().populate('member1Id').populate('member2Id').sort([['member1Id.speaks', -1]]);
	//var query = Team.findOne().populate('member1ID');
	//var query = Team.find().populate('member1ID','member2ID');
	var query = Team.find().populate('member1ID').populate('member2ID').sort({'wins': -1});



	query.exec(function(error,results){
		res.json({results: results});
	})

})



app.get('/setUpMongo', function(req,res){
		var bulk = Team.collection.initializeOrderedBulkOp();
		bulk.find({}).remove();
		bulk.insert({
			_id : "1",
			name : "UVA1",
			member1ID : 1,
			member2ID : 2,
			wins : "1",
			losses: "0"
		});
		bulk.insert({
			_id : "2",
			name : "Death of Democracy",
			member1ID : 3,
			member2ID : 4,
			wins : "0",
			losses: "1"
		});
		bulk.insert({
			_id : "3",
			name : "A New Hope",
			member1ID : 5,
			member2ID : 6,
			wins : "1",
			losses: "0"
		});
		bulk.insert({
			_id : "4",
			name : "Dark Knights",
			member1ID : 7,
			member2ID : 8,
			wins : "0",
			losses: "1"
		});
		bulk.insert({
			_id : "5",
			name : "Gotham Gangstas",
			member1ID : 9,
			member2ID : 10,
			wins : "0",
			losses: "1"
		});
		bulk.insert({
			_id : "6",
			name : "UVA Prime",
			member1ID : 11,
			member2ID : 12,
			wins : "1",
			losses: "0"
		});
		bulk.insert({
			_id : "7",
			name : "Avengers1",
			member1ID : 13,
			member2ID : 14,
			wins : "0",
			losses: "1"
		});
		bulk.insert({
			_id : "8",
			name : "Avengers2",
			member1ID : 15,
			member2ID : 16,
			wins : "1",
			losses: "0"
		});
		bulk.insert({
			_id : "9",
			name : "Avengers3",
			member1ID : 17,
			member2ID : 18,
			wins : "1",
			losses: "0"
		});
		bulk.insert({
			_id : "10",
			name : "Avengers4",
			member1ID : 19,
			member2ID : 20,
			wins : "0",
			losses: "1"
		});
		bulk.execute();

		var bulkDebater = Debater.collection.initializeOrderedBulkOp();
		bulkDebater.find({}).remove();
		bulkDebater.insert({
			_id : 1,
			name : 'Brandon Whitfield',
			school : 'UVA',
			speaks : '26.5'
		});
		bulkDebater.insert({
			_id : 2,
			name : 'Ryan Coughlin',
			school : 'UVA',
			speaks : '26.5'
		});
		bulkDebater.insert({
			_id : 3,
			name : 'Donald Trump',
			school : 'Trump University',
			speaks : '23.5'
		});
		bulkDebater.insert({
			_id : 4,
			name : 'Mike Pence',
			school : 'Trump University',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 5,
			name : 'Hillary Clinton',
			school : 'NYU',
			speaks : '26'
		});
		bulkDebater.insert({
			_id : 6,
			name : 'Tim Kaine',
			school : 'NYU',
			speaks : '25.5'
		});
		bulkDebater.insert({
			_id : 7,
			name : 'Batman',
			school : 'Gotham University',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 8,
			name : 'Robin',
			school : 'Gotham University',
			speaks : '25.5'
		});
		bulkDebater.insert({
			_id : 9,
			name : 'The Joker',
			school : 'Gotham University',
			speaks : '26.25'
		});
		bulkDebater.insert({
			_id : 10,
			name : 'Harley Quinn',
			school : 'Gotham University',
			speaks : '23.5'
		});
		bulkDebater.insert({
			_id : 11,
			name : 'Thomas Jefferson',
			school : 'UVA',
			speaks : '26.5'
		});
		bulkDebater.insert({
			_id : 12,
			name : 'TSully',
			school : 'UVA',
			speaks : '26.25'
		});
		bulkDebater.insert({
			_id : 13,
			name : 'Captain America',
			school : 'Avengers U',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 14,
			name : 'Scarlet Witch',
			school : 'Avengers U',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 15,
			name : 'Iron Man',
			school : 'Avengers U',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 16,
			name : 'Thor',
			school : 'Avengers U',
			speaks : '25.25'
		});
		bulkDebater.insert({
			_id : 17,
			name : 'Bruce Banner',
			school : 'Avengers U',
			speaks : '25'
		});
		bulkDebater.insert({
			_id : 18,
			name : 'Hawkeye',
			school : 'Avengers U',
			speaks : '25.5'
		});
		bulkDebater.insert({
			_id : 19,
			name : 'Black Widow',
			school : 'Avengers U',
			speaks : '26.25'
		});
		bulkDebater.insert({
			_id : 20,
			name : 'Doctor Strange',
			school : 'Avengers U',
			speaks : '24.75'
		});
		bulkDebater.execute();

		var bulkLocation = Location.collection.initializeOrderedBulkOp();
		bulkLocation.find({}).remove();
		bulkLocation.insert({
			_id : '5',
			name : 'Rice 230',
			address : '85+Engineer\'s+Way,+Charlottesvile,+VA'
		});
		bulkLocation.insert({
			_id : '2',
			name : 'Olsson 120',
			address : 'Olsson+Hall,+Charlottesville,+VA+22903'
		});
		bulkLocation.insert({
			_id : '3',
			name : 'Newcomb Auditorium',
			address: 'Newcomb+Hall,+180+McCormick+Road,+Charlottesville,+VA+22903'
		});
		bulkLocation.insert({
			_id : '4',
			name : 'New Cabell 444',
			address : 'Cabell+Hall,+Charlottesville,+VA+22903'
		});
		bulkLocation.insert({
			_id : '1',
			name : 'Rotunda',
			address : '1826+University+Ave,+Charlottesville,+VA+22904'
		});
		bulkLocation.execute();

		var bulkJudge = Judge.collection.initializeOrderedBulkOp();
		bulkJudge.find({}).remove();
		bulkJudge.insert({
			_id : '1',
			name : 'Judge1',
			code : 'star1'
		});
		bulkJudge.insert({
			_id : '2',
			name : 'Judge2',
			code : 'star2'
		});
		bulkJudge.insert({
			_id : '3',
			name : 'Judge3',
			code : 'star3'
		});
		bulkJudge.insert({
			_id : '4',
			name : 'Judge4',
			code : 'star4'
		});
		bulkJudge.insert({
			_id : '5',
			name : 'Judge5',
			code : 'star5'
		});

		bulkJudge.execute();

		var bulkPairing = Pairing.collection.initializeOrderedBulkOp();
		bulkPairing.find({}).remove();
		bulkPairing.insert({
			_id : '1',
			team1ID : '1',
			team2ID : '2',
			locationID : '1',
			judgeID : '1',
			roundNumber : '1',
			winningTeam : '1',
			speaker1ID : '1',
			speaker2ID : '2',
			speaker3ID : '3',
			speaker4ID : '4',
			speaker1Score : '26.5',
			speaker2Score : '26.5',
			speaker3Score : '23.5',
			speaker4Score : '25',
			finished : true

		});

		bulkPairing.insert({
			_id : '2',
			team1ID : '3',
			team2ID : '4',
			locationID : '2',
			judgeID : '2',
			roundNumber : '1',
			winningTeam : '1',
			speaker1ID : '5',
			speaker2ID : '6',
			speaker3ID : '7',
			speaker4ID : '8',
			speaker1Score : '26',
			speaker2Score : '25.5',
			speaker3Score : '25',
			speaker4Score : '25.5',
			finished : true

		})

		bulkPairing.insert({
			_id : '3',
			team1ID : '5',
			team2ID : '6',
			locationID : '3',
			judgeID : '3',
			roundNumber : '1',
			winningTeam : '2',
			speaker1ID : '9',
			speaker2ID : '10',
			speaker3ID : '11',
			speaker4ID : '12',
			speaker1Score : '26.25',
			speaker2Score : '23.5',
			speaker3Score : '26.5',
			speaker4Score : '26.25',
			finished : true
		})
		bulkPairing.insert({
			_id : '4',
			team1ID : '7',
			team2ID : '8',
			locationID : '4',
			judgeID : '4',
			roundNumber : '1',
			winningTeam : '2',
			speaker1ID : '13',
			speaker2ID : '14',
			speaker3ID : '15',
			speaker4ID : '16',
			speaker1Score : '25',
			speaker2Score : '25',
			speaker3Score : '25.5',
			speaker4Score : '25.25',
			finished : true
		})
		bulkPairing.insert({
			_id : '5',
			team1ID : '9',
			team2ID : '10',
			locationID : '5',
			judgeID : '5',
			roundNumber : '1',
			winningTeam : '2',
			speaker1ID : '17',
			speaker2ID : '18',
			speaker3ID : '19',
			speaker4ID : '20',
			speaker1Score : '25',
			speaker2Score : '25',
			speaker3Score : '26.25',
			speaker4Score : '24.75',
			finished : true
		})
		bulkPairing.insert({
			_id : '6',
			team1ID : '1',
			team2ID : '3',
			locationID : '1',
			judgeID : '1',
			roundNumber : '2',
			finished : false
		})
		bulkPairing.insert({
			_id : '7',
			team1ID : '2',
			team2ID : '4',
			locationID : '2',
			judgeID : '2',
			roundNumber : '2',
			finished : false
		})
		bulkPairing.insert({
			_id : '8',
			team1ID : '6',
			team2ID : '10',
			locationID : '3',
			judgeID : '3',
			roundNumber : '2',
			finished : false
		})
		bulkPairing.insert({
			_id : '9',
			team1ID : '5',
			team2ID : '7',
			locationID : '4',
			judgeID : '4',
			roundNumber : '2',
			finished : false
		})
		bulkPairing.insert({
			_id : '10',
			team1ID : '8',
			team2ID : '9',
			locationID : '5',
			judgeID : '5',
			roundNumber : '2',
			finished : false
		})

		bulkPairing.execute();




	// Team.remove({}, function(err){
	// 	console.log("Erased Everything");
	// 	var team1 = {
	// 		_id : "1",
	// 		name : "Testing Scripting",
	// 		member1ID : "1",
	// 		member2ID : "2",
	// 		wins : "0",
	// 		losses: "0"
	// 	};
	// 	var team2 = {
	// 		_id : "2",
	// 		name : "Second Team Here",
	// 		member1ID : "3",
	// 		member2ID : "4",
	// 		wins : "0",
	// 		losses: "0"
	// 	};
	// 	var team3 = {
	// 		_id : "3",
	// 		name : "Now it is a party",
	// 		member1ID : "5",
	// 		member2ID : "6",
	// 		wins : "0",
	// 		losses: "0"
	// 	};
	// 	var newTeam1 = new Team(team1);
	// 	var newTeam2 = new Team(team2);
	// 	var newTeam3 = new Team(team3);
	// 	var teams = [newTeam1, newTeam2, newTeam3];
	// 	var bulk = Team.collection.initializeOrderedBulkOp();
	// 	bulk.insert({
	// 		_id : "1",
	// 		name : "Testing Scripting",
	// 		member1ID : "1",
	// 		member2ID : "2",
	// 		wins : "0",
	// 		losses: "0"
	// 	});
	// 	bulk.insert({
	// 		_id : "2",
	// 		name : "Second Team Here",
	// 		member1ID : "3",
	// 		member2ID : "4",
	// 		wins : "0",
	// 		losses: "0"
	// 	});
	// 	bulk.insert({
	// 		_id : "3",
	// 		name : "Now it is a party",
	// 		member1ID : "5",
	// 		member2ID : "6",
	// 		wins : "0",
	// 		losses: "0"
	// 	});

	// 	bulk.execute();
	// 	// Team.collection.insert(teams, function(err, docs){
	// 	// 	if(err){

	// 	// 	} else {
	// 	// 		console.log("Successfully added");
	// 	// 	}
	// 	// });
	// });
	res.json({message: "Set up"});
});

app.listen(1234);
console.log("App listening on port 1234");