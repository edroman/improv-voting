var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
// var Game = require('../models/game').Game;
var Turn = require('../models/turn').Turn;
var _ = require('underscore')._;

function parse(req, res)
{
	console.log("Current user: " + Parse.User.current() + " req.user: " + req.user);

	var Turns = Parse.Collection.extend(
	{
		model: Turn
	});
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
	
	// Instantiate the game tree
//	var recentGames = new Games();
	var otherGames = new Games();

	async.waterfall([
		// 1) Find recent games
		function(callback) {
		
			new Parse.Query(Game).include(["creator", "invitee"]).find(
			{
				success: function(games)
				{
					// For each game...
					var callNext = _.after(games.length, function() { callback(null, games) } );
					_.each(games, function(game)
					{
						// Deep load it
						game.load( { success: callNext } );
					});
				},
				error: function(error) {  console.log(error); }
			});
		},

		// 2) Find random games (TODO - calculate some random numbers and ask for rows whose index -- a new column -- match those numbers)
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
			res.render('index', { recentGames: recentGames, otherGames: otherGames, currentUser: Parse.User.current(), message: req.flash('message') });
		}
	]);

}

/*
 * GET home page.
 */

exports.index = function(req, res){
	parse(req,res);
};