$.get(
	"http://127.0.0.1:5000/api/reservoir",
	function(data) {
		$.each(data, function(key, value ) {
			var id = value.reservoir_id;
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
		  
			var id = value.sensor_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var markup = "<tr><td>" + resid + "</td><td>" + id + "</td><td>" + desc + "</td></tr>";
			
			$('#sensors_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	"http://127.0.0.1:5000/api/fishtank",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.tank_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var gallons = value.gallons;
			var markup = "<tr><td>"+resid+"</td><td>"+id+"</td><td>"+desc+"</td><td>"+gallons+"</td></tr>";
			
			$('#tanks_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	"http://127.0.0.1:5000/api/growbed",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.growbed_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var gallons = value.gallons;
			var markup = "<tr><td>"+resid+"</td><td>"+id+"</td><td>"+desc+"</td><td>"+gallons+"</td></tr>";
			
			$('#growbeds_table tbody:last-child').append(markup);

		});
	}
);


$( document ).ready(function() {

	var createNew = false;

	$('.table').on('click', 'tbody tr', function(){
		createNew = false;
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');
	});

	$('#reservoirs_table').on('click', 'tbody tr', function() {
		
		var $headers = $("#reservoirs_table th");
		$cells = $(this).find("td");
		data_r = {};
		$cells.each(function(cellIndex) {
			data_r[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#reservoir_desc_input').val(data_r['description']);
		$('#reservoir_gallons_input').val(data_r['gallons']);
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

		$('#sensor_desc_input').val(data_s['description']);
		$('#sensor_reservoir_id_input').val(data_s['reservoirID']);
		$('#sensor_id_label').text(data_s['sensorID']);
		$('#sensor_id_input').val(data_s['sensorID']);
		$('#sensor_id_input').prop('disabled', true);
		$('#update_sensor').css('display', 'inline');
	});

	$('#tanks_table').on('click', 'tbody tr', function() {
		
		var $headers = $("#tanks_table th");
		$cells = $(this).find("td");
		data_t = {};
		$cells.each(function(cellIndex) {
			data_t[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		console.log(data_t);

		$('#tank_desc_input').val(data_t['description']);
		$('#tank_reservoir_id_input').val(data_t['reservoirID']);
		$('#tank_gallons_input').val(data_t['gallons']);
		$('#tank_id_label').text(data_t['reservoirID']);
		$('#update_tank').css('display', 'inline');
	});

	$('#growbeds_table').on('click', 'tbody tr', function() {
		
		var $headers = $("#growbeds_table th");
		$cells = $(this).find("td");
		data_gb = {};
		$cells.each(function(cellIndex) {
			data_gb[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#growbed_desc_input').val(data_gb['description']);
		$('#growbed_reservoir_id_input').val(data_gb['reservoirID']);
		$('#growbed_gallons_input').val(data_gb['gallons']);
		$('#growbed_id_label').text(data_gb['reservoirID']);
		$('#update_growbed').css('display', 'inline');
	});

	$('.add_button').on('click', function(){
		
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');

		$('#reservoir_desc_input').val("");
		$('#reservoir_gallons_input').val("");
		$('#reservoir_id_label').text("NOT ASSIGNED YET");
		$('#sensor_desc_input').val("");
		$('#sensor_reservoir_id_input').val("");
		$('#sensor_id_label').text("NOT YET ASSIGNED");
		$('#sensor_id_input').val("");
		$('#tank_desc_input').val("");
		$('#tank_reservoir_id_input').val("");
		$('#tank_gallons_input').val("");
		$('#tank_id_label').text("NOT YET ASSIGNED");
		$('#growbed_desc_input').val("");
		$('#growbed_reservoir_id_input').val("");
		$('#growbed_gallons_input').val("");
		$('#growbed_id_label').text("NOT YET ASSIGNED");

		createNew = true;

		if (this.id === 'add_reservoir_button')
		{
			$('#reservoir_desc_input').attr('placeholder', "description");
			$('#reservoir_gallons_input').attr('placeholder', '# gallons in this water system');
			$('#update_reservoir').css('display', 'inline');
		}
		else if (this.id === 'add_sensor_button')
		{
			$('#sensor_desc_input').attr('placeholder', "description");
			$('#sensor_reservoir_id_input').attr('placeholder', "what reservoir is this sensor currently placed in?");
			$('#sensor_id_input').attr('placeholder', "unique id for this sensor module");
			$('#sensor_id_input').prop('disabled', false);
			$('#update_sensor').css('display', 'inline');
		}
		else if (this.id === 'add_tank_button')
		{

			$('#tank_desc_input').attr('placeholder', "description");
			$('#tank_reservoir_id_input').attr('placeholder', "what reservoir is this tank currently a part of?");
			$('#tank_gallons_input').attr('placeholder', '# gallons in this tank');
			$('#update_tank').css('display', 'inline');
		}
		else if (this.id === 'add_growbed_button')
		{

			$('#growbed_desc_input').attr('placeholder', "description");
			$('#growbed_reservoir_id_input').attr('placeholder', "what reservoir is this growbed currently a part of?");
			$('#growbed_gallons_input').attr('placeholder', '# gallons in this growbed');
			$('#update_growbed').css('display', 'inline');
		}
	});

	// update/create submit
	$('.submit').on('click', function(){
		if (this.id === 'submit_reservoir_button')
		{
			var desc = $('#reservoir_desc_input').val();
			var gallons = $('#reservoir_gallons_input').val();
			var rid = $('#reservoir_id_label').text();
			var data = {
				"description" : desc,
				"gallons" : gallons
			}

			var url = "http://127.0.0.1:5000/api/reservoir/" + rid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/reservoir";
			}
			$.ajax({
				url:url,
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){
					
				}
			});

		}
		else if (this.id === 'submit_sensor_button')
		{
			var desc = $('#sensor_desc_input').val();
			var rid = $('#sensor_reservoir_id_input').val();
			var sid = $('#sensor_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : rid
			}
			
			var url = "http://127.0.0.1:5000/api/systemsensor/" + sid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/systemsensor";
			}
			$.ajax({
				url:url,
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){

				}
			});
		}
		else if (this.id === 'submit_tank_button')
		{
			var desc = $('#tank_desc_input').val();
			var rid = $('#tank_reservoir_id_input').val();
			var gallons = $('#tank_gallons_input').val();
			var tid = $('#tank_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : rid,
				"gallons" : gallons
			}

			console.log(data);

			var url = "http://127.0.0.1:5000/api/fishtank/" + tid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/fishtank";
			}
			$.ajax({
				url:url,
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){

				}
			});
		}
		else if (this.id === 'submit_growbed_button')
		{
			var desc = $('#growbed_desc_input').val();
			var rid = $('#growbed_reservoir_id_input').val();
			var gallons = $('#growbed_gallons_input').val();
			var gbid = $('#growbed_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : rid,
				"gallons" : gallons
			}

			var url = "http://127.0.0.1:5000/api/growbed/" + gbid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/growbed";
			}
			$.ajax({
				url:url,
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){

				}
			});
		}
	});

	// exit edit form
	$('.exit').on('click', function(){
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');
		createNew = false;
	});

});



