/////////////////////////////////////////////////////
// Facebook helper functions
// Requires MY_IP be set to your IP address
/////////////////////////////////////////////////////

// Helper function that logs stuff.
// Can enable/disable logging by commenting out the implementation
function log(text)
{
	// alert(text);
};

log("Beginning load for social APIs for IP " + MY_IP);

// Once the Facebook SDK is fully loaded, this callback will be invoked
window.fbAsyncInit = function()
{
	log("Calling FB.init()");
	FB.init({
		appId: "250634021702621",
		status: true,
		cookie: true,
		channelUrl: (MY_IP + '/channel.html'),
		// oauth: true
	});

	// Associate the method below whenever we receive a Facebook status change
	FB.Event.subscribe('auth.statusChange', handleStatusChange);

	// NOTE: Can subscribe to other notifications here too, such as when the user
	// logs in/out, sends a message, adds a comment, or likes something.
	// See https://developers.facebook.com/docs/reference/javascript/FB.Event.subscribe/
};

// Callback for once we are logged in and authorized
function handleStatusChange(response) {
	// Mark us as connected / not_connected
	document.body.className = response.authResponse ? 'connected' : 'not_connected';

	// Could theoretically use this for debugging
	if (response.authResponse)
	{
		log("Received status change response: " + response.status);
	}
};

// Declare a generic SDK loading function
var loadSDK = function(doc, script, id, src)
{
	var js, fjs = doc.getElementsByTagName(script)[0];
	if (!doc.getElementById(id))
	{
		js = doc.createElement(script);
		js.id = id;
		js.src = src;
		js.async = true;						// Makes SDK load asynchronously
		fjs.parentNode.insertBefore(js,fjs);
	}
};

// Twitter SDK loading
// log("Loading Twitter SDK");
// loadSDK(document, 'script', 'twitter-wjs', 'https://platform.twitter.com/widgets.js');

// Facebook SDK loading
// Note: From the moment you pass parameters like #xfbml=1&appId=X, the FB SDK will auto-init itself, but we want to control that,
// so we don't pass parameters
log("Loading Facebook SDK");
// Production
// loadSDK(document, 'script', 'facebook-jssdk', '//connect.facebook.net/en_US/all.js');
// Debug
loadSDK(document, 'script', 'facebook-jssdk', '//connect.facebook.net/en_US/all/debug.js');

// Facebook callback - useful for doing stuff after Facebook returns.  Passed as parameter to API calls later.
var myResponse;
function callback(response)
{
	log("Received a callback");
	if (response)
	{
		// For debugging - can query myResponse via JavaScript console
		myResponse = response;

		if (response.post_id)
		{
			log('Post was published.');
			alert("Post was published.");
		}
		else
		{
			// Else we are expecting a Response Body Object in JSON, so decode this
			var responseBody = JSON.parse(response.body);

			// If the Response Body includes an Error Object, handle the Error
			if(responseBody.error)
			{
				log(responseBody.error.message);
			}
			// Else handle the data Object
			else
			{
				log('Post was not published.');
			}
		}
	}
}

// This is called when the HTML document + associated images are all fully loaded
// Alternative shortcut is $(function() { ... });
// All API calls go here
// We use "." (class binding) rather than "#" (id binding) since these functions can be reused for multiple HTML elements, and each HTML
// element must have a unique ID
$(document).ready(function ()
{
	log("Defining API calls");

	// Post to your wall
	$('.post_wall').click(function ()
	{
		var nameParam = $(this).attr('name');
		var captionParam = $(this).attr('caption');

		log("Calling post_wall with name: " + nameParam + "    Caption: " + captionParam);

		FB.ui(
			{
				method: 'feed',
				// useful if we want the callback to go to our site, rather than the JavaScript, so we can log an event
				// redirect_uri: MY_IP,
				link: (MY_IP + '/stories/{game.id}'),
				picture: 'http://fbrell.com/f8.jpg',
				name: nameParam,
				caption: captionParam,
				description: '<todo: preview>'
				// display: 'popup'
			},
			callback
		);
		return false;
	});
});