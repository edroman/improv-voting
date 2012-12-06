var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var Turn = require('../models/turn').Turn;
var Turns = require('../models/turn').Turns;
var Game = require('../models/game').Game;
var Games = require('../models/game').Games;
var _ = require('underscore')._;

exports.show = function(req, res)
{
	async.waterfall([
		// 1) Find all games
		function(callback) {
		
			new Parse.Query(Game).include(["creator", "invitee"]).descending("votes").find(
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
		function(data, callback) {
			res.render('leaderboard', { games: data, currentUser: req.user, message: req.flash('message') });
		}
	]);
};