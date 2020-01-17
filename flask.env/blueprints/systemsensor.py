from flask import Blueprint
from flask import request, jsonify, abort
from models import db, SystemSensor
from operator import itemgetter

system_sensor_api = Blueprint('system_sensor_api', __name__)

# for mapping batch telemetry to postgres function sensor_telemetry array parameter
ig = itemgetter("sensorID", "measurement", "value", "timestamp") 


@system_sensor_api.route('/api/systemsensor/<sensor_id>', methods=['POST'])
def update_sensor(sensor_id):
	
	if not request.json:
		abort(400)

	sensor = SystemSensor.query.filter_by(sensor_id=sensor_id).first()
	
	if request.json['reservoirID']:
		sensor.reservoir_id = request.json['reservoirID']
	if request.json['description']:
		sensor.description = request.json['description']

	db.session.commit()
	return jsonify(sensor.as_dict()), 201


@system_sensor_api.route('/api/systemsensor', methods=['GET', 'POST'])
def system_sensor():
	
	if request.method == 'GET':
		
		data = SystemSensor.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new sensor
		if not request.json:
			abort(400)

		print(request.json)

		sensor = SystemSensor(
			sensor_id = request.json['sensorID'], 
			reservoir_id = request.json['reservoirID'],
			description = request.json['description']
		)
		
		db.session.add(sensor)
		db.session.commit()

		return jsonify(request.json), 201



@system_sensor_api.route('/api/telemetry', methods=['POST'])
def persist_telemetry():
	
	if not request.json:
		abort(400)

	sensorID = request.json['sensorID']
	measurement = request.json['measurement']
	value = request.json['value']
	timestamp = request.json['timestamp']

	params = {
		'sensorid' : sensorID,
		'measurement' : measurement,
		'val' : value,
		'ts' : timestamp
	}

	result = db.session.execute("""select "Sensor"."PersistTelemetry"(
		:sensorid, :measurement, :val, :ts)""", params)
	db.session.commit()

	return result[0], 201


@system_sensor_api.route('/api/telemetry/batch', methods=['POST'])
def persist_telemetry_batch():
	
	if not request.json:
		abort(400)

	batch = {"batch": list(map(ig, request.json['batch']))}
	print(batch)

	result = db.session.execute("""select "Sensor"."PersistTelemetryBatch"(
		CAST(:batch AS "Sensor".sensor_telemetry[]))""", batch)
	db.session.commit()

	return batch, 201