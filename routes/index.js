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
var Logger = require('../logger.js')

function parse(req, res)
{
	Logger.log("Current user:", Parse.User.current(), "req.user:", req.user);

	// Count total # of games - used for pagination for infinite scroll to see how much content is left to load
	var totalGameCount;

	var query = new Parse.Query(Game).include(["creator", "invitee"]);

	async.waterfall([
		// 1) Count all games.  TODO: Move to parallel
		function(callback) {
			query.count(
			{
				success: function(count)
				{
					Logger.log("There are " + count + " total games found.");
					
					totalGameCount = count;

					callback(null);
				},
				error: function(error) {  Logger.log(error); }
			});
		},

		// 2) Find recent games
		function(callback) {
			query.limit(Constants.ELEMENTS_PER_LOAD).find(
			{
				success: function(games)
				{
					Logger.log("Loading " + games.length + " games.");

					// Setup a callback
					var callNext = _.after(games.length, function() { callback(null, games) } );

					// For each game...
					_.each(games, function(game)
					{
						// Deep load it
						game.load({
							// On the final async load, invoke the callback
							success: callNext
						});
					});
				},
				error: function(error) {  Logger.log(error); }
			});
		},

		// 3) Find random games (TODO - calculate some random numbers and ask for rows whose index -- a new column -- match those numbers)
		function(recentGames, callback) {
			query.limit(Constants.ELEMENTS_PER_LOAD).find(
			{
				success: function(games)
				{
					Logger.log("Loading " + games.length + " games.");

					// Setup a callback
					var callNext = _.after(games.length, function() { callback(null, recentGames, games) } );

					// For each game...
					_.each(games, function(game)
					{
						// Deep load it
						game.load({
							// On the final async load, invoke the callback
							success: callNext
						});
					});
				},
				error: function(error) {  Logger.log(error); }
			});
		},
		
		// 4) Render response
		function(recentGames, otherGames, callback) {
			res.render('index', { recentGames: recentGames, otherGames: otherGames, currentUser: req.user, ELEMENTS_PER_LOAD: Constants.ELEMENTS_PER_LOAD, totalGameCount: totalGameCount, message: req.flash('message') });
		}
	]);

}

/*
 * GET home page.
 */

exports.index = function(req, res){
	parse(req,res);
};