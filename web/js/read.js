var api_base_url = 'http://localhost:5000/api/'; 
var select_options = {};
var sensor_enabled = {};

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
			// set fishtanks first
			$('#sensor_select').append('<option value="'+ value.sensor_id +'">'+value.sensor_id+" : " + value.description+'</option>');
		});

		var curr_sensor_enabled = sensor_enabled[$('#sensor_select').val()];
		if (curr_sensor_enabled){
			$('#sensor_enable').prop('checked', true);
		}
		GetSensorData($('#sensor_select').val());
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


	$('#sensor_enable').change(function() {
	    
	    var enable = false;
	    if (this.checked) {
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
		$('#sensor_enable').prop('checked', sensor_enabled[$('#sensor_select').val()]);
		$('#sensor_reading_table tbody').empty();
		GetSensorData($('#sensor_select').val());
	});

});


function GetSensorData(sensor_id) {
	$.get(
		api_base_url + "telemetry/" + $('#sensor_select').val(),
		function(data) {
			$.each(data, function(key, v) {
				console.log(data);
				var sensor_id = v.sensor_id;
				var measurement = v.measurement;
				var reservoir_id = v.reservoir_id;
				var telemid = v.telemetry_id;
				var timestamp = v.timestamp;
				var val = v.value;

				var markup = "<tr><td>"+telemid+"</td><td>"+sensor_id+"</td><td>"+reservoir_id+"</td><td>"
					+timestamp+"</td><td>"+measurement+"</td><td>"+val+"</td></tr>";

				$('#sensor_reading_table tbody:last-child').append(markup);
			});
		}
	)
}