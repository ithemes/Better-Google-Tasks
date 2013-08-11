var taskLists = new Array(); //array of google tasks lists
var badgeCount = 0; //Number of tasks to display in the badge
var tasksDueToday = 0; //Number of tasks due today
var tasksOverdue = 0; //Number of overdue tasks

/**
 *  Retrieves the manifest file for use in the extension
 *
 * @param callback
 */
function getManifest( callback ) {

	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		callback( JSON.parse( xhr.responseText ) );
	};

	xhr.open( 'GET', '/manifest.json', true );
	xhr.send( null );

}

/**
 * Gets task counts from Google server
 *
 * @param bool returnLists whether to return the list of task lists
 * @return array[mixed] list of task lists if returnLists = true
 */
function getTasks( getLists ) {

	var returnLists = typeof( getLists ) !== 'undefined' ? getLists : false;

	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT; //figure out how we should count tasks

	  $.ajax( {
		async:      false,
		type:       'GET',
		url:        'https://mail.google.com/tasks/m',
		data:       null,
		dataType:   'html',
		error:      function() {
			taskLists = null;
		},
		success:    function( html ) {

			//make sure we have a tasks form to parse
			if ( html.indexOf( '<form method="GET" action="https://mail.google.com/tasks/m">' ) != -1 ) {

				var startpos, strlength, str, currid, currtitle, i;

				str = html;
				strlength = html.length;
				startpos = html.indexOf( "<option value=" );
				i = 0;

				while ( strlength > 0 && startpos > -1 ) {

					str = str.substr( startpos + 15, strlength );
					strlength = str.length;
					currid = str.substr( 0, str.indexOf( "\"" ) );
					str = str.substr(str.indexOf(">") + 1, strlength);
					currtitle = str.substr(0, str.indexOf("</option>"));
					strlength = str.length;
					startpos = str.indexOf( "<option value=" );

					if ( taskLists.length > 0 ) {

						for ( var j = 0; j < taskLists.length; j++ ) {

							if ( taskLists[j].id == currid ) {
								currid = -1;
							}

						}

					} else {

						taskLists[i] = { "id": currid, "title": currtitle };

					}

					if ( currid != -1 ) {

						taskLists[i] =  { "id": currid, "title": currtitle };;
	
					}

					i++;

				}

			} else {

				taskLists =  -1;

			}

		}

	} );

	if ( returnLists === false && taskLists !== null && taskLists !== -1 && taskLists.length > 0 ) {
		
		var todays_date = todaysDate();

		for ( var j = 0; j < taskLists.length; j++ ) {

			$.ajax( {
				type:       'GET',
				url:        'https://mail.google.com/tasks/ig?listid=' + taskLists[j].id,
				data:       null,
				async:      false,
				dataType:   'html',
				success:    function( html ) {

					if ( html.match( /_setup\((.*)\)\}/ ) ) {

						var data = JSON.parse( RegExp.$1 );

						$.each( data.t.tasks, function( i, val ) {

							if (( val.name.length > 0 || ( val.notes && val.notes.length > 0 ) || ( val.task_date && val.task_date.length > 0 ) ) && val.completed == false ) {

								if ( default_count == 'all' || ( default_count == 'today' && val.task_date == todays_date ) || ( default_count == 'presentpast' && parseInt( val.task_date ) <= parseInt( todays_date ) ) || ( default_count == 'future' && parseInt( val.task_date ) >= parseInt( todays_date )) || ( default_count == 'past' && parseInt( val.task_date ) < parseInt( todays_date ) ) ) {
									badgeCount++;
								}

								if ( parseInt( val.task_date ) < parseInt( todays_date ) ) {
									tasksOverdue++;
								}

								if ( parseInt( val.task_date ) == parseInt( todays_date ) ) {
									tasksDueToday++;
								}

							}

						} );

					}

				}

			} );

		}

	}

}

/**
 * Update the badge count
 */
function updateBadge() {

	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT; //figure out how we should count tasks
	var countinterval = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.countinterval' ) || TASKS_COUNTINTERVAL; //interval to refresh the badge count
	var updateTaskInterval = countinterval * ( 1000 * 60 );

	if ( default_count != 'none' ) {

		badgeCount = 0;

		getTasks();

		if ( taskLists === -1 ) { //task lists are invalid. User probably isn't logged in.

			//Set the badge color to grey
			chrome.browserAction.setBadgeBackgroundColor( {
				color: [200, 200, 200, 153]
			} );

			//display an "X" in badge count
			chrome.browserAction.setBadgeText( {
				text: 'X'
			} );

			//set the badge popup to let the user know they're not logged in
			chrome.browserAction.setTitle( {
				title: 'Better Google Tasks - Not Logged In'
			} );

			window.setTimeout( function() { updateTasks(); }, 10000 );

		} else { //update the badge accordingly

			if ( badgeCount > 0 ) { //there are tasks

				//make the badge red to show unfinished tasks
				chrome.browserAction.setBadgeBackgroundColor( {
					color: [153, 0, 0, 153]
				} );

				//push the task count to the badge
				chrome.browserAction.setBadgeText( {
					text: badgeCount.toString()
				} );

				//set the badge popup title to number of tasks
				chrome.browserAction.setTitle( {
					title: TASKS_TITLE + badgeCount.toString()
				} );

			} else { //there are no tasks

				var hide_zero = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.hide_zero' ) || TASKS_ZERO; //do we hide the zero count or not

				//set badge color to zero
				chrome.browserAction.setBadgeBackgroundColor( {
					color: [0, 0, 255, 153]
				} );

				//set badge popup title to something neutral
				chrome.browserAction.setTitle( {
					title: 'Google Tasks'
				} );

				if ( hide_zero == '0' ) { //we're supposed to set the badge count

					chrome.browserAction.setBadgeText( {
						text: '0'
					} );

				} else { //delete the badge count

					chrome.browserAction.setBadgeText( {
						text: ''
					} );

				}

			}

		}

	} else { //the user doesn't want a badge

		//delete the badge text by setting to en empty string
		chrome.browserAction.setBadgeText( {
			text: ''
		} );

		//set a neutral title
		chrome.browserAction.setTitle( {
			title: 'Google Tasks'
		} );
	}

	window.setTimeout( function() { updateTasks(); }, updateTaskInterval );

}

/**
 * Setup notifications
 */
function getNotifications() {

	var notify = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.notify' ) || TASKS_NOTIFY; //The user selected option for notifications

	if ( notify > 0 ) {

		var ttitle, primaryMessage;

		if ( tasksDueToday > 0 || tasksOverdue > 0 ) {

			if ( tasksDueToday > 0 && tasksOverdue > 0 ) {

				if ( tasksDueToday > 1 ) {
					var dtt = 'Tasks';
					var dtm = 'tasks';
				} else {
					var dtt = 'Task';
					var dtm = 'task';
				}

				if ( tasksOverdue > 1 ) {
					var odt = 'Tasks';
					var odm = 'tasks';
				} else {
					var odt = 'Task';
					var odm = 'task';
				}

				ttitle = 'Overdue ' + odt + ' and ' + dtt + ' Due Today';
				primaryMessage = 'You have ' + tasksOverdue + ' overdue ' + odm + ' & ' + tasksDueToday + ' ' + dtm + ' due today.';

			} else if ( tasksDueToday > 0 ) {

				if ( tasksDueToday > 1 ) {
					var dtt = 'Tasks';
					var dtm = 'tasks';
				} else {
					var dtt = 'Task';
					var dtm = 'task';
				}

				ttitle = dtt + ' Due Today';
				primaryMessage = 'You have ' + tasksDueToday + ' ' + dtm + ' due today.';

			} else {

				if ( tasksOverdue > 1 ) {
					var odt = 'Tasks';
					var odm = 'tasks';
				} else {
					var odt = 'Task';
					var odm = 'task';
				}

				ttitle = 'Overdue ' + odt;
				primaryMessage = 'You have ' + tasksOverdue + ' overdue ' + odm + '.';

			}

		}

		var notificationOptions = {
			type:       'basic',
			title:      ttitle,
			message:    primaryMessage,
			iconUrl:    '/images/icon.png',
		}

		chrome.notifications.create( 'BGT', notificationOptions, function() {} );

	}

	window.setTimeout( function() { updateTasks(); }, ( 1000 * 60 * 60 * 12 ) );

}

/**
 * Returns today's date in the format yyyy/mm/dd
 * @returns {string}
 */
function todaysDate() {

	var today = new Date();

	yy = today.getYear();
	mm = today.getMonth() + 1;
	dd = today.getDate();

	//y2k safe... really?
	if ( yy < 2000 ) {
		yy += 1900;
	};

	//pad the month
	if ( mm < 10 ) {
		mm = '0' + mm;
	};

	//pad the day
	if ( dd < 10 ) {
		dd = '0' + dd;
	};

	return yy.toString() + mm.toString() + dd.toString();

}

function inOpen() {
	var port = chrome.extension.getViews({
		type: "popup"
	});

	if ( port.length > 0 ) {
		window.setTimeout( function() { inOpen(); }, 5000 );
	} else {
		updateBadge();
	}
}
