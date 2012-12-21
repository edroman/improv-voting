// A partial page that shows a single story.  Called from the client via AJAX when they scroll down.

var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
// var Game = require('../models/game').Game;
var Turn = require('../models/turn').Turn;
var Turns = require('../models/turn').Turns;
var Game = require('../models/game').Game;
var Games = require('../models/game').Games;
var _ = require('underscore')._;
var Constants = require('../constants.js');

exports.show = function (req, res)
{
	var skipElementCount = req.query.page_num * Constants.STORIES_PER_PAGE;
	
	console.log("Rendering partial for Current user: " + Parse.User.current() + " req.user: " + req.user + " page_num: " + req.query.page_num + " skipElementCount: " + skipElementCount);
	
	// Instantiate the game tree
	var otherGames = new Games();

	async.waterfall([
		// 1) Find recent games
		function(callback) {
		
			new Parse.Query(Game).include(["creator", "invitee"]).skip(skipElementCount).limit(Constants.STORIES_PER_PAGE).find(
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
			res.render('story-partial', { recentGames: recentGames, otherGames: otherGames, currentUser: req.user, message: req.flash('message') });
		}
	]);

};
