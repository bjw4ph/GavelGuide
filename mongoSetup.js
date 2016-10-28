conn = new Mongo();
db = conn.getDB("gavelGuide");
var bulk = db.teams.initializeUOrderedBulkOp();
bulk.find().remove();
bulk.insert({
	_id : "1",
	name : "Testing Scripting"
	member1ID : "1",
	member2ID : "2",
	wins : "0",
	losses: "0"
});
bulk.insert({
	_id : "2",
	name : "Second Team Here"
	member1ID : "3",
	member2ID : "4",
	wins : "0",
	losses: "0"
});
bulk.insert({
	_id : "3",
	name : "Now it is a party"
	member1ID : "5",
	member2ID : "6",
	wins : "0",
	losses: "0"
});

bulk.execute();
