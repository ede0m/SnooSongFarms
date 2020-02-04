var api_base_url = 'http://localhost:5000/api/'; 
var select_options = {};
var sensor_enabled = {};
var sensor_reservoir = {};

$.get(
	api_base_url + "reservoir",
	function(data) {
		select_options['reservoir'] = {};
		$.each(data, function(key, value ) {
			select_options['reservoir'][value.reservoir_id] = value.reservoir_id + " : " + value.description;
			$('#reservoir_select').append('<option value="'+ value.reservoir_id +'">'+value.reservoir_id+" : " + value.description+'</option>');
		});
	}
);

$.get(
	api_base_url + "systemsensor",
	function(data) {
		select_options['systemsensor'] = {};
		$.each(data, function(key, value) {
	  		select_options['systemsensor'][value.sensor_id] = value.sensor_id + " : " + value.description;
	  		sensor_enabled[value.sensor_id] = value.enabled;
			sensor_reservoir[value.sensor_id] = value.reservoir_id;
			// set fishtanks first
			$('#sensor_select').append('<option value="'+ value.sensor_id +'">'+value.sensor_id+" : " + value.description+'</option>');
		});

		var curr_sensor_enabled = sensor_enabled[$('#sensor_select').val()];
		if (curr_sensor_enabled) {
			$('#sensor_enable').bootstrapToggle('on', true);
		}
		else {
			$('#sensor_enable').bootstrapToggle('off', true);
		}
		// set to sensor's assigned reservoir
		$('#reservoir_select').val(sensor_reservoir[$('#sensor_select').val()]);
		GetSensorData($('#sensor_select').val(), 10);
	}
);


$( document ).ready(function() {

	$('#assign_sensor_button').on('click', function(){

			var reservoir_id = $('#reservoir_select').val();
			var sensor_id = $('#sensor_select').val();
			var data = {
				"reservoirID" : parseInt(reservoir_id)
			}

			var url = api_base_url + "systemsensor/" + sensor_id;
			$.ajax({
				url:url,
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){
					location.reload(true);
				}
			});
	});

	$('.n_readings').on('click', function(){
		var n_rec = $(this).text();
		$('#sensor_reading_table tbody').empty();
		GetSensorData($('#sensor_select').val(), n_rec);
	});

	$('#sensor_enable').change(function() {
	    
	    var enable = false;
	    if (this.checked) {
	    	console.log(this.checked);
	        enable = true;
	    }
	    var url = api_base_url + "systemsensor/" + sensor_id;
	    var sensor_id = $('#sensor_select').val();
		var data = {
			"enabled" : enable
		}

		var url = api_base_url + "systemsensor/" + sensor_id;
		$.ajax({
			url:url,
			type:"POST",
			data:JSON.stringify(data),
			contentType:"application/json; charset=utf-8",
			dataType:"json",
			success: function(res){
				location.reload(true);
			}
		});
	});

	$('#sensor_select').change(function(){
		// set current sync status
		var curr_sensor_enabled = sensor_enabled[$('#sensor_select').val()];
		console.log(curr_sensor_enabled);
		if (curr_sensor_enabled) {
			$('#sensor_enable').bootstrapToggle('on', true);
		}
		else {
			$('#sensor_enable').bootstrapToggle('off', true);
		}
		// set to sensor's assigned reservoir
		$('#reservoir_select').val(sensor_reservoir[$('#sensor_select').val()]);
		
		$('#sensor_reading_table tbody').empty();
		GetSensorData($('#sensor_select').val(), 10);
	});

});


function GetSensorData(sensor_id, n_records) {
	$.get(
		api_base_url + "telemetry/" + $('#sensor_select').val() + "/" + n_records,
		function(data) {
			$.each(data, function(key, v) {
				var sensor_id = v.sensor_id;
				var measurement = v.measurement;
				var reservoir_id = v.reservoir_id;
				var telemid = v.telemetry_id;
				var timestamp = v.timestamp;
				var val = v.value;

				var markup = "<tr><td>"+telemid+"</td><td>"+sensor_id+"</td><td>"+reservoir_id+"</td><td>"
					+timestamp+"</td><td>"+measurement+"</td><td>"+val+
					"</td><td><button type='button' class='btn btn-danger del_data'>X</button></td></tr>";

				$('#sensor_reading_table tbody:last-child').append(markup);
			});

			$(".del_data").on('click', function() {
				var $row = $(this).closest("tr");
				var t_id = $row.find("td")[0]['innerText'];
				DeleteTelemetryPoint(t_id);
			});
		}
	)
}

function DeleteTelemetryPoint(tid) {
	var url = api_base_url + "telemetry/" + tid;
	$.ajax({
		url:url,
		type:"POST",
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(res){
			location.reload(true);
		}
	});
}