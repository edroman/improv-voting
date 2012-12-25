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
	var skipElementCount = req.query.page_num * Constants.ELEMENTS_PER_LOAD;
	
	console.log("Rendering partial for Current user: " + Parse.User.current() + " req.user: " + req.user + " page_num: " + req.query.page_num + " skipElementCount: " + skipElementCount + " queryType: " + req.query.query_type);
	
	async.waterfall([
		// 1) Find recent games
		function(callback) {

			var query;

			if (req.query.query_type == "home") {
				query = new Parse.Query(Game).include(["creator", "invitee"]).skip(skipElementCount).limit(Constants.ELEMENTS_PER_LOAD);
			}

			query.find(
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
			new Parse.Query(Game).include(["creator", "invitee"]).skip(skipElementCount).limit(Constants.ELEMENTS_PER_LOAD).find(
			{
				success: function(games)
				{
					// For each game...
					var callNext = _.after(games.length, function() { callback(null, recentGames, games) } );
					_.each(games, function(game)
					{
						// Deep load it
						game.load( { success: callNext } );
					});
				},
				error: function(error) {  console.log(error); }
			});
		},
		
		// 3) Render response
		function(recentGames, otherGames, callback) {
			res.render('infinite-content-partial', { recentGames: recentGames, otherGames: otherGames, currentUser: req.user, message: req.flash('message') });
		}
	]);

};
