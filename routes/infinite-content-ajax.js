// A partial page that shows a single story.  Called from the client via AJAX when they scroll down.

var async = require('async');				// Allows waterfall cascade of async ops
var Game = require('../models/game').Game;
var Constants = require('../constants.js');
var Logger = require('../logger.js');

exports.show = function (req, res)
{
	async.waterfall([
		// 1) Find first column
		function(callback) {

			var skipElementCount = req.query.page_num * Constants.ELEMENTS_PER_LOAD;
			Logger.log("Finding " + req.query.query_type + " games.  req.user:", req.user, "page_num:", req.query.page_num, "skipElementCount:", skipElementCount, "queryType:", req.query.query_type);

			switch (req.query.query_type)
			{
				case "recent":
					Game.findRecentGames(skipElementCount, callback);
					break;
				case "random":
					Game.findRandomGames(skipElementCount, callback);
					break;
				case "mystories":
					Game.findMyGames(callback);
					break;
				case "leaderboard":
					Game.findTopVotedGames(callback);
					break;
				default:
					Logger.log("Bad Query Type: " + req.query.query_type);
					break;
			}
		},

		// 2) Render response
		function(games, callback) {
			res.render('infinite-content-partial', { games: games, currentUser: req.user, message: req.flash('message') });
		}
	]);

};
