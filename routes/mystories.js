var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");

exports.show = function(req, res)
{
	// Declaring our object model via sublclassing Parse objects.  We can optionally add instance methods / class methods too.
	var Turn = Parse.Object.extend("Turn",
	{
	});
	var Turns = Parse.Collection.extend(
	{
		model: Turn
	});
	var Game = Parse.Object.extend("Game",
	{
		turns: Turns
	});
	var Games = Parse.Collection.extend(
	{
		model: Game,
	});
	
	// Instantiate the game tree
	var gameList = new Games();

	res.render('mystories', { games: gameList, currentUser: req.user });
};