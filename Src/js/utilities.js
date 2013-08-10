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
 */
function getTasks() {

	var tasklistIDs = new Array();
	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT; //figure out how we should count tasks

	 $.ajax( {
		async:      false,
		type:       'GET',
		url:        'https://mail.google.com/tasks/m',
		data:       null,
		dataType:   'html',
		error:      function() {
			tasklistIDs = null;
		},
		success:    function( html ) {

			//make sure we have a tasks form to parse
			if ( html.indexOf( '<form method="GET" action="https://mail.google.com/tasks/m">' ) != -1 ) {

				var startpos, strlength, str, currid, i;

				str = html;
				strlength = html.length;
				startpos = html.indexOf( "<option value=" );
				i = 0;

				while ( strlength > 0 && startpos > -1 ) {

					html = html.substr( startpos + 15, strlength );
					currid = html.substr( 0, html.indexOf( "\"" ) );
					strlength = html.length;
					startpos = html.indexOf( "<option value=" );

					if ( tasklistIDs.length > 0 ) {

						for ( var j = 0; j < tasklistIDs.length; j++ ) {

							if ( tasklistIDs[j] == currid ) {
								currid = -1;
							}

						}

					} else {

						tasklistIDs[i] = currid;

					}

					if ( currid != -1 ) {

						tasklistIDs[i] = currid;
					}

					i++;

				}

			} else {

				tasklistIDs =  -1;

			}

		}

	} );

	if ( tasklistIDs !== null && tasklistIDs.length > 0 ) {

		for ( var j = 0; j < tasklistIDs.length; j++ ) {

			$.ajax( {
				type:       'GET',
				url:        'https://mail.google.com/tasks/ig?listid=' + tasklistIDs[j],
				data:       null,
				async:      false,
				dataType:   'html',
				success:    function( html ) {

					if ( html.match( /_setup\((.*)\)\}/ ) ) {

						var data = JSON.parse( RegExp.$1 );

						$.each( data.t.tasks, function( i, val ) {

							if (( val.name.length > 0 || ( val.notes && val.notes.length > 0 ) || ( val.task_date && val.task_date.length > 0 ) ) && val.completed == false ) {

								if ( default_count == 'all' || ( default_count == 'today' && val.task_date == today_ymd ) || ( default_count == 'presentpast' && parseInt( val.task_date ) <= parseInt( today_ymd ) ) || ( default_count == 'future' && parseInt( val.task_date ) >= parseInt( today_ymd )) || ( default_count == 'past' && parseInt( val.task_date ) < parseInt( today_ymd ) ) ) {
									badgeCount++;
								}

								if ( parseInt( val.task_date ) < parseInt( todaysDate() ) ) {
									tasksOverdue++;
								}

								if ( parseInt( val.task_date ) == parseInt( todaysDate() ) ) {
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
