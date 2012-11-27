var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");

// Declaring our object model via sublclassing Parse objects.  We can optionally add instance methods / class methods too.
var Turn = Parse.Object.extend("Turn",
{
});

module.exports = Turn;