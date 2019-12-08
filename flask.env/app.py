#!flask/bin/python
from flask import Flask, request, jsonify
from models import db, Reservoir, SystemSensor, SensorReading
from operator import itemgetter


app = Flask(__name__)
app.config.from_object('config')

# for mapping batch telemetry to postgres function sensor_telemetry array parameter
ig = itemgetter("sensorID", "measurement", "value", "timestamp") 

app.config['SQLALCHEMY_DATABASE_URI'] = app.config["DB_CONN"]
db.init_app(app)

@app.route('/api')
def index():
	return "Snoo Song Farms - System Monitor API"


@app.route('/api/reservoir', methods=['POST'])
def create_reservoir():
	
	if not request.json:
		abort(400)

	reservoir = Reservoir(
		description=request.json['description'], 
		gallons=request.json['gallons']
	)

	db.session.add(reservoir)
	db.session.commit()

	return jsonify(request.json), 201


@app.route('/api/systemsensor', methods=['POST'])
def create_systems_ensor():
	
	if not request.json:
		abort(400)

	sensor = SystemSensor(
		sensorid = request.json['sensorID'], 
		reservoirid = request.json['reservoirID'],
		description = request.json['description']
	)
	
	db.session.add(sensor)
	db.session.commit()

	return jsonify(request.json), 201


@app.route('/api/telemetry', methods=['POST'])
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

	print(params)

	result = db.session.execute("""select "Sensor"."PersistTelemetry"(
		:sensorid, :measurement, :val, :ts)""", params)
	db.session.commit()

	return result[0], 201


@app.route('/api/telemetry/batch', methods=['POST'])
def persist_telemetry_batch():
	
	if not request.json:
		abort(400)

	batch = {"batch": list(map(ig, request.json['batch']))}

	result = db.session.execute("""select "Sensor"."PersistTelemetryBatch"(
		CAST(:batch AS "Sensor".sensor_telemetry[]))""", batch)
	db.session.commit()

	return batch, 201


if __name__ == '__main__':
	app.run(debug=True)