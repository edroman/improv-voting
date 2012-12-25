var Turn = require('./turn').Turn;
var Turns = require('./turn').Turns;
var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var _ = require('underscore')._;
var Logger = require('../logger.js');
var Constants = require('../constants.js');

var Game = Parse.Object.extend("Game",
{
	className: "Game",
	turns: Turns
});
Game.prototype.load = function(callback)
{
	// Logger.log("Game loading turns...");

	// Find all turns related to this game
	this.turns = new Parse.Query("Turn").equalTo("Game", this).include(["Game.creator", "Game.invitee", "User"]).collection();
	this.turns.fetch(
	{
		success: function(turns)
		{
			// For each turn...
			turns.each( function(turn)
			{
				// Logger.log("Loaded Game: Game ID: " + turn.get("Game").id + " Turn ID: " + turn.id + " creator = " + turn.get("Game").get("creator").get("name") + " invitee = " + turn.get("Game").get("invitee").get("name") + " User = " + turn.get("User").get("name"));
			});
			callback.success();
		},
		error: function(collection, error) { Logger.log(error); }
	});
};
exports.Game = Game;

var find = function(query, callback)
{
	query.find(
		{
			success:
				function(games)
				{
					// For each game...
					var callNext = _.after(games.length, function() { callback(games) } );
					_.each(games, function(game)
					{
						// Deep load it
						game.load( { success: callNext } );
					});
				},
			error:
				function(error) {  Logger.log(error); }
		}
	);
};
exports.Game.find = find;

exports.Game.findTopVotedGames = function(callback)
{
	find(new Parse.Query(Game).include(["creator", "invitee"]).descending("votes"), function(games) { callback(null, games); } );
};

exports.Game.findMyGames = function(returnCallback)
{
	async.waterfall([
			function(callback)
			{
				find(
					new Parse.Query(Game).include(["creator", "invitee"]).equalTo("creator", Parse.User.current()),
					function(games) { callback(null, games); }
				);
			},
			function(createdGames, callback)
			{
				find(
					new Parse.Query(Game).include(["creator", "invitee"]).equalTo("invitee", Parse.User.current()),
					function(games) { callback(null, createdGames, games); }
				);
			},
			function(createdGames, invitedGames, callback)
			{
				var games = createdGames.concat(invitedGames);
				Logger.log(games.length + " stories found for user:", + Parse.User.current());
				returnCallback(games);
			}
	]);
};

exports.Game.findRecentGames = function(skipElementCount, callback)
{
	find(
		new Parse.Query(Game).include(["creator", "invitee"]).skip(skipElementCount).limit(Constants.ELEMENTS_PER_LOAD),
		function(games) { callback(games); }
	);
};

exports.Game.findRandomGames = function(skipElementCount, callback)
{
	// TODO: Make this actually random.  Calculate some random numbers and ask for rows whose index -- a new column -- match those numbers.
	find(
		new Parse.Query(Game).include(["creator", "invitee"]).skip(skipElementCount).limit(Constants.ELEMENTS_PER_LOAD),
		function(games) { callback(games); }
	);
};

var Games = Parse.Collection.extend(
{
	className: "Games",
	model: Game,
	query: (new Parse.Query(Game).include(["creator", "invitee"]))
});
 
exports.Games = Games;

