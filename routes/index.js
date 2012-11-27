var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
// var Game = require('../models/game').Game;
var Turn = require('../models/turn').Turn;

function parse(req, res)
{
	Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");

	var Turns = Parse.Collection.extend(
	{
		model: Turn
	});
	var Game = Parse.Object.extend("Game",
	{
		turns: Turns
	});
	var Games = Parse.Collection.extend(
	{
		model: Game,
		query: (new Parse.Query(Game).include(["creator", "invitee"]))
	});

	// Instantiate the game tree
	var recentGames = new Games();
	var otherGames = new Games();

	async.waterfall([
		// 1) Find recent games
		function(callback) {
			recentGames.fetch(
			{
				success: function(games)
				{
					// For each game...
					games.each( function(game)
					{
						// Find all turns related to this game
						game.turns = new Parse.Query("Turn").equalTo("Game", game).include(["Game.creator", "Game.invitee", "User"]).collection();
						game.turns.fetch(
						{
							success:
								function(turns)
								{
									// For each turn...
									turns.each( function(turn)
									{
										console.log("Game ID: " + turn.get("Game").id + " Turn ID: " + turn.id + " creator = " + turn.get("Game").get("creator").get("name") + " invitee = " + turn.get("Game").get("invitee").get("name") + " User = " + turn.get("User").get("name"));

										// If we've done an async call to retrieve the last turn of the last game,
										// then invoke callback so we reply with HTTP response
										if (turn == turns.last() && game == games.last())
										{
											callback(null, recentGames);
										}
									});
								},
							error: function(collection, error) { console.log(error); }
						});
					});
				},
				error: function(collection, error) {  console.log(error); }
			});
		},

		// 2) Find random games (TODO)
		function(recentGames, callback) {
			otherGames.fetch(
			{
				success: function(games)
				{
					// For each game...
					games.each( function(game)
					{
						// Find all turns related to this game
						game.turns = new Parse.Query("Turn").include(["Game.creator", "Game.invitee", "User"]).equalTo("Game", game).collection();
						game.turns.fetch(
						{
							success:
								function(turns)
								{
									// For each turn...
									turns.each( function(turn)
									{
										console.log("Game ID: " + turn.get("Game").id + " Turn ID: " + turn.id + " creator = " + turn.get("Game").get("creator").get("name") + " invitee = " + turn.get("Game").get("invitee").get("name") + " User = " + turn.get("User").get("name"));
										
										// If we've done an async call to retrieve the last turn of the last game,
										// then invoke callback so we reply with HTTP response
										if (turn == turns.last() && game == games.last())
										{
											callback(null, recentGames, otherGames);
										}
									});
								},
							error: function(collection, error) { console.log(error); }
						});
					});
				},
				error: function(collection, error) {  console.log(error); }
			});
		},
		
		// 3) Render response
		function(recentGames, otherGames, callback) {
			res.render('index', { recentGames: recentGames, otherGames: otherGames, currentUser: req.user });
		}
	]);

}

/*
 * GET home page.
 */

exports.index = function(req, res){
	parse(req,res);
};