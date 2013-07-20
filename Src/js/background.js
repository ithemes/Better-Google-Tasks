chrome.browserAction.onClicked.addListener(function(tab) {
	var default_count = localStorage.getItem('com.bit51.chrome.bettertasks.default_count') || TASKS_COUNT;
	var countinterval = localStorage.getItem('com.bit51.chrome.bettertasks.countinterval') || TASKS_COUNTINTERVAL;
	var url = TASKS_URL;
});

var countText = 0;

getManifest(function(manifest) {
	localStorage.setItem("com.bit51.chrome.bettertasks.version", manifest.version);
});

localStorage.setItem('com.bit51.chrome.bettertasks.checkExp',0);

function getManifest(callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		callback(JSON.parse(xhr.responseText));
	};
	xhr.open('GET', '/manifest.json', true);
	xhr.send(null);
}

function incrCount() {
	countText++;
	return countText;
}

function getCount() {
	return countText;
}

function resetCount() {
	countText = 0;
}

function updateTask() {
	var default_count = localStorage.getItem('com.bit51.chrome.bettertasks.default_count') || TASKS_COUNT;
	if (default_count != 'none') {
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
		var countinterval = localStorage.getItem('com.bit51.chrome.bettertasks.countinterval') || TASKS_COUNTINTERVAL;
		var count_list = localStorage.getItem('com.bit51.chrome.bettertasks.count_list') || TASKS_LIST;
		var defaultlist = localStorage.getItem('com.bit51.chrome.bettertasks.default_list') || TASKS_DEFAULT_LIST;
		var murl = 'https://mail.google.com/tasks/m';
		var url = 'https://mail.google.com/tasks/ig?listid=';
		var mult = 1000 * 60;
		var updateTaskInterval = countinterval * mult;

		$.ajax({
			type: 'GET',
			url: murl,
			data: null,
			dataType: 'html',
			success: function(html, listids) {
				if (html.indexOf('<form method="GET" action="https://mail.google.com/tasks/m">') != -1) {
					resetCount();
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
					for (var j = 0; j < listids.length; j++) {
						if ((count_list == 'def' && listids[j] == defaultlist) || (count_list == 'all')) {
							$.ajax({
								type: 'GET',
								url: url + listids[j],
								data: null,
								async: false,
								dataType: 'html',
								success: function(html) {
									if (html.match(/_setup\((.*)\)\}/)) {
										var data = eval('(' + RegExp.$1 + ')');
										$.each(data.t.tasks, function(i, val) {
											if ((val.name.length > 0 || (val.notes && val.notes.length > 0) || (val.task_date && val.task_date.length > 0)) && val.completed == false && (default_count == 'all' || (default_count == 'today' && val.task_date == today_ymd) || (default_count == 'presentpast' && parseInt(val.task_date) <= parseInt(today_ymd)) || (default_count == 'future' && parseInt(val.task_date) >= parseInt(today_ymd)) || (default_count == 'past' && parseInt(val.task_date) < parseInt(today_ymd)))) {
												incrCount();
											};
										});
									};
								}
							});
						}
					};

					if (countText > 0) {
						chrome.browserAction.setBadgeBackgroundColor({
							color: [102, 0, 0, 153]
						});
						chrome.browserAction.setBadgeText({
							text: countText.toString()
						});
						chrome.browserAction.setTitle({
							title: TASKS_TITLE + countText.toString()
						});
					} else {
						var hide_zero = localStorage.getItem('com.bit51.chrome.bettertasks.hide_zero') || TASKS_ZERO;
						chrome.browserAction.setBadgeBackgroundColor({
							color: [0, 0, 255, 153]
						});
						chrome.browserAction.setTitle({
							title: 'Google Tasks'
						});
						if (hide_zero == '0') {
							chrome.browserAction.setBadgeText({
								text: '0'
							});
						} else {
							chrome.browserAction.setBadgeText({
								text: ''
							});
						}
					}
					window.setTimeout('updateTask()', updateTaskInterval);
				} else {
					chrome.browserAction.setBadgeBackgroundColor({
						color: [200, 200,200, 153]
					});
					chrome.browserAction.setBadgeText({
						text: 'X'
					});
					chrome.browserAction.setTitle({
						title: 'Better Google Tasks - Not Logged In'
					});
					window.setTimeout('updateTask()', 10000);
				}
			}
		});
	} else {
		chrome.browserAction.setBadgeText({
			text: ''
		});
		chrome.browserAction.setTitle({
			title: 'Google Tasks'
		});
	}
}

function showNotifications() {
	var notify = localStorage.getItem('com.bit51.chrome.bettertasks.notify') || TASKS_NOTIFY;
	if (notify > 0 && localStorage.getItem('com.bit51.chrome.bettertasks.checkExp') == 0) {

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
									var data = eval('(' + RegExp.$1 + ')');
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

					localStorage.setItem('com.bit51.chrome.bettertasks.checkExp',1);
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
						var notify = localStorage.getItem('com.bit51.chrome.bettertasks.notify') || TASKS_NOTIFY;
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
		});
	} else {
		chrome.browserAction.setBadgeText({
			text: ''
		});
		chrome.browserAction.setTitle({
			title: 'Google Tasks'
		});
	}
}

updateTask();

showNotifications();

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
