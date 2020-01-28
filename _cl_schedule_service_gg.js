/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-03-09 10:49:03         Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-01-10 12:07:17
 *
 */
var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var delete_freq_array = [];
var freq_change = false;

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
}

var service_time_array = [];
var earliest_time_array = [];
var latest_time_array = [];

$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");
});

// $(document).on('click', '.close', function(e) {
// 	console.log('inside alert close');
// 	$(this).parent().hide();
// });
/*
$(document).on('click', '.instruction_button', function() {
    $(".ng-scope").css({
        "padding-top": "170px"
    });

});*/

$('.collapse').on('shown.bs.collapse', function() {
    $("#container").css({
        "padding-top": "200px"
    });
})

$('.collapse').on('hide.bs.collapse', function() {
    $("#container").css({
        "padding-top": "80px"
    });
})

function validateFrequency() {
    if (!($('#monday').is(':checked')) && !($('#tuesday').is(':checked')) && !($('#wednesday').is(':checked')) && !($('#thursday').is(':checked')) && !($('#friday').is(':checked')) && !($('#adhoc').is(':checked'))) {
        $('.tabs').hide();
        return false;
    } else {
        $('.tabs').show();
        return true;
    }
}


function goToByScroll(id) {
    // Remove "link" from the ID
    // id = id.replace("link", "");
    // Scroll
    $('html,body').animate({
        scrollTop: $("#" + id).offset().top
    }, 'slow');
}

function showAlert(message) {
    $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1" style="color: #e93578; ">Error!!</label></h4></div>');
    $('#myModal .modal-body').html("");
    $('#myModal .modal-body').html(message);
    $('#myModal').modal("show");
    // $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    // $('#alert').show();
    // goToByScroll('alert');
    // setInterval(function() {
    // 	$("#alert .close").click();
    // }, 5000);
}

// $(document).ready(function(message) {
// 	$(".modal_display").click(function() {
// 		var link = $(this).data("whatever");
// 		$('.modal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Error!!</label></h4></div>');
// 		$('.modal .modal-body').html("");
// 		$('.modal .modal-body').html(message);
// 		$('.modal').modal("show");


// 	});
// });

$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

function onclick_back() {
    var params = {
        serviceid: nlapiGetFieldValue('service_id'),
        scriptid: nlapiGetFieldValue('custpage_suitlet'),
        deployid: nlapiGetFieldValue('custpage_deploy')
    }
    params = JSON.stringify(params);
    console.log(nlapiGetFieldValue('custpage_suitlet'))
    console.log(nlapiGetFieldValue('custpage_deploy'))
    var upload_url = baseURL + nlapiResolveURL('SUITELET', nlapiGetFieldValue('custpage_suitlet'), nlapiGetFieldValue('custpage_deploy')) + '&unlayered=T&service_id=' + nlapiGetFieldValue('service_id') + '&custparam_params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_mainpage() {
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar_test', 'customdeploy_sl_full_calendar_test') + '&unlayered=T';
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}


function pageInit() {
    $('#alert').hide();
    // $(".tab-content").css("border", 'groove');

    validateFrequency();
}


$(".nav-tabs").on("click", "li a", function(e) {
    var main_stop = $(this).attr('href');
    var main_stop_det = $(this);
    var freq_array = $(this).attr('data-freq');
    console.log('main stop', main_stop);
    console.log('freq_array', freq_array);
    var error = false;
    var old_stored_run;
    var stored_run;
    //$(this).css('background-color', '#8080809c');

    var exit = true;
    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            console.log('stop_id: ' + stop_id);
            $(this).children('a').css({
                "background-color": "white",
                "color": "#337ab7"
            });
            //console.log('Current Clicked tab' + main_stop_det.attr('class'));
            //console.log('tab seq ' + $(this).attr('class'));
            console.log($(this).attr('class'));
            if ($(this).attr('class') == 'active') {
                //$(this).children('a').css('background-color', '#8080809c');
                console.log('inside active tab');
                stop_id = stop_id.split('#');
                if (!isNullorEmpty(stop_id[1])) {
                    var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                    var rows;
                    if (!isNullorEmpty($(table_id))) {
                        rows = $(table_id);
                        console.log('rows.length', rows.length);
                    }

                    if (rows.length == 1) {
                        var run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                        old_stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                        var run_freq_id = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-freqid');
                        var service_time = $('#' + stop_id[1]).find('#service_time' + stop_id[1]).val();
                        var earliest_time = ($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                        var latest_time = ($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                        var message = '';

                        console.log('run ' + run);
                        console.log('service_time', service_time);

                        if (isNullorEmpty(run) || run == 0) {
                            message += 'Please Select the Run</br>';
                            error = true;
                        } else {
                            stored_run = run;
                        }

                        if (isNullorEmpty(service_time)) {
                            message += 'Please Select the Service Time</br>';
                            error = true;
                        }

                        if (isNullorEmpty(earliest_time)) {
                            message += 'Please Select the Earliest Time</br>';
                            error = true;
                        }

                        if (isNullorEmpty(latest_time)) {
                            message += 'Please Select the Latest Time</br>';
                            error = true;
                        }

                        if (error == true) {
                            // $(this).children('a').css('background-color', '#337ab7')
                            showAlert(message);
                            exit = false;
                        } else {

                            console.log('inside 1');
                            console.log(main_stop_det);
                            main_stop_det.tab('show');
                            var main_stop_id = main_stop.split('#');
                            console.log('old_stored_run', old_stored_run);
                            if (isNullorEmpty(old_stored_run)) {
                                $('#' + main_stop_id[1]).find('#run' + main_stop_id[1]).val(stored_run);
                            }
                            exit = false;


                        }

                    } else {
                        console.log('inside different day');
                        if ($('.different_each_day').is(':checked')) {
                            $(table_id).each(function(i, row) {
                                if (i > 0) {
                                    var $row = $(row);

                                    var freq_id = $row.find('.run').attr('data-freqid');
                                    var run = $row.find('.run').val();
                                    var service_time = ($row.find('#table_service_time').val());
                                    var earliest_time = ($row.find('#table_earliest_time').val());
                                    var latest_time = ($row.find('#table_latest_time').val());
                                    console.log(run);
                                    var error = false;
                                    var message = '';

                                    if (isNullorEmpty(run)) {
                                        message += 'Please Select the Run</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(service_time)) {
                                        message += 'Please Select the Service Time</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(earliest_time)) {
                                        message += 'Please Select the Earliest Time</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(latest_time)) {
                                        message += 'Please Select the Latest Time</br>';
                                        error = true;
                                    }

                                    if (error == true) {
                                        $(this).children('a').css('background-color', '#337ab7')
                                        showAlert(message);
                                        exit = false;
                                    } else {

                                        console.log('inside 2');
                                        $(this).children('a').tab('show');
                                        // $(this).children('a').css('background-color', '#8080809c')

                                    }

                                }
                            })
                        }
                    }
                }
            } else if (main_stop == stop_id && error != true) {
                console.log('inside 3');
                //$(this).children('a').css('background-color', '#8080809c');
                $(this).children('a').tab('show');
                //$(this).children('a').css('background-color', '#8080809c');

                stop_id = stop_id.split('#');
                old_stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                console.log('stored_run', stored_run);
                console.log('old_stored_run', old_stored_run);

                if (isNullorEmpty(old_stored_run)) {
                    $('#' + stop_id[1]).find('#run' + stop_id[1]).val(stored_run);
                }
                // $(this).children('a').css('background-color', '#337ab7');

            }
            console.log('exit 1' + exit);
            if (exit == false) {
                return false;
            }
        });
        console.log('exit 2' + exit);
        if (exit == false) {
            return false;
        }
    });
    $(this).css({
        "background-color": "rgb(50, 122, 183)",
        "color": "white"
    });

});


// $(document).on("click", ".close", function() {

// 	var divid = $(this).attr('data-stopid');
// 	$(this).parents('li').remove();
// 	$('#' + divid).remove();
// 	$(".nav-pills li").children('a').first().click();
// });

//Onclick of the Add Stop button and add new tab
// $(document).on("click", ".add_stop", function() {
// 	$(".add_stop_link").trigger("click");
// });

//To add new tab with all the details.
// $('.add_stop_link').click(function(e) {
// 	e.preventDefault();
// 	var id = $(".nav-pills").children().length; //think about it ;)
// 	$(this).closest('li').before('<li class="stop' + id + ' "><a href="#new_stop_' + id + '" class="stop' + id + '" data-toggle="tab">Stop ' + id + ' <button type="button" class="close" aria-label="Close" data-stopid="stop' + id + '"><span aria-hidden="" style="color: red;position: absolute;">×</span></button></a></li>');

// 	var inlineQty = '<div role="tabpanel" class="tab-pane " id="new_stop_' + id + '">';
// 	inlineQty += '<div class="form-group container stop_name_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 stop_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">STOP NAME</span><input id="stop_name" class="form-control stop_name" /></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container stop_type_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 stop_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">STOP TYPE</span><select id="stop_type" class="form-control stop_type" ><option value="0"></option><option value="3">Transfer In</option><option value="4">Transfer Out</option></select></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container duration_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 duration_section"><div class="input-group"><span class="input-group-addon" id="descp_text">DURATION</span><input id="duration" class="form-control duration" /></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container notes_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 notes_section"><div class="input-group"><span class="input-group-addon" id="descp_text">NOTES</span><textarea id="notes" class="form-control notes"  rows="4" cols="50" ></textarea></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';


// 	inlineQty += '<div class="form-group container difference_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 difference_section"><div class="input-group"><input type="text" readonly value="DIFFERENT FOR EACH DAY?" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="different_each_day" class=" different_each_day" data-stopid="' + id + '" /></span></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container run_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 run_section"><div class="input-group"><span class="input-group-addon" id="run_text">SELECT RUN</span><input id="run" class="form-control run" type="textbox" /></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container time_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-6 service_time_section"><div class="input-group"><span class="input-group-addon" id="service_time_text">SERVICE TIME</span><input id="service_time" class="form-control service_time" type="time" /></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<div class="form-group container time_window_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-3 earliest_time_section"><div class="input-group"><span class="input-group-addon" id="earliest_time_text">EARLIEST TIME</span><input id="earliest_time" class="form-control earliest_time" type="time" /></div></div>';
// 	inlineQty += '<div class="col-xs-3 latest_time_section"><div class="input-group"><span class="input-group-addon" id="latest_time_text">LATEST TIME</span><input id="latest_time" class="form-control latest_time" type="time" /></div></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';

// 	inlineQty += '<table border="0" cellpadding="15" id="services' + id + '" class="table table-responsive table-striped services tablesorter hide" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

// 	/**
// 	 * DAYS OF WEEK ROW
// 	 */
// 	inlineQty += '<th style="vertical-align: middle;text-align: center;"><b></b></th>';

// 	/**
// 	 * SELECT RUN ROW
// 	 */
// 	inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>SELECT RUN</b></th>';
// 	/**
// 	 * SERVICE TIME ROW
// 	 */
// 	inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE TIME<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
// 	/**
// 	 * TIME WINDOW ROW
// 	 */

// 	inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>EARLIEST TIME <span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

// 	inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>LATEST TIME <span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

// 	inlineQty += '</tr></thead><tbody>';

// 	inlineQty += '</tbody></table>';

// 	inlineQty += '<div class="form-group container add_stop_row ">';
// 	inlineQty += '<div class="row">';
// 	inlineQty += '<div class="col-xs-3 add_stop_section"><button id="add_stop" class="form-control btn btn-primary add_stop" > ADD STOP</button></div>';
// 	inlineQty += '</div>';
// 	inlineQty += '</div>';


// 	inlineQty += '</div>';

// 	$('.tab-content').append(inlineQty);
// 	$('.' + id).trigger("click");
// 	// $('.add_stop_li').removeClass('active');
// 	// $(".nav-pills li").children('a').first().click();
// });

function validateTimes() {
    if (service_time_array.length > 1) {
        for (var x = 0; x < service_time_array.length; x++) {
            if (service_time_array[x + 1] < service_time_array[x]) {
                showAlert('Please Enter the correct Service Time. Service Time entered for stop ' + (x + 2) + ' is before stop ' + (x + 1));
                return false;
                break;
            }

            if (!isNullorEmpty(earliest_time_array[x])) {
                if (earliest_time_array[x] > service_time_array[x]) {
                    showAlert('Earliest Time is after the Service Time. Please Check.');
                    return false;
                    break;
                }
            }

            if (!isNullorEmpty(latest_time_array[x])) {
                if (latest_time_array[x] < service_time_array[x]) {
                    showAlert('Latest Time is before the Service Time. Please Check');
                    return false;
                    break;
                }
            }
        }
    }
    // if (earliest_time_array.length > 1) {
    // 	for (var x = 0; x < earliest_time_array.length; x++) {
    // 		console.log(earliest_time_array[x]);
    // 		if(earliest_time_array[x+1] < earliest_time_array[x]){
    // 			showAlert('Please Enter the correct Service Time. Service Time entered for stop ' + (x+1) + ' is before stop ' + x);
    // 			break;
    // 		}
    // 	}
    // }
    // if (latest_time_array.length > 1) {
    // 	for (var x = 0; x < latest_time_array.length; x++) {
    // 		console.log(latest_time_array[x]);
    // 		if(latest_time_array[x+1] < latest_time_array[x]){
    // 			showAlert('Please Enter the correct Service Time. Service Time entered for stop ' + (x+1) + ' is before stop ' + x);
    // 			break;
    // 		}
    // 	}
    // }
}

function uncheckDailyAdhocFreq() {
    $('#daily').prop('checked', false);
    $('#adhoc').prop('checked', false);
}

$(".service_time").focusout(function() {
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        var stop_array = stop_no.split('_');
        var stop_id = $(this).attr('data-stopid');
        if (stop_array[1] == 0) {
            service_time_array[stop_array[0] - 1] = $(this).val();
        } else {
            service_time_array[stop_array[1] - 1] = $(this).val();
        }

        var service_time = $(this).val();
        var hours_string = (service_time.substr(0, 2));
        var hours = parseInt(service_time.substr(0, 2));

        var earliest_time;
        var latest_time;

        if (hours < 9 && hours != 0) {
            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
            latest_time = service_time.replace(hours_string, '0' + (hours + 1));
        } else if (hours == 9) {
            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
            latest_time = service_time.replace(hours_string, (hours + 1));
        } else if (hours == 10) {
            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
            latest_time = service_time.replace(hours_string, (hours + 1));
        } else if (hours > 10) {
            earliest_time = service_time.replace(hours_string, (hours - 1));
            latest_time = service_time.replace(hours_string, (hours + 1));
        }



        console.log($(this).val());
        console.log(earliest_time);
        console.log(latest_time);

        $('#earliest_time' + stop_id).val(earliest_time);
        $('#latest_time' + stop_id).val(latest_time);

        // var error = validateTimes();
        // if (error == false) {
        // 	$(this).val("");
        // }
    }

});

$(".earliest_time").focusout(function() {
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        var stop_array = stop_no.split('_');
        if (stop_array[1] == 0) {
            earliest_time_array[stop_array[0] - 1] = $(this).val();
        } else {
            earliest_time_array[stop_array[1] - 1] = $(this).val();
        }
        console.log(earliest_time_array);
        var error = validateTimes();
        if (error == false) {
            $(this).val("");
        }
    }

});

$(".latest_time").focusout(function() {
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        var stop_array = stop_no.split('_');
        if (stop_array[1] == 0) {
            latest_time_array[stop_array[0] - 1] = $(this).val();
        } else {
            latest_time_array[stop_array[1] - 1] = $(this).val();
        }
        var error = validateTimes();
        if (error == false) {
            $(this).val("");
        }
    }

});

$(document).on('click', '.monday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        console.log('checked')
        checkIfMultiFreq('mon', 'T');
    } else {
        checkIfMultiFreq('mon', 'F');
    }
    freq_change = true;
    validateFrequency();
});

$(document).on('click', '.tuesday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('tue', 'T');
    } else {
        checkIfMultiFreq('tue', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.wednesday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('wed', 'T');
    } else {
        checkIfMultiFreq('wed', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.thursday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('thu', 'T');
    } else {
        checkIfMultiFreq('thu', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.friday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('fri', 'T');
    } else {
        checkIfMultiFreq('fri', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.service_time_window_button', function() {
    var previous_time_window = $(this).attr('data-timewindow');
    var stop_id = $(this).attr('data-stopid');

    var split_time_window = previous_time_window.split(' - ');

    console.log(split_time_window);

    var earliest_time = convertTo24Hour(split_time_window[0]);
    var latest_time = convertTo24Hour(split_time_window[1]);

    console.log(earliest_time);
    console.log(latest_time);

    $('#earliest_time' + stop_id).val(earliest_time);
    $('#latest_time' + stop_id).val(latest_time);

});

$(document).on('click', '.service_time_button', function() {
    var previous_time = $(this).attr('data-time');
    var stop_id = $(this).attr('data-stopid');

    console.log(previous_time);
    $('#service_time' + stop_id).val(previous_time);

});

//If Different For Each Day is checked
$(document).on('click', '.different_each_day', function() {
    zee = nlapiGetFieldValue('zee');
    if ($(this).is(':checked')) {
        var id = $(this).attr('data-stopid');
        var stop_no = $(this).attr('data-stopno');
        var table_id = '#services' + id;
        var loaded_multifreq = $(this).attr('data-multifreq');
        var freq_id = $(this).attr('data-freqid');
        if (!isNullorEmpty(freq_id)) {
            delete_freq_array[delete_freq_array.length] = freq_id;
        }
        $('#run' + id).addClass('hide');
        $('#service_time' + id).addClass('hide');
        $('#earliest_time' + id).addClass('hide');
        $('#latest_time' + id).addClass('hide');
        $('.run_row' + id).addClass('hide');
        $('.time_row' + id).addClass('hide');
        $('.previous_time_row' + id).addClass('hide');
        $('.time_window_row' + id).addClass('hide');
        $('.previous_time_window_row' + id).addClass('hide');
        if (loaded_multifreq == 'T') {
            $(table_id).removeClass('hide');
            var table_id_rows = '#services' + id + ' > tbody > tr';
            var rows;
            if (!isNullorEmpty($(table_id_rows))) {
                rows = $(table_id_rows);
            }
            console.log(rows);
            if (rows.length == 1) {

            } else {
                $(table_id).each(function(i, row) {
                    if (i >= 1) {
                        var $row = $(row);
                        var freq_id = $row.find('.run').attr('data-freqid');

                        var index = delete_freq_array.indexOf(freq_id);
                        if (index > -1) {
                            delete_freq_array.splice(index, 1);
                        }
                    }
                })
            }
        } else {
            var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

            var newFilters_runPlan = new Array();
            newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', zee);

            runPlanSearch.addFilters(newFilters_runPlan);

            var resultSet_runPlan = runPlanSearch.runSearch();


            var create_run_html = '';
            $(table_id).find("tr:not(:nth-child(1))").remove();

            var run_selection_html = '';
            resultSet_runPlan.forEachResult(function(searchResult_runPlan) {

                run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                return true;
            });

            var row_count = 1;

            if ($('#monday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">MONDAY</td><td><select id="table_run_mon" data-day="mon" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' +
                    stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" class="form-control earliest_time" data-stopno="' + stop_no + '_' + row_count + '" type="time" /></td><td><input id="table_latest_time" class="form-control latest_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#tuesday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">TUESDAY</td><td><select id="table_run_tue" data-day="tue" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-oldtime="" data-stopno="' + stop_no + '_' + row_count + '" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '" class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#wednesday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">WEDNESDAY</td><td><select id="table_run_wed" data-day="wed" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '" class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#thursday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">THURSDAY</td><td><select id="table_run_thu" data-day="thu" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '"class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '"class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#friday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">FRIDAY</td><td><select id="table_run_fri" data-day="fri" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime=""  data-stopno="' + stop_no + '_' + row_count + '"class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;

            }
            $(table_id + ' tr:last').after(create_run_html);
            $(table_id).removeClass('hide');
        }


    } else {
        var id = $(this).attr('data-stopid');
        var table_id = '#services' + id;
        var freq_id = $(this).attr('data-freqid');
        var loaded_multifreq = $(this).attr('data-multifreq');
        if (!isNullorEmpty(freq_id)) {
            var index = delete_freq_array.indexOf(freq_id);
            if (index > -1) {
                delete_freq_array.splice(index, 1);
            }
        }
        if (loaded_multifreq == 'T') {
            var table_id_rows = '#services' + id + ' > tbody > tr';
            var rows;
            if (!isNullorEmpty($(table_id_rows))) {
                rows = $(table_id_rows);
            }
            console.log(rows);
            if (rows.length == 1) {

            } else {
                $(table_id).each(function(i, row) {
                    if (i >= 1) {
                        var $row = $(row);
                        var freq_id = $row.find('.run').attr('data-freqid');

                        delete_freq_array[delete_freq_array.length] = freq_id;
                    }
                })
            }
        }
        $(table_id).addClass('hide');
        $('#run' + id).removeClass('hide');
        $('#service_time' + id).removeClass('hide');
        $('#earliest_time' + id).removeClass('hide');
        $('#latest_time' + id).removeClass('hide');
        $('.run_row' + id).removeClass('hide');
        $('.time_row' + id).removeClass('hide');
        $('.previous_time_row' + id).removeClass('hide');
        $('.time_window_row' + id).removeClass('hide');
        $('.previous_time_window_row' + id).removeClass('hide');
    }
});

//If Daily is checked
$(document).on('click', '#daily', function() {
    if ($(this).is(':checked')) {
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('disabled', true);
        $('#adhoc').prop('disabled', true);
        $('#monday').prop('checked', true);
        $('#tuesday').prop('checked', true);
        $('#wednesday').prop('checked', true);
        $('#thursday').prop('checked', true);
        $('#friday').prop('checked', true);
    } else {
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('disabled', false);
        $('#adhoc').prop('disabled', false);
        $('#monday').prop('checked', false);
        $('#tuesday').prop('checked', false);
        $('#wednesday').prop('checked', false);
        $('#thursday').prop('checked', false);
        $('#friday').prop('checked', false);
    }
    validateFrequency();
    freq_change = true;
});

//If Adhoc is checked
$(document).on('click', '#adhoc', function() {
    if ($(this).is(':checked')) {
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('disabled', true);
        $('#daily').prop('disabled', true);
        $('#monday').prop('checked', false);
        $('#tuesday').prop('checked', false);
        $('#wednesday').prop('checked', false);
        $('#thursday').prop('checked', false);
        $('#friday').prop('checked', false);
        $('#daily').prop('checked', false);
    } else {
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('disabled', false);
        $('#daily').prop('disabled', false);

    }
    validateFrequency();
    freq_change = true;
});

function checkIfMultiFreq(value, unchecked) {
    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            stop_id = stop_id.split('#');
            if (!isNullorEmpty(stop_id[1])) {

                // To check if a new stop has been created. -1 = NO / 0 = YES
                var new_stop = stop_id[1].indexOf('new_stop_');

                var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                var rows;
                if (!isNullorEmpty($(table_id))) {
                    rows = $(table_id);
                }
                console.log(rows);
                if (rows.length == 1) {

                } else {
                    $(table_id).each(function(i, row) {
                        if (i >= 1) {
                            var $row = $(row);
                            var freq_id = $row.find('.run').attr('data-freqid');

                            if (unchecked == 'T') {
                                if ($row.find('#table_run').attr('data-day') == value) {
                                    $row.hide();
                                    delete_freq_array[delete_freq_array.length] = freq_id;
                                }
                            } else {
                                if ($row.find('#table_run').attr('data-day') == value) {
                                    $row.show();
                                    var index = delete_freq_array.indexOf(freq_id);
                                    if (index > -1) {
                                        delete_freq_array.splice(index, 1);
                                    }
                                }
                            }

                        }
                    })
                }

            }
        });
    });
}


function saveRecord() {


    var customer_id = nlapiGetFieldValue('customer_id');
    var service_id = nlapiGetFieldValue('service_id');
    var stops_ids = nlapiGetFieldValue('stop_ids');

    zee = parseInt(nlapiGetFieldValue('zee'));

    var exit = true;
    var error = false;
    var message = '';

    var freq_time_current_array = [];

    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            var freq_main_id = $(this).children('a').attr('data-freq');
            console.log('Stop ID: ' + stop_id)
            console.log('freq_main_id: ' + freq_main_id)
            stop_id = stop_id.split('#');

            freq_time_current_array[freq_time_current_array.length] = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());
            console.log('freq_time_current_array', freq_time_current_array);
            if (!isNullorEmpty(stop_id[1])) {

                var new_stop_id = stop_id[1].split('_');
                console.log('new_stop_id', new_stop_id);

                // To check if a new stop has been created. -1 = NO / 0 = YES
                var new_stop = stop_id[1].indexOf('new_stop_');

                var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                var rows;
                if (!isNullorEmpty($(table_id))) {
                    rows = $(table_id);
                }
                console.log('Rows: ' + rows);
                console.log('Rows Length :' + rows.length);
                if (rows.length == 1 || rows.length == 0) {
                    var run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                    var old_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                    if (isNullorEmpty(freq_main_id)) {
                        var run_freq_id = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-freqid');
                    } else {
                        var run_freq_id = freq_main_id;
                    }

                    console.log('service_time: ' + $('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());
                    var service_time = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());

                    var earliest_time = ($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                    var latest_time = ($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                    //var message = '';

                    if (isNullorEmpty(run) || run == 0) {
                        message += 'Please Select the Run</br>';
                        error = true;
                    }

                    if (isNullorEmpty(service_time)) {
                        message += 'Please Select the Service Time</br>';
                        error = true;
                    }

                    if (isNullorEmpty(earliest_time)) {
                        message += 'Please Select the Earliest Time</br>';
                        error = true;
                    }

                    if (isNullorEmpty(latest_time)) {
                        message += 'Please Select the Latest Time</br>';
                        error = true;
                    }

                    /*                    if (error == true) {
                                            // $(this).children('a').css('background-color', '#337ab7')
                                            showAlert(message);
                                            exit = false;*/
                    //} 
                    else {
                        console.log('old_service_time: ' + $('#' + stop_id[1]).find('#service_time' + stop_id[1]).attr('data-oldtime'));
                        var old_service_time = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).attr('data-oldtime'));

                        console.log('earliest_time: ' + $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                        var earliest_time = onTimeChange($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());

                        console.log('old_earliest_time: ' + $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).attr('data-oldearliesttime'));
                        var old_earliest_time = onTimeChange($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).attr('data-oldearliesttime'));

                        console.log('latest_time: ' + $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());
                        var latest_time = onTimeChange($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                        console.log('latest_time: ' + $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).attr('data-oldlatesttime'));
                        var old_latest_time = onTimeChange($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).attr('data-oldlatesttime'));

                        if (freq_change == true || (run != old_run) || (service_time != old_service_time) || (earliest_time != old_earliest_time) || (latest_time != old_latest_time)) {
                            if (isNullorEmpty(run_freq_id)) {
                                var freq_record = nlapiCreateRecord('customrecord_service_freq');
                            } else {
                                var freq_record = nlapiLoadRecord('customrecord_service_freq', run_freq_id);
                            }

                            // freq_record.setFieldValue('custrecord_service_freq_franchisee', zee);
                            freq_record.setFieldValue('custrecord_service_freq_customer', nlapiGetFieldValue('customer_id'));
                            freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
                            freq_record.setFieldValue('custrecord_service_freq_service', nlapiGetFieldValue('service_id'));
                            freq_record.setFieldValue('custrecord_service_freq_stop', new_stop_id[0]);
                            freq_record.setFieldValue('custrecord_service_freq_time_start', earliest_time);
                            freq_record.setFieldValue('custrecord_service_freq_time_end', latest_time);
                            freq_record.setFieldValue('custrecord_service_freq_time_current', service_time);

                            if ($('#monday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_mon', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_mon', 'F');
                            }
                            if ($('#tuesday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_tue', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_tue', 'F');
                            }
                            if ($('#wednesday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_wed', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_wed', 'F');
                            }
                            if ($('#thursday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_thu', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_thu', 'F');
                            }
                            if ($('#friday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_fri', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_fri', 'F');
                            }

                            nlapiSubmitRecord(freq_record);
                        }


                    }


                    // 
                } else {
                    $(table_id).each(function(i, row) {
                        if (i >= 1) {
                            var $row = $(row);
                            var freq_id = $row.find('.run').attr('data-freqid');

                            var run = $row.find('.run').val();
                            var old_run = $row.find('.run').attr('data-oldrun');
                            var service_time = onTimeChange($row.find('#table_service_time').val());
                            var old_service_time = onTimeChange($row.find('#table_service_time').attr('data-oldtime'));
                            var earliest_time = onTimeChange($row.find('#table_earliest_time').val());
                            var old_earliest_time = onTimeChange($row.find('#table_earliest_time').attr('data-oldearliesttime'));
                            var latest_time = onTimeChange($row.find('#table_latest_time').val());
                            var old_latest_time = onTimeChange($row.find('#table_latest_time').attr('data-oldlatesttime'));

                            if (isNullorEmpty(run)) {
                                message += 'Please Select the Run</br>';
                                error = true;
                            } else {
                                stored_run = run;
                            }

                            if (isNullorEmpty(service_time)) {
                                message += 'Please Select the Service Time</br>';
                                error = true;
                            }

                            if (isNullorEmpty(earliest_time)) {
                                message += 'Please Select the Earliest Time</br>';
                                error = true;
                            }

                            if (isNullorEmpty(latest_time)) {
                                message += 'Please Select the Latest Time</br>';
                                error = true;
                            }


                            /*                            if (error == true) {
                                                            // $(this).children('a').css('background-color', '#337ab7')
                                                            showAlert(message);
                                                            exit = false;*/
                            //} 
                            else {
                                if (freq_change == true || (run != old_run) || (service_time != old_service_time) || (earliest_time != old_earliest_time) || (latest_time != old_latest_time)) {
                                    if (isNullorEmpty(freq_id)) {
                                        var freq_record = nlapiCreateRecord('customrecord_service_freq');
                                    } else {
                                        var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
                                    }
                                    // freq_record.setFieldValue('custrecord_service_freq_franchisee', zee);
                                    freq_record.setFieldValue('custrecord_service_freq_customer', nlapiGetFieldValue('customer_id'));
                                    freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
                                    freq_record.setFieldValue('custrecord_service_freq_service', nlapiGetFieldValue('service_id'));
                                    freq_record.setFieldValue('custrecord_service_freq_stop', new_stop_id[0]);

                                    freq_record.setFieldValue('custrecord_service_freq_time_start', earliest_time);
                                    freq_record.setFieldValue('custrecord_service_freq_time_end', latest_time);
                                    freq_record.setFieldValue('custrecord_service_freq_time_current', service_time);
                                    if ($row.find('.run').attr('data-day') == 'mon') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_mon', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'tue') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_tue', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'wed') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_wed', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'thu') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_thu', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'fri') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_fri', 'T');
                                    }

                                    nlapiSubmitRecord(freq_record);

                                }
                            }
                        }
                    })
                }

            }
        });
    });

    if (!isNullorEmpty(delete_freq_array)) {
        var delete_freq_string = delete_freq_array.join();
        nlapiSetFieldValue('delete_freq', delete_freq_string)
    }

    for (var i = 0; i < freq_time_current_array.length; i++) {
        if (freq_time_current_array[i + 1] < freq_time_current_array[i]) {
            error = true;
            message += 'The service time of Stop ' + (i + 2) + ' should exceed the service time of Stop ' + (i + 1);
        }
    }

    if (error == true) {
        // $(this).children('a').css('background-color', '#337ab7')
        showAlert(message);
        exit = false;

    }

    if (exit == true) {
        return true;
    }
}


//Build the JSON string to get all the values from the tab
function buildRequestStringData(form, stop_id) {
    var select = form.find('select'),
        input = form.find('input'),
        textarea = form.find('textarea'),
        requestString = '{"stop_id":"' + stop_id + '",';
    var table_id = '#services' + stop_id + ' > tbody > tr';
    console.log(table_id)
    var rows;
    if (!isNullorEmpty($(table_id))) {
        rows = $(table_id);
    }
    console.log(rows);
    if (rows.length == 1) {

    } else {
        $(table_id).each(function(i, row) {
            if (i >= 1) {
                var $row = $(row);
                console.log($row.find('#table_run').val());
            }
        })
    }

    var different_checkbox = false;
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    for (var i = 0; i < select.length; i++) {
        requestString += '"' + $(select[i]).attr('id') + '": "' + $(select[i]).val() + '",';
    }
    for (var i = 0; i < textarea.length; i++) {
        requestString += '"' + $(textarea[i]).attr('id') + '": "' + $(textarea[i]).val() + '",';
    }
    if (textarea.length > 1) {
        requestString = requestString.substring(0, requestString.length - 1);
    }
    for (var i = 0; i < input.length; i++) {
        if (!isNullorEmpty($(input[i]).attr('id'))) {
            if ($(input[i]).attr('type') !== 'checkbox') {

                requestString += '"' + $(input[i]).attr('id') + '":"' + $(input[i]).val() + '",';
            } else {
                if ($(input[i]).is(':checked')) {
                    requestString += '"' + $(input[i]).attr('id') + '":"true",';
                    different_checkbox = true;
                } else {
                    requestString += '"' + $(input[i]).attr('id') + '":"false",';
                }

            }
        }
    }
    if (input.length > 1) {
        requestString = requestString.substring(0, requestString.length - 1);
    }
    requestString += '}';
    return requestString;
}

function onTimeChange(value) {
    console.log('value: ' + value)
    if (!isNullorEmpty(value)) {
        var timeSplit = value.split(':'),
            hours,
            minutes,
            meridian;
        hours = timeSplit[0];
        minutes = timeSplit[1];
        if (hours > 12) {
            meridian = 'PM';
            hours -= 12;
        } else if (hours < 12) {
            meridian = 'AM';
            if (hours == 0) {
                hours = 12;
            }
        } else {
            meridian = 'PM';
        }
        return (hours + ':' + minutes + ' ' + meridian);
    }
}

function convertTo24Hour(time) {
    var hours_string = (time.substr(0, 2));
    var hours = parseInt(time.substr(0, 2));
    if (time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    // if (time.indexOf('AM') != -1 && hours < 10) {
    // 	time = time.replace(hours, ('0' + hours));
    // }
    if (time.indexOf('PM') != -1 && hours < 12) {
        console.log(hours + 12)
        time = time.replace(hours_string, (hours + 12));
    }
    return time.replace(/( AM| PM)/, '');
}