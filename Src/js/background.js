var taskCount = 0; //number of tasks to display

chrome.browserAction.onClicked.addListener( function( tab ) {

	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT;
	var countinterval = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.countinterval' ) || TASKS_COUNTINTERVAL;
	var url = TASKS_URL;

} );

//Get the version from the manifest file and set it to options
getManifest( function( manifest ) {
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.version', manifest.version );
} );

localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.checkExp', 0 );

updateTask(); //update tasks

showNotifications(); //show any notifications

/**
 *  Retrieves the manifest file for the extension
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
 * Increment task count by 1
 *
 * @returns {number} number of tasks
 */
function incrCount() {

	taskCount++;
	return taskCount;

}

/**
 * Returns current task count
 *
 * @returns {number} number of tasks
 */
function getCount() {

	return taskCount;

}

/**
 * Reset the task count to zero
 */
function resetCount() {

	taskCount = 0;

}

/**
 * Calculates the current task count
 */
function updateTask() {

	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT; //figure out how we should count tasks

	if ( default_count != 'none' ) {

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

		var today_ymd = yy.toString() + mm.toString() + dd.toString();
		var countinterval = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.countinterval' ) || TASKS_COUNTINTERVAL;
		var count_list = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.count_list' ) || TASKS_LIST;
		var defaultlist = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_list' ) || TASKS_DEFAULT_LIST;
		var murl = 'https://mail.google.com/tasks/m';
		var url = 'https://mail.google.com/tasks/ig?listid=';
		var mult = 1000 * 60;
		var updateTaskInterval = countinterval * mult;

		$.ajax( {

			type:       'GET',
			url:        murl,
			data:       null,
			dataType:   'html',
			success:    function( html ) {

				//make sure we have a tasks form to parse
				if ( html.indexOf( '<form method="GET" action="https://mail.google.com/tasks/m">' ) != -1 ) {

					var listids = [];
					var startpos, strlength, str, currid, i;

					str = html;
					strlength = str.length;
					startpos = str.indexOf( "<option value=" );
					i = 0;

					resetCount();

					while ( strlength > 0 && startpos > -1 ) {

						str = str.substr( startpos + 15, strlength );
						currid = str.substr( 0, str.indexOf( "\"" ) );
						strlength = str.length;
						startpos = str.indexOf( "<option value=" );

						if ( listids.length > 0 ) {

							for ( var j = 0; j < listids.length; j++ ) {

								if ( listids[j] == currid ) {
									currid = -1;
								}

							}

						} else {
							listids[i] = currid;
						}

						if ( currid != -1 ) {
							listids[i] = currid;
						}

						i++;

					}

					for ( var j = 0; j < listids.length; j++ ) {

						if ( ( count_list === 'def' && listids[j] === defaultlist ) || ( count_list === 'all' ) ) {

							$.ajax({
								type:       'GET',
								url:        url + listids[j],
								data:       null,
								async:      false,
								dataType:   'html',
								success:    function( html ) {


									if ( html.match( /_setup\((.*)\)\}/ ) ) {

										var data = JSON.parse( RegExp.$1 );

										$.each( data.t.tasks, function( i, val ) {

											if (( val.name.length > 0 || ( val.notes && val.notes.length > 0 ) || ( val.task_date && val.task_date.length > 0 ) ) && val.completed == false && ( default_count == 'all' || ( default_count == 'today' && val.task_date == today_ymd ) || ( default_count == 'presentpast' && parseInt( val.task_date ) <= parseInt( today_ymd ) ) || ( default_count == 'future' && parseInt( val.task_date ) >= parseInt( today_ymd )) || ( default_count == 'past' && parseInt( val.task_date ) < parseInt( today_ymd ) ) ) ) {
												incrCount();
											};

										} );

									};

								}

							} );

						}

					}

					if ( getCount() > 0 ) { //there are tasks

						//make the badge red to show unfinished tasks
						chrome.browserAction.setBadgeBackgroundColor( {
							color: [153, 0, 0, 153]
						} );

						//push the task count to the badge
						chrome.browserAction.setBadgeText( {
							text: taskCount.toString()
						} );

						//set the badge popup title to number of tasks
						chrome.browserAction.setTitle( {
							title: TASKS_TITLE + taskCount.toString()
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

					window.setTimeout( function() { updateTask(); }, updateTaskInterval );

				} else { //we don't have the tasks html to validate (user not logged in)

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

					window.setTimeout( function() { updateTask(); }, 10000 );

				}

			}

		} );

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

}

/**
 * Display popup notifications for due and overdue tasks
 */
function showNotifications() {
	var notify = localStorage.getItem('com.bit51.chrome.bettergoogletasks.notify') || TASKS_NOTIFY;
	if (notify > 0 && localStorage.getItem('com.bit51.chrome.bettergoogletasks.checkExp') == 0) {

		var today = new Date;
		yy = today.getYear();
		mm = today.getMonth() + 1;
		dd = today.getDate();
		if (yy < 2000) {
			yy += 1900;
		};
		if (mm < 10) {
			mm = '0' + mm;
		};
		if (dd < 10) {
			dd = '0' + dd;
		};

		var today_ymd = yy.toString() + mm.toString() + dd.toString();
		var murl = 'https://mail.google.com/tasks/m';
		var url = 'https://mail.google.com/tasks/ig?listid=';

		$.ajax({
			type: 'GET',
			url: murl,
			data: null,
			dataType: 'html',
			success: function(html, listids) {
				if (html.indexOf("<title>Google Accounts</title>") == -1) {
					var listids = [];
					var startpos, strlength, str, currid, i;
					str = html;
					strlength = str.length;
					startpos = str.indexOf("<option value=");
					i = 0;

					while (strlength > 0 && startpos > -1) {
						str = str.substr(startpos + 15, strlength);
						currid = str.substr(0, str.indexOf("\""));
						strlength = str.length;
						startpos = str.indexOf("<option value=");
						if (listids.length > 0) {
							for (var j = 0; j < listids.length; j++) {
								if (listids[j] == currid) {
									currid = -1;
								}
							}
						} else {
							listids[i] = currid;
						}
						if (currid != -1) {
							listids[i] = currid;
						}
						i++;
					}
					var notifications = new Array();
					for (var j = 0; j < listids.length; j++) {
						$.ajax({
							type: 'GET',
							url: url + listids[j],
							data: null,
							async: false,
							dataType: 'html',
							success: function(html) {
								if (html.match(/_setup\((.*)\)\}/)) {
									var data = JSON.parse( RegExp.$1 );
									$.each(data.t.tasks, function(i, val) {
										if (notify == 1) {
											if (parseInt(val.task_date) < parseInt(today_ymd)) {
												notifications.push(val);
											}
										} else {
											if (parseInt(val.task_date) <= parseInt(today_ymd)) {
												notifications.push(val);
											}
										}
									});
								};
							}
						});
					};

					localStorage.setItem('com.bit51.chrome.bettergoogletasks.checkExp',1);
					for (var i = 0; i < notifications.length; i++) {
						var output = "";
						var month = new Array(12);
						month[0] = "Jan";
						month[1] = "Feb";
						month[2] = "Mar";
						month[3] = "Apr";
						month[4] = "May";
						month[5] = "Jun";
						month[6] = "Jul";
						month[7] = "Aug";
						month[8] = "Sep";
						month[9] = "Octr";
						month[10] = "Nov";
						month[11] = "Dec";
						var eyear = notifications[i].task_date.substr(0, 4);
						var emonth = notifications[i].task_date.substr(4, 2) - 1;
						var eday = notifications[i].task_date.substr(6, 2);
						output = output + 'Due: ' + month[emonth] + ' ' + eday + ', ' + eyear;
						var notify = localStorage.getItem('com.bit51.chrome.bettergoogletasks.notify') || TASKS_NOTIFY;
						if (notifications[i].task_date < today_ymd) {
							var ttitle = 'Overdue Task';
						} else {
							var ttitle = 'Task Due Today';
						}
						var notification = webkitNotifications.createNotification (
							'/images/icon.png',
							ttitle,
							notifications[i].name + ": " + output
							);
						notification.show();
						setTimeout(function(){
							notification.cancel();
						}, 30000);
					}

					window.setTimeout('showNotifications()', (1000 * 60 * 60 * 12));
				}
			}

		} );

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
}

function inOpen() {
	var port = chrome.extension.getViews({
		type: "popup"
	});

	if (port.length > 0 ) {
		window.setTimeout('inOpen()', 5000);
	} else {
		updateTask();
	}
}

chrome.extension.onConnect.addListener(function(port) {
	console.assert(port.name == "BGT");
	port.onMessage.addListener(function(msg) {
		if (msg.message == "Update") {
			updateTask();
		} else if (msg.message == "Open") {
			inOpen();
		}
	});
});
