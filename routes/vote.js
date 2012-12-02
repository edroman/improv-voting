var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");

/*
 * vote on a story
 */

exports.create = function(req, res)
{
	async.waterfall([
		// 1) Find game
		function(callback) {
			var gameQuery = new Parse.Query("Game");
			gameQuery.get(req.params.id, {
			  success: function(game) {
				console.log("Successfully found a game for voting: " + game);
				callback(null, game);
			  },
			  error: function(error) {
				console.log("Error: " + error.code + " " + error.message);
			  }
			});
		},
		
		// 2) See if user already has a vote for this game
		function(game, callback) {
			var query = new Parse.Query("Vote").equalTo("Game", game).equalTo("User", Parse.User.current()).collection().fetch(
				{
					success:
						function(results)
						{
							if (results.length > 0)
							{
								console.log("Found an existing vote, so user is trying to vote twice");
								
								// Flash message the error
								req.flash('message', "Sorry, you can only vote once per story!");
								res.redirect('/');
//								callback(null, game);
							}
							else
							{
								console.log("Searched for existing votes but found none.");
								callback(null, game);
							}
						},
					error:
						function(collection, error)
						{
							console.log("Error when searching for votes: " + (error == null ? "" : (error.code + " " + error.message)));
							callback(null, game);
						}
				}
			);
		},

		// 3) Make new vote
		function(game, callback) {
			var Vote = Parse.Object.extend("Vote");
			var vote = new Vote();
			vote.set("User", Parse.User.current());
			vote.set("Game", game);
			vote.save(null,
			{
				success: function(vote)
				{
					var msg = "Successfully created vote for " + game.id;
					console.log(msg);
					callback(null, game);
				},
				error: function(vote, error)
				{
					var msg = "Voting failed for story " + game.id + " Error: " + error.code + " " + error.message;
					console.log(msg);
					req.flash('message', msg);
					res.render('index', { message: req.flash('message'), currentUser: req.user });
				}
			});
		},

		// 4) Add to vote count in game
		function(game, callback) {
			game.set("votes", game.get("votes") + 1);
			game.save(null,
			{
				success: function(game)
				{
					var msg = "Congrats, you voted!";
					console.log(msg);
					req.flash('message', msg);
					res.render('index', { message: req.flash('message'), currentUser: req.user });
				},
				error: function(vote, error)
				{
					var msg = "Voting failed, error: " + error.code + " " + error.message;
					console.log(msg);
					req.flash('message', msg);
					res.render('index', { message: req.flash('message'), currentUser: req.user });
				}
			});
		},

	]);
};