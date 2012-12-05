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
		// Find game
		function(callback) {
			var gameQuery = new Parse.Query("Game").include(["creator", "invitee"]);
			gameQuery.get(req.params.id, {
			  success: function(game) {
				console.log("Successfully found a game for voting: " + game);

				// Users can't vote on their own games
				if (Parse.User.current().get("fbID") == game.get("creator").get("fbID") || Parse.User.current().get("fbID") == game.get("invitee").get("fbID"))
				{
					var msg = "Sorry, you can't vote on your own stories!";
					req.flash('message', msg);
					res.redirect('/');
				}
				else
				{
					callback(null, game);
				}
			  },
			  error: function(error) {
			  	var msg = "Error: " + error.code + " " + error.message;
				console.log();
				req.flash('message', msg);
				res.redirect('/');
			  }
			});
		},
		
		// Users can't duplicate vote on games
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
							var msg = "Error when searching for votes: " + (error == null ? "" : (error.code + " " + error.message));
							console.log();
							req.flash('message', msg);
							res.redirect('/');
						}
				}
			);
		},

		// Make new vote
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
					res.redirect('/');
				}
			});
		},

		// Add to vote count in game
		function(game, callback) {
			game.set("votes", game.get("votes") + 1);
			game.save(null,
			{
				success: function(game)
				{
					var msg = "Congrats, you voted!";
					console.log(msg);
					req.flash('message', msg);
					res.redirect('/');
				},
				error: function(vote, error)
				{
					var msg = "Voting failed, error: " + error.code + " " + error.message;
					console.log(msg);
					req.flash('message', msg);
					res.redirect('/');
				}
			});
		},

	]);
};