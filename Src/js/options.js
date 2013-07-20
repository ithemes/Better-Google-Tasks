$( document ).ready( function() {

    restoreOptions();

} );

function restoreOptions() {
	var hide_zero = localStorage
			.getItem('com.bit51.chrome.bettertasks.hide_zero')
			|| TASKS_ZERO;
	var default_count = localStorage
			.getItem('com.bit51.chrome.bettertasks.default_count')
			|| TASKS_COUNT;
	var countinterval = localStorage
			.getItem('com.bit51.chrome.bettertasks.countinterval')
			|| TASKS_COUNTINTERVAL;
	var count_list = localStorage
			.getItem('com.bit51.chrome.bettertasks.count_list')
			|| TASKS_LIST;
	var default_pop = localStorage
			.getItem('com.bit51.chrome.bettertasks.default_pop')
			|| TASKS_POPUP;
	var default_width = localStorage
			.getItem('com.bit51.chrome.bettertasks.default_width')
			|| TASKS_WIDTH;
	var default_height = localStorage
			.getItem('com.bit51.chrome.bettertasks.default_height')
			|| TASKS_HEIGHT;
	var notify = localStorage
			.getItem('com.bit51.chrome.bettertasks.notify')
			|| TASKS_NOTIFY;
	var openbehavior = localStorage
			.getItem('com.bit51.chrome.bettertasks.openbehavior')
			|| TASKS_OPENBEHAVIOR;

	$('input[name=hide_zero]').val([ hide_zero ]);
	$('input[name=default_count]').val([ default_count ]);
	$('input[name=count_list]').val([ count_list ]);
	$('input[name=default_pop]').val([ default_pop ]);
	$('input[name=countinterval]').val(countinterval);
	$('input[name=default_width]').val(default_width);
	$('input[name=default_height]').val(default_height);
	$('input[name=notify]').val([ notify ]);
	$('input[name=openbehavior]').val([ openbehavior ]);

	getLists();
	defaultcounttype();
}

function saveOptions() {
	var default_count = $('input[name=default_count]:checked').val() || TASKS_COUNT;
	var hide_zero = $('input[name=hide_zero]:checked').val() || TASKS_ZERO;
	var default_pop = $('input[name=default_pop]:checked').val() || TASKS_POPUP;
	var count_list = $('input[name=count_list]:checked').val() || TASKS_LIST;
	var countinterval = $('input[name=countinterval]').val() || TASKS_UPDATE;
	var default_list = $('select[name=default_list]').val() || TASKS_DEFAULT_LIST;
	var default_width = $('input[name=default_width]').val() || TASKS_WIDTH;
	var default_height = $('input[name=default_height]').val() || TASKS_HEIGHT;
	var notify = $('input[name=notify]:checked').val() || TASKS_NOTIFY;
	var openbehavior = $('input[name=openbehavior]:checked').val() || TASKS_OPENBEHAVIOR;

	localStorage.setItem('com.bit51.chrome.bettertasks.default_count',default_count);
	localStorage.setItem('com.bit51.chrome.bettertasks.hide_zero',hide_zero);
	localStorage.setItem('com.bit51.chrome.bettertasks.default_list',default_list);
	localStorage.setItem('com.bit51.chrome.bettertasks.countinterval',countinterval);
	localStorage.setItem('com.bit51.chrome.bettertasks.default_pop',default_pop);
	localStorage.setItem('com.bit51.chrome.bettertasks.count_list',count_list);
	localStorage.setItem('com.bit51.chrome.bettertasks.default_width',default_width);
	localStorage.setItem('com.bit51.chrome.bettertasks.default_height',default_height);
	localStorage.setItem('com.bit51.chrome.bettertasks.notify', notify);
	localStorage.setItem('com.bit51.chrome.bettertasks.openbehavior',openbehavior);

	var port = chrome.extension.connect({
		name : "BGT"
	});
	port.postMessage({
		message : "Update"
	});

	$("div#saved").fadeIn("slow");
	$("div#saved").fadeOut("slow");
}

function getLists() {
	var murl = 'https://mail.google.com/tasks/m';

	$
			.ajax({
				type : 'GET',
				url : murl,
				async : false,
				data : null,
				dataType : 'html',
				success : function(html) {
					var defaultlist = localStorage
							.getItem('com.bit51.chrome.bettertasks.default_list')
							|| TASKS_DEFAULT_LIST;
					var listids = [];
					var listtitles = [];
					var startpos, titlepos, strlength, str, currid, currtitle, i;
					str = html;
					strlength = str.length;
					startpos = str.indexOf("<option value=");
					i = 0;

					while (strlength > 0 && startpos > -1) {
						str = str.substr(startpos + 15, strlength);
						strlength = str.length;
						currid = str.substr(0, str.indexOf("\""));
						str = str.substr(str.indexOf(">") + 1, strlength);
						currtitle = str.substr(0, str.indexOf("</option>"));
						strlength = str.length;
						startpos = str.indexOf("<option value=");
						if (listids.length > 0) {
							for ( var j = 0; j < listids.length; j++) {
								if (listids[j] == currid) {
									currid = -1;
								}
							}
						} else {
							listids[i] = currid;
							listtitles[i] = currtitle;
						}
						if (currid != -1) {
							listids[i] = currid;
							listtitles[i] = currtitle;
						}
						i++;
					}

					for ( var i = 0; i < listids.length; i++) {
						var listSel = document.getElementById("lists");
						var listSelected = false;
						if (listids[i] == defaultlist) {
							listSelected = true;
						}
						listSel.add(new Option(listtitles[i], listids[i],
								listSelected), null);
					}
					setSelectByValue('opform', 'default_list', defaultlist);
				}
			});
}

function setSelectByValue(formName, elemName, defVal) {
	var combo = document.forms[formName].elements[elemName], rv = false;

	if (combo.type == 'select-one') {
		for ( var i = 0; i < combo.options.length
				&& combo.options[i].value != defVal; i++)
			;
		if (rv = (i != combo.options.length))
			combo.selectedIndex = i;
	}

	return rv;
}

function resetOptions() {
	localStorage.removeItem('com.bit51.chrome.bettertasks.default_count');
	localStorage.removeItem('com.bit51.chrome.bettertasks.hide_zero');
	localStorage.removeItem('com.bit51.chrome.bettertasks.default_list');
	localStorage.removeItem('com.bit51.chrome.bettertasks.countinterval');
	localStorage.removeItem('com.bit51.chrome.bettertasks.default_pop');
	localStorage.removeItem('com.bit51.chrome.bettertasks.count_list');
	localStorage.removeItem('com.bit51.chrome.bettertasks.default_width');
	localStorage.removeItem('com.bit51.chrome.bettertasks.default_height');
	localStorage.removeItem('com.bit51.chrome.bettertasks.notify');
	localStorage.removeItem('com.bit51.chrome.bettertasks.openbehavior');

	var port = chrome.extension.connect({
		name : "BGT"
	});
	port.postMessage({
		message : "Update"
	});
	window.close();
}
