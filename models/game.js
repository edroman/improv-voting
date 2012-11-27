// var Turn = require('./turn').Turn;
var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");

var Turns = Parse.Collection.extend(
{
	model: Turn
});

var Game = Parse.Object.extend("Game",
{
	turns: Turns
});

function Game() {
	...
};
 
module.exports = Game;
