// Seeds database with test data

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
var Logger = require('../logger.js');

exports.populate = function(req, res)
{
	var player1, player2;

	async.waterfall([
		function(callback) {
			// Retrieve player 1
			var query = new Parse.Query(Parse.User).get("VzjZ5NaC3c", {
				success: function(result) { player1 = result; Logger.log("Found player 1: ", player1); callback(null); }
			});
		},
		function(callback) {
			// Retrieve player 2
			var query = new Parse.Query(Parse.User).get("CvY8hFoGlw", {
				success: function(result) { player2 = result; Logger.log("Found player 2: ", player2); callback(null); }
			});
		},
		function(callback) {
			// Make games
			for (var i=0; i < 10; ++i)
			{
				var game = new Game();
				 
				game.set("completed", false);
				game.set("votes", 0);
				game.set("creator", player1);
				game.set("invitee", player2);
				 
				game.save(
					null,
					{
						success:
							function(game)
							{
								Logger.log("Successfully made game:", game);
		
								// Make some turns for this game
								for (var j=0; j < 3; ++j)
								{
									var turn = new Turn();
									turn.set("Game", game);
									turn.set("User", (j % 2 == 0 ? player1 : player2));
									turn.set("turn", "Test Data  ");
									turn.set("turnNumber", j+1);
							
									turn.save(
										null,
										{
											success: function(turn)
											{
												Logger.log("Successfully made turn ", turn);
											},
											error: function(turn, error)
											{
												Logger.log("Error when saving turn: ", error.code, " ", error.message);
											}
										}
									);
								}
							},
						error:
							function(game, error)
							{
								Logger.log("Error when saving game: ", error.code, " ", error.message);
							}
					}
				);
			}
			
			res.send("Done - check log for results!");
		}
	]);
};