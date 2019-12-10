$.get(
	"http://127.0.0.1:5000/api/reservoir",
	function(data) {
		$.each(data, function(key, value ) {
			var id = value.reservoirid;
			var desc = value.description;
			var gal = value.gallons;
			var markup = "<tr><td>" + id + "</td><td>" + desc + "</td><td>" + gal + "</td></tr>";
			
			$('#reservoirs_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	"http://127.0.0.1:5000/api/systemsensor",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.sensorid;
			var desc = value.description;
			var resid = value.reservoirid;
			var markup = "<tr><td>" + id + "</td><td>" + resid + "</td><td>" + desc + "</td></tr>";
			
			$('#sensors_table tbody:last-child').append(markup);

		});
	}
);


$( document ).ready(function() {

	$('#reservoirs_table').on('click', 'tbody tr', function() {
		var $headers = $("#reservoirs_table th");
		$cells = $(this).find("td");
		data_r = {};
		$cells.each(function(cellIndex) {
			data_r[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		var json = JSON.stringify(data_r);

		$('#reservoir_desc_input').attr('placeholder', data_r['description']);
		$('#gallons_input').attr('placeholder', data_r['gallons']);
		$('#reservoir_id_label').text(data_r['reservoirID']);
		$('#update_reservoir').css('display', 'inline');
	});

	$('#sensors_table').on('click', 'tbody tr', function() {
		var $headers = $("#sensors_table th");
		$cells = $(this).find("td");
		data_s = {};
		$cells.each(function(cellIndex) {
			data_s[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		var json = JSON.stringify(data_s);
		console.log(data_s);

		$('#sensor_desc_input').attr('placeholder', data_s['description']);
		$('#reservoir_id_input').attr('placeholder', data_s['reservoirID']);
		$('#sensor_id_label').text(data_s['sensorID']);
		$('#update_sensor').css('display', 'inline');
	});

	$('.exit').on('click', function(){
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
	});

});


