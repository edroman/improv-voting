// Seeds database with test data

var async = require('async');				// Allows waterfall cascade of async ops
var Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");
// var Game = require('../models/game').Game;
var Turn = require('../models/turn').Turn;
var Turns = require('../models/turn').Turns;
var Game = require('../models/game').Game;
var Games = require('../models/game').Games;
var _ = require('underscore')._;
var Constants = require('../constants.js');

