$( document ).ready( function() {

	restoreOptions();

	$( '#extVersion' ).prepend( localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.version' ) );

	$( '#saveOptions' ).click( function() {
		saveOptions();
	} );

	$( '#resetOptions' ).click( function() {
		resetOptions();
	} );

} );

function restoreOptions() {

	var hide_zero = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.hide_zero' ) || TASKS_ZERO;
	var default_count = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_count' ) || TASKS_COUNT;
	var countinterval = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.countinterval' ) || TASKS_COUNTINTERVAL;
	var count_list = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.count_list' ) || TASKS_LIST;
	var default_pop = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_pop' ) || TASKS_POPUP;
	var default_width = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_width' ) || TASKS_WIDTH;
	var default_height = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_height' ) || TASKS_HEIGHT;
	var notify = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.notify' ) || TASKS_NOTIFY;
	var openbehavior = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.openbehavior' ) || TASKS_OPENBEHAVIOR;
	var default_list = localStorage.getItem( 'com.bit51.chrome.bettergoogletasks.default_list' ) || TASKS_DEFAULT_LIST;

	$( 'input[name=hide_zero]' ).val( [hide_zero ] );
	$( 'input[name=default_count]' ).val( [default_count] );
	$( 'input[name=count_list]' ).val( [count_list] );
	$( 'input[name=default_pop]' ).val( [default_pop] );
	$( 'input[name=countinterval]' ).val( countinterval );
	$( 'input[name=default_width]' ).val( default_width );
	$( 'input[name=default_height]' ).val( default_height );
	$( 'input[name=notify]' ).val( [notify] );
	$( 'input[name=openbehavior]' ).val( [openbehavior] );

	getTasks( true );

	for ( var i = 0; i < taskLists.length; i++ ) {

		var listSel = document.getElementById( "lists" );
		var listSelected = false;

		if ( taskLists[i].id == default_list ) {
			listSelected = true;
		}

		listSel.add( new Option( taskLists[i].title, taskLists[i].id, listSelected ), null );
	}

	setSelectByValue( 'opform', 'default_list', default_list );
}

function saveOptions() {
	
	var default_count = $('input[name=default_count]:checked' ).val() || TASKS_COUNT;
	var hide_zero = $('input[name=hide_zero]:checked' ).val() || TASKS_ZERO;
	var default_pop = $('input[name=default_pop]:checked' ).val() || TASKS_POPUP;
	var count_list = $('input[name=count_list]:checked' ).val() || TASKS_LIST;
	var countinterval = $('input[name=countinterval]' ).val() || TASKS_COUNTINTERVAL;
	var default_list = $('select[name=default_list]' ).val() || TASKS_DEFAULT_LIST;
	var default_width = $('input[name=default_width]' ).val() || TASKS_WIDTH;
	var default_height = $('input[name=default_height]' ).val() || TASKS_HEIGHT;
	var notify = $('input[name=notify]:checked' ).val() || TASKS_NOTIFY;
	var openbehavior = $('input[name=openbehavior]:checked' ).val() || TASKS_OPENBEHAVIOR;

	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.default_count',default_count);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.hide_zero',hide_zero);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.default_list',default_list);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.countinterval',countinterval);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.default_pop',default_pop);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.count_list',count_list);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.default_width',default_width);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.default_height',default_height);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.notify', notify);
	localStorage.setItem( 'com.bit51.chrome.bettergoogletasks.openbehavior',openbehavior);

	var port = chrome.extension.connect({
		name : "BGT"
	});
	port.postMessage({
		message : "Update"
	});

	$("div#saved").fadeIn("slow");
	$("div#saved").fadeOut("slow");
}

function setSelectByValue( formName, elemName, defVal ) {
	var combo = document.forms[formName].elements[elemName], rv = false;

	if (combo.type == 'select-one' ) {
		for ( var i = 0; i < combo.options.length
				&& combo.options[i].value != defVal; i++)
			;
		if (rv = (i != combo.options.length))
			combo.selectedIndex = i;
	}

	return rv;
}

function resetOptions() {
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.default_count' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.hide_zero' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.default_list' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.countinterval' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.default_pop' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.count_list' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.default_width' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.default_height' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.notify' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.notifyExp' );
	localStorage.removeItem( 'com.bit51.chrome.bettergoogletasks.openbehavior' );

	var port = chrome.extension.connect({
		name : "BGT"
	});
	port.postMessage({
		message : "Update"
	});
	window.close();
}
