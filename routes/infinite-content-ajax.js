// A partial page that shows a single story.  Called from the client via AJAX when they scroll down.

var Game = require('../models/game').Game;
var Constants = require('../constants.js');
var Logger = require('../logger.js');

exports.show = function (req, res)
{
	var skipElementCount = req.query.page_num * Constants.ELEMENTS_PER_LOAD;
	Logger.log("Finding " + req.query.query_type + " games.  req.user:", req.user, "page_num:", req.query.page_num, "skipElementCount:", skipElementCount, "queryType:", req.query.query_type);

	var renderFunc = function(games) {
		res.render('infinite-content-partial', { games: games, currentUser: req.user, message: req.flash('message') });
	};

	switch (req.query.query_type)
	{
		case "recent":
			Game.findRecentGames(skipElementCount, renderFunc);
			break;
		case "random":
			Game.findRandomGames(skipElementCount, renderFunc);
			break;
		case "mystories":
			Game.findMyGames(renderFunc);
			break;
		case "leaderboard":
			Game.findTopVotedGames(renderFunc);
			break;
		default:
			Logger.log("Bad Query Type: " + req.query.query_type);
			break;
	}
};
