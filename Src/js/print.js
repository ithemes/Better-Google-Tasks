$( document ).ready( function() {

	$( 'body').append( getPrint() );


} );

function getPrint() {

    var url = 'https://mail.google.com/tasks/ig?listid=';
    var murl = 'https://mail.google.com/tasks/m';
	
    $.ajax({
        type: 'GET',
        url: murl,
        async: false,
        data: null,
        dataType: 'html',
        success: function(html) {
            var listids = [];
            var listtitles = [];
            var startpos, titlepos, strlength, str, currid, currtitle, i;
            var today = new Date;
            yy = today.getFullYear();
            mm = today.getMonth() + 1;
            dd = today.getDate();
            var output = '<h1>Task list printed ' + mm + '/' + dd + '/' + yy + '</h1>';
            output = output + '<ul>';
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
                    for (var j = 0; j < listids.length; j++) {
                        if (listids[j] == currid) {
                            currid = -1;
                        }
                    }
                }
                else {
                    listids[i] = currid;
                    listtitles[i] = currtitle;
                }
                if (currid != -1) {
                    listids[i] = currid;
                    listtitles[i] = currtitle;
                }
                i++;
            }
			
            for (var l = 0; l < listids.length; l++) {
                output = output + '<li class="list">';
                output = output + '<h2>' + listtitles[l] + '</h2>';
                output = output + '<ul>';
                var currurl = url + listids[l];
                $.ajax({
                    type: 'GET',
                    url: currurl,
                    async: false,
                    data: null,
                    dataType: 'html',
                    success: function(html) {
					
                        if (html.match(/_setup\((.*)\)\}/)) {
	                        var data = JSON.parse( RegExp.$1 );
                            var odd = false;
                            $.each(data.t.tasks, function(i, val) {
                                if (odd) {
                                    output = output + '<li class="task">';
                                    odd = false;
                                } else {
                                    output = output + '<li class="task even">';
                                    odd = true;
                                }
                                if (val.completed) {
                                    output = output + '<s>';
                                }
                                output = output + '<h3>' + val.name + '</h3>';
                                if (val.task_date) {
                                    var month = new Array(12);
                                    month[0] = "January";
                                    month[1] = "February";
                                    month[2] = "March";
                                    month[3] = "April";
                                    month[4] = "May";
                                    month[5] = "June";
                                    month[6] = "July";
                                    month[7] = "August";
                                    month[8] = "September";
                                    month[9] = "October";
                                    month[10] = "November";
                                    month[11] = "December";
                                    var eyear = val.task_date.substr(0, 4);
                                    var emonth = val.task_date.substr(4, 2) - 1;
                                    var eday = val.task_date.substr(6, 2);
                                    output = output + '<span class="due">Due: ' + month[emonth] + ' ' + eday + ', ' + eyear + '</span>';
                                }
                                if (val.notes) {
                                    output = output + '<span class="notes">' + val.notes + '</span>';
                                }
                                if (val.completed) {
                                    output = output + '</s>';
                                }
                                output = output + '</li>';
                            });
                        }
                    }
                });
                output = output + '</ul>';
                output = output + '</li>';
            }
            output = output + '</ul>';
			
            document.write(output);
        }
    });
}
