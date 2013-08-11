//Set the extension version
getManifest( function( manifest ) {
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.version', manifest.version );
} );

chrome.extension.onConnect.addListener( function( port ) {

	console.assert( port.name == "BGT" );

	port.onMessage.addListener( function( msg ) {

		if ( msg.message == "Update" ) {

			updateBadge();

		} else if ( msg.message == "Open" ) {

			inOpen();

		}

	} );

} );

updateBadge();
getNotifications();

//alert( 'Task Count = ' + badgeCount + ', Due Today = '+ tasksDueToday + ', Overdue = ' + tasksOverdue );
