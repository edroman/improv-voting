/////////////////////////////////////////////////////
// Infinite Scroll code (client-side JavaScript)
// Requires that:
//  Elements in the page which are to be infinitely scrolled have the class "infinite"
//  ELEMENTS_PER_LOAD is the # of elements to load on each ajax call
//  QUERY_TYPE is a custom value that is interpreted by the server-side ajax script
//  CONTAINER_ELEMENT contains the infinite list
/////////////////////////////////////////////////////

// Checks to see if a DOM element exists
jQuery.fn.exists = function()
{
	return this.length>0;
}

// Checks to see if an element in the DOM is visible
// Set ignoreAbove to true to ignore DOM elements that we've already scrolled past vertically
function isScrolledIntoView(elem, ignoreAbove)
{
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();

	var elemTop = $(elem).offset().top;
	var elemBottom = elemTop + $(elem).height();

	if (ignoreAbove)
		return (elemBottom <= docViewBottom);
	else
		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

var pagesRequested = 0;
var pagesRetrieved = 0;
var loadedAll = false;

function processInfiniteScroll()
{
	///////////////////////////////////////////////////////
	// Load more stories if needed
	///////////////////////////////////////////////////////

	// Count all hidden story elements
	numStoriesHidden = 0;
	$(".infinite").each( function() {
		if (!isScrolledIntoView($(this), true)) ++numStoriesHidden;
	});
	$('#debug').html(numStoriesHidden + " More Stories...");

	// Perform an AJAX call to load more -- only if we're not waiting for more data from the server from a previous call
	if (!loadedAll && numStoriesHidden <= ELEMENTS_PER_LOAD && pagesRequested == pagesRetrieved)
	{
		// Increment the page we're on
		pagesRequested++;

		// Do an AJAX call to retrieve more content
		$.ajax({
			type: "GET",
			url: "infinite-content-ajax",
			data: { page_num : pagesRequested, query_type : QUERY_TYPE }
		}).done( function(msg) {
			if (msg == "done")
			{
				loadedAll = true;
			}
			else
			{
				$(CONTAINER_ELEMENT).append(msg);
				console.log(msg);
				pagesRetrieved++;

				// Re-hide the "loading" and "no more" elements which the user sees if they're at the bottom
				$('#loading').hide();
				$('#no-more').hide();
			}
		});
	}

	///////////////////////////////////////////////////////
	// Show status of scrolling
	///////////////////////////////////////////////////////

	// By default, hide the "loading" and "no more" elements which the user sees if they're at the bottom
	$('#loading').hide();
	$('#no-more').hide();

	// Determine if we're near the bottom of the screen
	// scrollTop() gives us the number of pixels down from the top of the page we are scrolled
	var nearBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 200);

	// If we're near the bottom of the screen..
	if (nearBottom)
	{
		// If we're on the final page, show "no more stories"
		if (loadedAll)
		{
			$('#no-more').css("top","400");
			$('#no-more').show();
		}
		// If there's more content to load, show "loading"
		else
		{
			$('#loading').css("top","400");
			$('#loading').show();
		}
	}
}

// Whenever the user scrolls or the document is ready, process infinite scroll
$(window).scroll(function () { processInfiniteScroll(); });
$(document).ready( function() { processInfiniteScroll(); });
