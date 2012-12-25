
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , vote = require('./routes/vote')
  , story = require('./routes/story')
  , contentajax = require('./routes/infinite-content-ajax')
  , mystories = require('./routes/mystories')
  , leaderboard = require('./routes/leaderboard')
  , seeds = require('./routes/seeds')
  , http = require('http')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , path = require('path')
  , async = require('async')
  , flash = require('connect-flash')
  , Parse = require('parse').Parse;
//Parse.initialize("oqMegxam44o7Bnqw0osiRGEkheO9aMHm7mEGrKhb", "TzhNqjKrx2TOpvVqNEh3ppBJmcqMUkBq9AMvBjxi");
Parse.initialize("WTbIj7pY3jJC3cnqxF2cidV164TOWxgTtbGfjGnF", "l4EnB0wSnIIHUIjjcTiBqsJxHT9zdDVhoTIYSowX");

///////////////////////////////////////////////////////////////
//////////////////// FACEBOOK STUFF ///////////////////////////
///////////////////////////////////////////////////////////////

var FACEBOOK_APP_ID = (process.env.IP ? "238432506263427" : "250634021702621");
var FACEBOOK_APP_SECRET = (process.env.IP ? "bba9d720aab06ec8cd2671e17a235e11" : "5132fb812f464e4a2c300fb5c20db10d");

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete user profile is serialized
//   and deserialized.
passport.serializeUser(
	function(user, done)
	{
		done(null, user);
	}
);

passport.deserializeUser(
	function(obj, done)
	{
		done(null, obj);
	}
);

// Register a callback function to be invoked every time the user tries to log-in
// via facebook.  Passport will call this callback function when Facebook returns
// control to us
//
// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
var ip = process.env.IP || 'http://edro.no-ip.org:3000';
passport.use(
	new FacebookStrategy(
		{
			clientID: FACEBOOK_APP_ID,
			clientSecret: FACEBOOK_APP_SECRET,
			callbackURL: ip + "/auth/facebook/callback"
		},
		// The callback function, invoked from Facebook when it returns
		function(accessToken, refreshToken, profile, done)
		{
			// Associate the Facebook account with a user record in the database,
		
			// Check if user is in database by seeing if the fbID is in there.
			var query = new Parse.Query("User").equalTo("fbID", profile.id);
			query.find(
			{
				// If Parse returns to us...
				success: function(results) {
					console.log("Successfully retrieved " + results.length + " users.");
					
					// Check how many users were found.  If 0..
					if (results.length == 0)
					{
						// Make a new Parse entry
						var user = new Parse.User();
						user.set("email", profile.emails[0].value);
						user.set("first_name", profile.name.givenName);
						user.set("last_name", profile.name.familyName);
						user.set("fbID", profile.id);
						user.set("name", profile.displayName);
						user.set("username", profile.username);
						user.set("password", "improv");		// TODO
						 
						user.signUp(null, {
							success: function(user) {
								console.log("New user created successfully: " + profile._raw);
								
								// Return the newly created user to be persisted in the session
								return done(null, user);
							},
							error: function(user, error) {
								console.log("New user creation failed: " + error.code + " " + error.message + " raw data: " + profile._raw);
								
								return done(null, null);
							}
						});					
					}
					else
					{
						var user = results[0];
						
						// Need to set password again to log-in, since we don't receive the password when we run the query.
						user.set("password", "improv");  // TODO
						console.log("Logging in user id: " + user.id + " user password: " + user.get("password") + " username: " + user.get("username") + " name: " + user.get("name"));
						user.logIn(
						{
							success: function(user) {
								// Login success
								console.log("Parse login success.");

								// Return the existing user to be persisted in the session
								return done(null, user);
							},
							error: function(user, error) {
								// Login failed
								console.log("Parse login failed, reason: " + error.message);

								// Return the existing user to be persisted in the session
								return done(null, user);
							}
						});
					}
				},
				error: function(error) {
					console.log("Error: " + error.code + " " + error.message);
					
					// TODO: Does this need to change?
					return done(null, null);
				}
			});
		
		}
	)
);

///////////////////////////////////////////////////////////////
//////////////////// END FACEBOOK STUFF ///////////////////////
///////////////////////////////////////////////////////////////

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('improv comedy unique cookie'));
  app.use(express.session());
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;}
);

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/rules', function(req,res) { res.render('rules', { currentUser: req.user }); });
app.get('/mystories', mystories.show);
app.get('/infinite-content-ajax', contentajax.show);
app.get('/seeds', seeds.populate);
app.get('/leaderboard', leaderboard.show);
app.get('/vote/:id', ensureAuthenticated, vote.create);
app.get('/stories/:id', story.show);

app.get('/login', function(req, res){
  res.render('login', { currentUser: req.user, message: req.flash('message') });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
	// 2nd parameter is permissions from https://developers.facebook.com/docs/reference/login/user-friend-permissions/
	passport.authenticate('facebook', { scope: 'email' }),
	function(req, res){
		// The request will be redirected to Facebook for authentication, so this
		// function will not be called.
	});

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//app.get('/auth/facebook/callback', 
//  passport.authenticate('facebook', { failureRedirect: '/login' }),
//  function(req, res) {
//    res.redirect('/');
//  });
//
//app.get('/logout', function(req, res){
//  req.logout();
//  res.redirect('/');
//});
//
app.get('/auth/facebook/callback',
	function(req, res, next)
	{
		passport.authenticate('facebook',
			function(err, user, info)
			{
				// Exception occurred
				if (err) { return next(err); }
				
				// Authentication failure
				if (!user)
				{
					req.flash('message', 'Facebook authentication failure');
					return res.redirect('/login');
				}
				
				// Success: Establish a session and associate the returned "user" object (from Parse -- see earlier in this file) with that session
				req.logIn(user, function(err)
				{
					// Exception occurred
					if (err) { return next(err); }
					
					// Goto homepage
					req.flash('message', "Successfully logged in.");
					return res.redirect('/');
				});
			}
		)(req, res, next);
	}
);

app.get('/logout', function(req, res){
  req.logout();
  req.flash('message', "Successfully logged out.");
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
