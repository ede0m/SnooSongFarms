var types = {}


$.get(
	"http://127.0.0.1:5000/api/reservoir",
	function(data) {
		$.each(data, function(key, value ) {
			var id = value.reservoir_id;
			var desc = value.description;
			var gal = value.gallons;
			var markup = "<tr><td>" + id + "</td><td>" + desc + "</td><td>" + gal + "</td></tr>";
			
			$('#reservoirs_table tbody:last-child').append(markup);
			$('#growbed_reservoir_id_select').append('<option value="'+ id +'">'+ id +'</option>');
			$('#tank_reservoir_id_select').append('<option value="'+ id +'">'+ id +'</option>');
			$('#sensor_reservoir_id_select').append('<option value="'+ id +'">'+ id +'</option>');
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
			$('#fish_tank_id_select').append('<option value="'+ id +'">'+ id +'</option>');
			$('#substrate_tank_id_select').append('<option value="'+ id +'">'+ id +'</option>');

		});
	}
);

$.get(
	"http://127.0.0.1:5000/api/fish",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.fish_id;
			var desc = value.description;
			var tid = value.tank_id;
			var size = value.size_inch;
			var type = value.fish_type;
			var markup = "<tr><td>"+tid+"</td><td>"+id+"</td><td>"+type+"</td><td>"+size+"</td><td>"+desc+"</td></tr>";
			
			$('#fish_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	"http://127.0.0.1:5000/api/substrate",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.substrate_id;
			var desc = value.description;
			var tankid = value.tank_id;
			var markup = "<tr><td>"+tankid+"</td><td>"+id+"</td><td>"+desc+"</td></tr>";
			
			$('#substrates_table tbody:last-child').append(markup);

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

$.get(
	"http://127.0.0.1:5000/api/types",
	function(data) {
		
		$.each(data['fish_types'], function(i, d){
			$('#fish_type_select').append('<option value="'+ d +'">'+ d +'</option>');
		})

		types['fish_types'] = data['fish_types'];
		$('#fish_type_select')
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
		$('#update_substrate').css('display', 'none');
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
		$('#sensor_reservoir_id_select').val(data_s['reservoirID']);
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

		$('#tank_desc_input').val(data_t['description']);
		$('#tank_reservoir_id_select').val(data_t['reservoirID']);
		$('#tank_gallons_input').val(data_t['gallons']);
		$('#tank_id_label').text(data_t['tankID']);
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
		$('#growbed_reservoir_id_select').val(data_gb['reservoirID']);
		$('#growbed_gallons_input').val(data_gb['gallons']);
		$('#growbed_id_label').text(data_gb['growbedID']);
		$('#update_growbed').css('display', 'inline');
	});

	$('#substrates_table').on('click', 'tbody tr', function() {
		
		var $headers = $("#substrates_table th");
		$cells = $(this).find("td");
		data_sub = {};
		$cells.each(function(cellIndex) {
			data_sub[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#substrate_desc_input').val(data_sub['description']);
		$('#substrate_tank_id_select').val(data_sub['tankID']);
		$('#substrate_id_label').text(data_sub['substrateID']);
		$('#update_substrate').css('display', 'inline');
	});

	$('#fish_table').on('click', 'tbody tr', function() {
		
		var $headers = $("#fish_table th");
		$cells = $(this).find("td");
		data_f = {};
		$cells.each(function(cellIndex) {
			data_f[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#fish_desc_input').val(data_f['description']);
		$('#fish_tank_id_select').val(data_f['tankID']);
		$('#fish_size_input').val(data_f['inchSize']);
		$('#fish_type_select').val(data_f['fishType']);
		$('#fish_id_label').text(data_f['fishID']);
		$('#update_fish').css('display', 'inline');
	});

	$('.add_button').on('click', function(){
		
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');
		$('#update_substrate').css('display', 'none');
		$('#update_fish').css('display', 'none');

		$('#reservoir_desc_input').val("");
		$('#reservoir_gallons_input').val("");
		$('#reservoir_id_label').text("NOT ASSIGNED YET");
		$('#sensor_desc_input').val("");
		$('#sensor_reservoir_id_select').val("");
		$('#sensor_id_label').text("NOT YET ASSIGNED");
		$('#sensor_id_input').val("");
		$('#tank_desc_input').val("");
		$('#tank_reservoir_id_select').val("");
		$('#tank_gallons_input').val("");
		$('#tank_id_label').text("NOT YET ASSIGNED");
		$('#growbed_desc_input').val("");
		$('#growbed_reservoir_id_select').val("");
		$('#growbed_gallons_input').val("");
		$('#growbed_id_label').text("NOT YET ASSIGNED");

		$('#substrate_desc_input').val("");
		$('#substrate_tank_id_select').val("");
		$('#substrate_id_label').text("NOT YET ASSIGNED");

		$('#fish_desc_input').val("");
		$('#fish_tank_id_select').val("");
		$('#fish_size_input').val("");
		$('#fish_id_label').text("NOT YET ASSIGNED");


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
			$('#sensor_reservoir_id_select').attr('placeholder', "what reservoir is this sensor currently placed in?");
			$('#sensor_id_input').attr('placeholder', "unique id for this sensor module");
			$('#sensor_id_input').prop('disabled', false);
			$('#update_sensor').css('display', 'inline');
		}
		else if (this.id === 'add_tank_button')
		{

			$('#tank_desc_input').attr('placeholder', "description");
			$('#tank_reservoir_id_select').attr('placeholder', "what reservoir is this tank currently a part of?");
			$('#tank_gallons_input').attr('placeholder', '# gallons in this tank');
			$('#update_tank').css('display', 'inline');
		}
		else if (this.id === 'add_growbed_button')
		{

			$('#growbed_desc_input').attr('placeholder', "description");
			$('#growbed_reservoir_id_select').attr('placeholder', "what reservoir is this growbed currently a part of?");
			$('#growbed_gallons_input').attr('placeholder', '# gallons in this growbed');
			$('#update_growbed').css('display', 'inline');
		}
		else if (this.id === 'add_substrate_button')
		{

			$('#substrate_desc_input').attr('placeholder', "description");
			$('#substrate_tank_id_select').attr('placeholder', "what tank is this substrate laid in?");
			$('#update_substrate').css('display', 'inline');
		}
		else if (this.id === 'add_fish_button')
		{

			$('#fish_desc_input').attr('placeholder', "description");
			$('#fish_tank_id_select').attr('placeholder', "what tank is this fish currently a member of?");
			$('#fish_size_input').attr('placeholder', 'how long is this fish in inches?');
			$('#fish_type_select option[value="unknown"]').attr("selected",true);
			$('#update_fish').css('display', 'inline');
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
				"gallons" : parseInt(gallons)
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
					location.reload(true);
				}
			});

		}
		else if (this.id === 'submit_sensor_button')
		{
			var desc = $('#sensor_desc_input').val();
			var rid = $('#sensor_reservoir_id_select').val();
			var sid = $('#sensor_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid)
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
					location.reload(true);
				}
			});
		}
		else if (this.id === 'submit_tank_button')
		{
			var desc = $('#tank_desc_input').val();
			var rid = $('#tank_reservoir_id_select').val();
			var gallons = $('#tank_gallons_input').val();
			var tid = $('#tank_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid),
				"gallons" : parseInt(gallons)
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
					location.reload(true);
				}
			});
		}
		else if (this.id === 'submit_growbed_button')
		{
			var desc = $('#growbed_desc_input').val();
			var rid = $('#growbed_reservoir_id_select').val();
			var gallons = $('#growbed_gallons_input').val();
			var gbid = $('#growbed_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid),
				"gallons" : parseInt(gallons)
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
					location.reload(true);
				}
			});
		}
		else if (this.id === 'submit_substrate_button')
		{
			var desc = $('#substrate_desc_input').val();
			var tid = $('#substrate_tank_id_select').val();
			var sid = $('#substrate_id_label').text();
			var data = {
				"description" : desc,
				"tankID" : parseInt(tid)
			}

			var url = "http://127.0.0.1:5000/api/substrate/" + sid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/substrate";
			}
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
		}
		else if (this.id === 'submit_fish_button')
		{
			var desc = $('#fish_desc_input').val();
			var tid = $('#fish_tank_id_select').val();
			var fid = $('#fish_id_label').text();
			var size = $('#fish_size_input').val();
			var type = $('#fish_type_select').val();
			
			var data = {
				"description" : desc,
				"tankID" : parseInt(tid),
				"fishID" : parseInt(fid),
				"inchSize": parseFloat(size),
				"fishType" : type
			}

			var url = "http://127.0.0.1:5000/api/fish/" + fid;
			if (createNew) {
				url = "http://127.0.0.1:5000/api/fish";
			}
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
		}
	});

	// exit edit form
	$('.exit').on('click', function(){
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');
		$('#update_fish').css('display', 'none');
		$('#update_substrate').css('display', 'none');
		createNew = false;
	});

});



