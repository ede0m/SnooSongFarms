from flask import Blueprint
from flask import request, jsonify, abort
from models import db, SystemSensor, SensorReading
from operator import itemgetter

system_sensor_api = Blueprint('system_sensor_api', __name__)

# for mapping batch telemetry to postgres function sensor_telemetry array parameter
ig = itemgetter("sensorID", "measurement", "value", "timestamp") 


@system_sensor_api.route('/api/systemsensor/<sensor_id>', methods=['POST'])
def update_sensor(sensor_id):
	
	if not request.json:
		abort(400)

	sensor = SystemSensor.query.filter_by(sensor_id=sensor_id).first()
	
	if request.json.get('reservoirID') is not None:
		sensor.reservoir_id = request.json['reservoirID']
	if request.json.get('description') is not None:
		sensor.description = request.json['description']
	if request.json.get('enabled') is not None:
		sensor.enabled = request.json['enabled']

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

		sensor = SystemSensor(
			sensor_id = request.json['sensorID'], 
			reservoir_id = request.json['reservoirID'],
			description = request.json['description'],
			enabled = False
		)
		
		db.session.add(sensor)
		db.session.commit()

		return jsonify(request.json), 201


@system_sensor_api.route('/api/telemetry/<sensor_id>', methods=['GET'])
def get_telemetry_by_sensor(sensor_id):
	
	data = SensorReading.query.filter_by(sensor_id=sensor_id).order_by(SensorReading.timestamp.desc()).limit(10).all()
	data = [r.as_dict() for r in data]
	return jsonify(data), 201


# ADDING TELEMETRY

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

	result = db.session.execute("""select "Sensor"."PersistTelemetryBatch"(
		CAST(:batch AS "Sensor".sensor_telemetry[]))""", batch)
	db.session.commit()

	return batch, 201