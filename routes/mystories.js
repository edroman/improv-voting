var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
var Turn = require('../models/turn').Turn;
var _ = require('underscore')._;

exports.show = function(req, res)
{
	if (!req.user)
	{
		res.redirect('/');
		return;
	}

	var Turns = Parse.Collection.extend(
	{
		model: Turn
	});
	var Game = Parse.Object.extend("Game",
	{
		className: "Game",
		turns: Turns
	});
	Game.prototype.load = function(callback)
	{
		console.log("Game loading turns...");

		// Find all turns related to this game
		this.turns = new Parse.Query("Turn").equalTo("Game", this).include(["Game.creator", "Game.invitee", "User"]).collection();
		this.turns.fetch(
		{
			success: function(turns)
			{
				// For each turn...
				turns.each( function(turn)
				{
					console.log("Game ID: " + turn.get("Game").id + " Turn ID: " + turn.id + " creator = " + turn.get("Game").get("creator").get("name") + " invitee = " + turn.get("Game").get("invitee").get("name") + " User = " + turn.get("User").get("name"));
				});
				console.log(callback);
				callback.success();
			},
			error: function(collection, error) { console.log(error); }
		});
	};

	var Games = Parse.Collection.extend(
	{
		className: "Games",
		model: Game,
		query: (new Parse.Query(Game).include(["creator", "invitee"]))
	});

	async.waterfall([
		// 1) Find games I created
		function(callback) {
			console.log("Current user: " + Parse.User.current().id + " req.user: " + req.user.id);
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
				error: function(error) {  console.log(error); }
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
				error: function(error) {  console.log(error); }
			});
		},
		// 3) Render response
		function(createdGames, invitedGames, callback) {
			// TODO: Merge createdGames and invitedGames
			var games = createdGames.concat(invitedGames);
			console.log(games.length + " stories found for user " + Parse.User.current().id);
			res.render('mystories', { games: games, currentUser: Parse.User.current(), message: req.flash('message') });
		}
	]);
};