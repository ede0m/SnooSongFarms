var api_base_url = 'http://localhost:5000/api/'; 

var types = {}

$.get(
	api_base_url + "reservoir",
	function(data) {
		$.each(data, function(key, value ) {
			var id = value.reservoir_id;
			var desc = value.description;
			var gal = value.gallons;
			var markup = "<tr><td>" + id + "</td><td>" + desc + "</td><td>" + gal + "</td></tr>";
			
			$('#reservoirs_table tbody:last-child').append(markup);
			$('#growbed_reservoir_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#tank_reservoir_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#sensor_reservoir_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
		});
	}
);

$.get(
	api_base_url + "systemsensor",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.sensor_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var markup = "<tr><td>" + id + "</td><td>" + resid + "</td><td>" + desc + "</td></tr>";
			
			$('#sensors_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	api_base_url + "fishtank",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.tank_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var gallons = value.gallons;
			var subid = value.substrate_id;
			var lid = value.light_id;
			var markup = "<tr><td>"+id+"</td><td>"+resid+"</td><td>"+subid+"</td><td>"+lid+"</td><td>"
				+desc+"</td><td>"+gallons+"</td></tr>";
			
			$('#tanks_table tbody:last-child').append(markup);
			$('#fish_tank_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#plant_tank_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
		});
	}
);

$.get(
	api_base_url + "fish",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.fish_id;
			var desc = value.description;
			var tid = value.tank_id;
			var size = value.size_inch;
			var type = value.fish_type;
			var markup = "<tr><td>"+id+"</td><td>"+tid+"</td><td>"+type+"</td><td>"+size+"</td><td>"+desc+"</td></tr>";
			
			$('#fish_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	api_base_url + "substrate",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.substrate_id;
			var desc = value.description;
			var tankid = value.tank_id;
			var markup = "<tr><td>"+id+"</td><td>"+desc+"</td></tr>";
			
			$('#substrates_table tbody:last-child').append(markup);
			$('#substrate_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#growbed_substrate_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#tank_substrate_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
		});
	}
);

$.get(
	api_base_url + "growbed",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.growbed_id;
			var desc = value.description;
			var resid = value.reservoir_id;
			var gallons = value.gallons;
			var subid = value.substrate_id;
			var lid = value.light_id;
			var markup = "<tr><td>"+id+"</td><td>"+resid+"</td><td>"+subid+
				"</td><td>"+lid+"</td><td>"+desc+"</td><td>"+gallons+"</td></tr>";
			
			$('#plant_growbed_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#growbeds_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	api_base_url + "light",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.light_id;
			var desc = value.description;
			var lum = value.lumens;
			var spec = value.spectrum_k;
			var wat = value.watts;
			var markup = "<tr><td>"+id+"</td><td>"+spec+"</td><td>"+lum+
				"</td><td>"+wat+"</td><td>"+desc+"</td></tr>";
			

			$('#tank_light_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#growbed_light_id_select').append('<option value="'+ id +'">'+ id+' : '+desc+'</option>');
			$('#lights_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	api_base_url + "plant",
	function(data) {
		$.each(data, function(key, value ) {
		  
			var id = value.plant_id;
			var desc = value.description;
			var tid = value.tank_id;
			var gbid = value.growbed_id;
			var count = value.count;
			var units = value.units;
			var start = value.start_plant;
			var markup = "<tr><td>"+id+"</td><td>"+tid+"</td><td>"+gbid+
				"</td><td>"+desc+"</td><td>"+count+" "+units+"</td><td>"+start+"</td></tr>";
			
			$('#plants_table tbody:last-child').append(markup);

		});
	}
);

$.get(
	api_base_url + "types",
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
		$('#update_light').css('display', 'none');
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
		$('#tank_substrate_id_select').val(data_t['substrateID']);
		$('#tank_light_id_select').val(data_t['lightID']);
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
		$('#growbed_substrate_id_select').val(data_gb['substrateID']);
		$('#growbed_light_id_select').val(data_gb['lightID']);
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

	$('#lights_table').on('click', 'tbody tr', function() {
		var $headers = $("#lights_table th");
		$cells = $(this).find("td");
		data_lt = {};
		$cells.each(function(cellIndex) {
			data_lt[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#light_desc_input').val(data_lt['description']);
		$('#light_lumens_input').val(data_lt['lumens']);
		$('#light_spectrum_input').val(data_lt['spectrumK']);
		$('#light_watts_input').val(data_lt['watts']);
		$('#light_id_label').text(data_lt['lightID']);
		$('#update_light').css('display', 'inline');
	});

	$('#plants_table').on('click', 'tbody tr', function() {
		var $headers = $("#plants_table th");
		$cells = $(this).find("td");
		data_p = {};
		$cells.each(function(cellIndex) {
			data_p[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#plant_tank_id_select').on('change', function(e){
			$('#plant_growbed_id_select').val(null);
		});

		$('#plant_growbed_id_select').on('change', function(e){
			$('#plant_tank_id_select').val(null);
		});

		$('#plant_desc_input').val(data_p['description']);
		$('#plant_tank_id_select').val(data_p['tankID']);
		$('#plant_growbed_id_select').val(data_p['growbedID']);
		var qty = data_p['count'].split(' ');
		$('#plant_count_input').val(qty[0]);
		$('#plant_unit_input').val(qty[1]);		
		$('#plant_start_input').val(new Date(data_p['startPlant']).toISOString().substring(0, 10));
		$('#plant_id_label').text(data_p['plantID']);
		$('#update_plant').css('display', 'inline');
	});

	$('.add_button').on('click', function(){
		
		$('#update_sensor').css('display', 'none');
		$('#update_reservoir').css('display', 'none');
		$('#update_tank').css('display', 'none');
		$('#update_growbed').css('display', 'none');
		$('#update_substrate').css('display', 'none');
		$('#update_fish').css('display', 'none');
		$('#update_light').css('display', 'none');


		$('label').val("NULL");
		$('select').val("");
		$('input').val("");

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
		else if (this.id === 'add_light_button')
		{

			$('#light_desc_input').attr('placeholder', "description");
			$('#light_lumens_input').attr('placeholder', "lumens");
			$('#light_watts_input').attr('placeholder', 'watts');
			$('#light_spectrum_input').attr('placeholder', 'spectrum K');
			$('#update_light').css('display', 'inline');
		}
		else if (this.id === 'add_plant_button')
		{

			$('#plant_desc_input').attr('placeholder', "description");
			$('#plant_count_input').attr('placeholder', "count");
			$('#plant_unit_input').attr('placeholder', 'units');
			$('#plant_spectrum_input').attr('placeholder', 'spectrum K');
			$('#plant_start_input').attr('placeholder', 'planted on');
			
			$('#plant_tank_id_select').append('<option value="" disabled selected hidden>select tank id ..</option>)');
			$('#plant_growbed_id_select').append('<option value="" disabled selected hidden>select growbed id ..</option>)');
			
			$('#plant_tank_id_select').on('change', function(e){
				$('#plant_growbed_id_select').val(null);
			});

			$('#plant_growbed_id_select').on('change', function(e){
				$('#plant_tank_id_select').val(null);
			});
		
			$('#update_plant').css('display', 'inline');
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

			var url = api_base_url + "reservoir/" + rid;
			if (createNew) {
				url = api_base_url + "reservoir";
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
			var sid = $('#sensor_id_input').val();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid),
				"sensorID" : sid
			}
			
			var url = api_base_url + "systemsensor/" + sid;
			if (createNew) {
				url = api_base_url + "systemsensor";
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
			var subid = $('#tank_substrate_id_select').val();
			var lid = $('#tank_light_id_select').val();
			var tid = $('#tank_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid),
				"gallons" : parseInt(gallons),
				"substrateID" : parseInt(subid),
				"lightID" : parseInt(lid)
			}

			var url = api_base_url + "fishtank/" + tid;
			if (createNew) {
				url = api_base_url + "fishtank";
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
			var lid = $('#growbed_light_id_select').val();
			var subid = $('#growbed_substrate_id_select').val();
			var tid = $('#growbed_id_label').text();
			var data = {
				"description" : desc,
				"reservoirID" : parseInt(rid),
				"gallons" : parseInt(gallons),
				"substrateID" : parseInt(subid),
				"lightID" : parseInt(lid)
			}

			var url = api_base_url + "growbed/" + gbid;
			if (createNew) {
				url = api_base_url + "growbed";
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
			var sid = $('#substrate_id_label').text();
			var data = {
				"description" : desc,
				"tankID" : parseInt(tid)
			}

			var url = api_base_url + "substrate/" + sid;
			if (createNew) {
				url = api_base_url + "substrate";
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

			var url = api_base_url + "fish/" + fid;
			if (createNew) {
				url = api_base_url + "fish";
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
		else if (this.id === 'submit_light_button')
		{
			var lid = $('#light_id_label').text();
			var desc = $('#light_desc_input').val();
			var lum = $('#light_lumens_input').val();
			var wat = $('#light_watts_input').val();
			var spec = $('#light_spectrum_input').val();
			
			var data = {
				"description" : desc,
				"lumens" : parseInt(lum),
				"watts" : parseInt(wat),
				"spectrumK": parseFloat(spec)
			}

			var url = api_base_url + "light/" + lid;
			if (createNew) {
				url = api_base_url + "light";
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
		else if (this.id === 'submit_plant_button')
		{
			var pid = $('#plant_id_label').text();
			var tid = $('#plant_tank_id_select').val();
			var gbid = $('#plant_growbed_id_select').val();
			var desc = $('#plant_desc_input').val();
			var count = $('#plant_count_input').val();
			var units = $('#plant_unit_input').val();
			var start = $('#plant_start_input').val();
			
			var data = {
				"description" : desc,
				"tankID": tid,
				"growbedID" : gbid,
				"count" : parseInt(count),
				"units" : units,
				"start": start
			}

			console.log(data);

			var url = api_base_url + "plant/" + pid;
			if (createNew) {
				url = api_base_url + "plant";
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
		$('#update_light').css('display', 'none');
		$('#update_plant').css('display', 'none');
		createNew = false;
	});

});



