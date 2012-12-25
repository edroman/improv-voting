var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var Game = require('../models/game').Game;
var Logger = require('../logger');
var Constants = require('../constants');

exports.show = function(req, res)
{
	var renderFunction = function(games) {
		res.render('leaderboard', { games: games, currentUser: Parse.User.current(), ELEMENTS_PER_LOAD: Constants.ELEMENTS_PER_LOAD, message: req.flash('message') });
	};

	// Find top voted games
	Game.findTopVotedGames(0, renderFunction);
};