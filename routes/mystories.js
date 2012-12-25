var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var Game = require('../models/game').Game;
var Games = require('../models/game').Games;
var Turn = require('../models/turn').Turn;
var Turns = require('../models/turn').Turns;
var _ = require('underscore')._;

exports.show = function(req, res)
{
	if (!req.user)
	{
		res.redirect('/');
		return;
	}

	Logger.log("Current user:", Parse.User.current(), "req.user:", req.user);

	async.waterfall([
		// 1) Find games I created
		function(callback) {
			new Parse.Query(Game).include(["creator", "invitee"]).equalTo("creator", Parse.User.current()).find(
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
				error: function(error) {  Logger.log(error); }
			});
		},
		// 2) Find games I was invited to
		function(createdGames, callback) {
			new Parse.Query(Game).include(["creator", "invitee"]).equalTo("invitee", Parse.User.current()).find(
			{
				success: function(games)
				{
					// For each game...
					var callNext = _.after(games.length, function() { callback(null, createdGames, games) } );
					_.each(games, function(game)
					{
						// Deep load it
						game.load( { success: callNext } );
					});
				},
				error: function(error) {  Logger.log(error); }
			});
		},
		// 3) Render response
		function(createdGames, invitedGames, callback) {
			// TODO: Merge createdGames and invitedGames
			var games = createdGames.concat(invitedGames);
			Logger.log(games.length + " stories found for user:", + Parse.User.current());
			res.render('mystories', { games: games, currentUser: Parse.User.current(), message: req.flash('message') });
		}
	]);
};