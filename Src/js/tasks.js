$( document ).ready( function() {

    getTaskFrame();

    var openbehavior = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.openbehavior' ) || TASKS_OPENBEHAVIOR;

    if ( openbehavior == '1' ) {
        $( '#footer' ).prepend( '<span id="windowLink" class="link">Open in New Window <img src="/images/external.png" alt="Open tasks in a new window" /></span> | ' );
    } else {
        $( '#footer' ).prepend( '<span id="windowLink" class="link">Open in New Tab <img src="/images/external.png" alt="Open tasks in a new tab" /></span> | ' );
    }

	$( '#windowLink' ).click( function() {
		openTasks();
	} );

    $( '#printLink' ).click( function() {
        printTasks();
    } );

    $( '#optionsLink' ).click( function() {
        chrome.tabs.create( { url:chrome.extension.getURL( '/html/options.html' ) } );
    } );

    $( '#closeLink' ).click( function() {
        closeTasks();
    } );

} );

/**
 * Find the current tab
 *
 * @param callback a callback function
 */
function getTasksTab( callback ) {

	chrome.tabs.getAllInWindow( undefined, function( tabs ) {

		for ( var i = 0, tab; tab = tabs[i]; i++ ) {

			if ( tab.url && TASKS_URL_RE_.test( tab.url ) ) {

				callback( tab );
				return;
			}

		}

		callback(null);

	} );
}

/**
 * Handle opening tasks in new window or new tab
 */
function openTasks() {

	var openbehavior = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.openbehavior' ) || TASKS_OPENBEHAVIOR;
	var defaultlist = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_list' ) || TASKS_DEFAULT_LIST;

	if ( openbehavior == '1' ) {

		if ( defaultlist != '' ) {

			chrome.windows.create( {
				url : "https://mail.google.com/tasks/canvas?listid=" + defaultlist
			} );

		} else {

			chrome.windows.create( {
				url : "https://mail.google.com/tasks/canvas"
			} );

		}

	} else {

		if ( defaultlist != '' ) {

			chrome.tabs.create( {
				url : "https://mail.google.com/tasks/canvas?listid=" + defaultlist
			} );

		} else {

			chrome.tabs.create( {
				url : "https://mail.google.com/tasks/canvas"
			} );

		}

	}

	window.close();

}

function printTasks() {

	getTasksTab( function( tab ) {

		if ( tab ) {

			chrome.tabs.update( tab.id, {
				selected : true
			} );

		} else {

			chrome.tabs.create( {
				url : "/html/print.html"
			} );
		}

		window.close();

	} );

}

function closeTasks() {
	window.close();
}

/**
 * setup the popup
 */
function getTaskFrame() {

	chrome.extension.onConnect.addListener( function( port ) {
		console.assert( port.name == "BGTOpen" );
	});

	var port = chrome.extension.connect( {
		name : "BGT"
	} );

	port.postMessage( {
		message : "Open"
	} );

	var address;
	var defaultlist = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_list' ) || TASKS_DEFAULT_LIST;
	var default_pop = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_pop' ) || TASKS_POPUP;
	var default_width = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_width' ) || TASKS_WIDTH;
	var default_height = localStorage.getItem( 'com.bit51.chrome.bettergoogletasksJSON.parseeval.default_height' ) || TASKS_HEIGHT;

	if ( default_pop == 'full' ) {
		address = 'https://mail.google.com/tasks/canvas';
	} else {
		address = 'https://mail.google.com/tasks/ig';
	}

	if ( defaultlist != '' ) {
		url = address + "?listid=" + defaultlist;
	} else {
		url = address;
	}

	var frame = document.createElement( 'iframe' );

	frame.setAttribute( 'width', default_width );
	frame.setAttribute( 'height', default_height );
	frame.setAttribute( 'frameborder', '0' );
	frame.setAttribute( 'src', url );
	document.getElementById( 'content' ).appendChild( frame );

	var footer = document.getElementById( 'footer' );

	footer.style.width = ( default_width - 6 );

}
