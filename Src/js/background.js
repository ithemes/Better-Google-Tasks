var badgeCount = 0; //Number of tasks to display in the badge
var tasksDueToday = 0; //Number of tasks due today
var tasksOverdue = 0; //Number of overdue tasks

//Set the extension version
getManifest( function( manifest ) {
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.version', manifest.version );
} );

getTasks();

alert( 'Task Count = ' + badgeCount + ', Due Today = '+ tasksDueToday + ', Overdue = ' + tasksOverdue );
