var select_options = {};
var chart_query_measurement = 'ph';
var chart_query_time = 'today';

$.get(
	"http://127.0.0.1:5000/api/fishtank",
	function(data) {
		select_options['fishtank'] = {};
		$.each(data, function(key, value ) {
	  		select_options['fishtank'][value.tank_id] = value.tank_id + " : " + value.description;
		});
	}
);


$.get(
	"http://127.0.0.1:5000/api/growbed",
	function(data) {
		select_options['growbed'] = {};
		$.each(data, function(key, value ) {
			select_options['growbed'][value.growbed_id] = value.growbed_id + " : " + value.description;
			// set growbeds first
			$('#query_by_selection_select').append('<option value="'+ value.growbed_id +'">'+ value.description+'</option>')
		});
	}
);


$( document ).ready(function() {

	$('#plant_monitor').css('display', 'none');
	$('#fish_monitor').css('display', 'none');

	// switch query options
	$('#query_by_select').on('change', function() {
		$('#plant_monitor').css('display', 'none');
		$('#fish_monitor').css('display', 'none');
		$('#update_monitor_plants').css('display', 'none');
		$('#update_monitor_fish').css('display', 'none');
		
		$('#query_by_selection_select').empty();
		$.each(select_options[this.value], function(key, value){
			$('#query_by_selection_select').append('<option value="'+ key +'">'+ value+'</option>')
		});
	});

	// query for tables
	$('#submit_query_button').on('click', function(){
		
		$("#plant_monitor_table tbody").empty();
		$("#fish_monitor_table tbody").empty();

		if ($('#query_by_select').val() === 'growbed'){
			
			$('#plant_monitor').css('display', 'inline');
			var gbid = parseInt($('#query_by_selection_select').val());
			
			// query plants in growbed
			$.get(
				"http://127.0.0.1:5000/api/plantby/growbed/" + gbid,
				function(data) {
					$.each(data, function(key, value ) {
						var id = value.plant_id;
						var desc = value.description;
						var count = value.count;
						var units = value.units;
						var startp = value.start_plant.split(" ")[0];
						var endg = value.end_germination;
						var endl = value.end_life;
						var harvested = value.harvested;
						var yieldlb = value.yield_lbs;
						var height = value.max_height_inch;

						var markup = "<tr><td>"+id+"</td><td>"+desc+"</td><td>"+count+" "+units+"</td><td>"
							+startp+"</td><td>"+endg+"</td><td>"+endl+"</td><td>"+harvested+"</td><td>"+
							yieldlb+"</td><td>"+height+"</td></tr>";

						$('#plant_monitor_table tbody:last-child').append(markup);

					});
				}
			);

			// Chart data query when selecting growbed
			chart_query_measurement = 'ph';
			chart_query_time = 'today';
			var title = $('#query_by_selection_select option:selected').text();
			var url = "http://127.0.0.1:5000/api/growbed/telemetry/" + gbid + '/' + chart_query_time + '/' + chart_query_measurement;
			$.get(
				url,
				function(data) {
					RenderCharts(data, chart_query_measurement, title);
					$('#metric_cards').css('display', 'flex');
					$('#chart_time_filter').css('display', 'flex');
				}
			);

		}
		
		else if ($('#query_by_select').val() === 'fishtank'){
			
			$('#plant_monitor').css('display', 'inline');
			$('#fish_monitor').css('display', 'inline');
			
			var tid = parseInt($('#query_by_selection_select').val());
			
			// query fish in tank
			$.get(
				"http://127.0.0.1:5000/api/fishby/fishtank/" + tid,
				function(data) {
					$.each(data, function(key, value ) {
						var id = value.fish_id;
						var type = value.fish_type;
						var sz = value.size_inch;
						var desc = value.description;
						var death = value.death;
						var markup = "<tr><td>"+id+"</td><td>"+desc+"</td><td>"+type+"</td><td>"
							+sz+"</td><td>"+death+"</td></tr>";
						$('#fish_monitor_table tbody:last-child').append(markup);
					});
				}
			);

			// query plants in tank
			$.get(
				"http://127.0.0.1:5000/api/plantby/fishtank/" + tid,
				function(data) {
					$.each(data, function(key, value ) {
						var id = value.plant_id;
						var desc = value.description;
						var count = value.count;
						var units = value.units;
						var startp = value.start_plant;
						var endg = value.end_germination;
						var endl = value.end_life;
						var harvested = value.harvested;
						var yieldlb = value.yield_lbs;
						var height = value.max_height_inch;


						var markup = "<tr><td>"+id+"</td><td>"+desc+"</td><td>"+count+" "+units+"</td><td>"
							+startp+"</td><td>"+endg+"</td><td>"+endl+"</td><td>"+harvested+"</td><td>"+
							yieldlb+"</td><td>"+height+"</td></tr>";


						$('#plant_monitor_table tbody:last-child').append(markup);

					});
				}
			);

			// Chart data query when selecting tank
			chart_query_measurement = 'ph';
			chart_query_time = 'today';
			var title = $('#query_by_selection_select option:selected').text();
			console.log(title);
			var url = "http://127.0.0.1:5000/api/fishtank/telemetry/" + tid + '/' + chart_query_time + '/' + chart_query_measurement;
			$.get(
				url,
				function(data) {
					RenderCharts(data, chart_query_measurement, title);
					$('#metric_cards').css('display', 'flex');
					$('#chart_time_filter').css('display', 'flex');
				}
			);

		}
	});


	// TABLE ROW CLICKS 

	$('#plant_monitor_table').on('click', 'tbody tr', function() {
		var $headers = $("#plant_monitor_table th");
		$cells = $(this).find("td");
		data_p = {};
		$cells.each(function(cellIndex) {
			data_p[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		if (data_p['endGerm'] != 'null'){
			$('#plant_endgerm_input').val(new Date(data_p['endGerm']).toISOString().substring(0, 10));
		}
		if (data_p['endLife'] != 'null') {
			$('#plant_endlife_input').val(new Date(data_p['endGerm']).toISOString().substring(0, 10));
		}
		$('#plant_harvested_switch').prop('checked', data_p['harvested']);
		$('#plant_yield_switch').val(data_p['yeildLbs']);
		$('#plant_height_switch').val(data_p['heightInch']);
		$('#plant_id_monitor_label').text(data_p['plantID']);
		
		$('#update_monitor_plants').css('display', 'inline');
	});


	$('#fish_monitor_table').on('click', 'tbody tr', function() {
		var $headers = $("#fish_monitor_table th");
		$cells = $(this).find("td");
		data_f = {};
		$cells.each(function(cellIndex) {
			data_f[$($headers[cellIndex]).html().trim()] = $(this).html();
		});

		$('#fish_death_input').val(data_f['deathDate']);
		$('#fish_id_monitor_label').text(data_f['fishID']);
		$('#update_monitor_fish').css('display', 'inline');
	});


	// Chart options (time)
	$('.time_filter_button').on('click', function(){
		chart_query_time = $(this).text();
		var id = parseInt($('#query_by_selection_select').val());
		var title = $('#query_by_selection_select option:selected').text();

		if ($('#query_by_select').val() === 'growbed'){
			var url = "http://127.0.0.1:5000/api/growbed/telemetry/" + id + '/' + chart_query_time + '/' + chart_query_measurement;
		}
		else if ($('#query_by_select').val() === 'fishtank'){
			var url = "http://127.0.0.1:5000/api/fishtank/telemetry/" + id + '/' + chart_query_time + '/' + chart_query_measurement;
		}
		$.get(
			url,
			function(data) {
				RenderCharts(data, chart_query_measurement, title);
				$('#metric_cards').css('display', 'flex');
				$('#chart_time_filter').css('display', 'flex');
			}
		);
	});

	// Chart options (measurement)
	$('.measurement_filter_button').on('click', function(){
		chart_query_measurement = $(this).text().toLowerCase();
		var id = parseInt($('#query_by_selection_select').val());
		var title = $('#query_by_selection_select option:selected').text();

		if ($('#query_by_select').val() === 'growbed'){
			var url = "http://127.0.0.1:5000/api/growbed/telemetry/" + id + '/' + chart_query_time + '/' + chart_query_measurement;
		}
		else if ($('#query_by_select').val() === 'fishtank'){
			var url = "http://127.0.0.1:5000/api/fishtank/telemetry/" + id + '/' + chart_query_time + '/' + chart_query_measurement;
		}
		$.get(
			url,
			function(data) {
				RenderCharts(data, chart_query_measurement, title);
				$('#metric_cards').css('display', 'flex');
				$('#chart_time_filter').css('display', 'flex');
			}
		);
	});



	// exit edit form
	$('.exit').on('click', function(){
		$('#update_monitor_plants').css('display', 'none');
		$('#update_monitor_fish').css('display', 'none');
	});


});


function RenderCharts(data, measurement, title) {
	
	// clean data
	var times_trimmed = []
	$.each(data['times'], function(index, item){
		var trimmed_up = item.substring(0, 19);
		times_trimmed.push(trimmed_up);
	});
	
	var ctx = document.getElementById('aggregateLineChart').getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	    	labels: times_trimmed,
			datasets: [{
				label: measurement,
				backgroundColor: '#DC143C',
				borderColor: '#FF7F50',
				fill: false,
				data: data['values'],
			}]
		},
	    options: {
	        title: {
	            display: true,
	            text: measurement + " : " + title,
	            fontSize : 9,
	            padding: 15
        	},
         	legend: {
            	display: false
         	},
	    	responsive:true,
			maintainAspectRatio: false,
	        scales: {
				xAxes: [{
					time: {
						unit: 'datetime'
					},
					ticks: {
						maxTicksLimit: 8,
						fontSize: 9,
			          	maxRotation: 0,
          				minRotation: 0,
          				padding: 20
					}
				}],
				yAxes: [{

				}]
	        }
	    }
	});
}