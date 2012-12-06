var Turn = require('./turn').Turn;
var Turns = require('./turn').Turns;
var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");

var Game = Parse.Object.extend("Game",
{
	className: "Game",
	turns: Turns
});
Game.prototype.load = function(callback)
{
	console.log("Game loading turns...");

	// Find all turns related to this game
	this.turns = new Parse.Query("Turn").equalTo("Game", this).include(["Game.creator", "Game.invitee", "User"]).collection();
	this.turns.fetch(
	{
		success: function(turns)
		{
			// For each turn...
			turns.each( function(turn)
			{
				console.log("Game ID: " + turn.get("Game").id + " Turn ID: " + turn.id + " creator = " + turn.get("Game").get("creator").get("name") + " invitee = " + turn.get("Game").get("invitee").get("name") + " User = " + turn.get("User").get("name"));
			});
			console.log(callback);
			callback.success();
		},
		error: function(collection, error) { console.log(error); }
	});
};

var Games = Parse.Collection.extend(
{
	className: "Games",
	model: Game,
	query: (new Parse.Query(Game).include(["creator", "invitee"]))
});
 
exports.Game = Game;
exports.Games = Games;