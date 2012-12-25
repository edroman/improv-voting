var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var Game = require('../models/game').Game;
var Games = require('../models/game').Games;
var Turn = require('../models/turn').Turn;
var Turns = require('../models/turn').Turns;
var _ = require('underscore')._;
var Logger = require('../logger');

exports.show = function parse(req, res)
{
	// Find game	
	new Parse.Query(Game).include(["creator", "invitee"]).get(
		req.params.id,
		{
			success: function(game)
			{
				// Deep load game, then render view
				game.load( { success: function() { res.render('story', { game: game, currentUser: req.user, message: req.flash('message') }) } } );
			},
			error: function(error) {  Logger.log(error); }
		}
	);
};
