#!flask/bin/python
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from models import db, Reservoir, GrowBed, FishTank, SystemSensor, SensorReading
from operator import itemgetter


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object('config')

# for mapping batch telemetry to postgres function sensor_telemetry array parameter
ig = itemgetter("sensorID", "measurement", "value", "timestamp") 

app.config['SQLALCHEMY_DATABASE_URI'] = app.config["DB_CONN"]
db.init_app(app)

@app.route('/api')
def index():
	return "Snoo Song Farms - System Monitor API"


@app.route('/api/reservoir', methods=['GET', 'POST'])
def reservoir():
	
	if request.method == 'GET':
		
		data = Reservoir.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new reservoir
		if not request.json:	
			abort(400)

		reservoir = Reservoir(
			description=request.json['description'], 
			gallons=request.json['gallons']
		)

		db.session.add(reservoir)
		db.session.commit()
		return jsonify(request.json), 201


@app.route('/api/reservoir/<reservoir_id>', methods=['POST'])
def update_reservoir(reservoir_id):
	
	if not request.json:
		print(request)
		abort(400)

	reservoir = Reservoir.query.filter_by(reservoir_id=reservoir_id).first()
	
	# UPDATE resrvoir
	if request.json['description']:
		reservoir.description = request.json['description']
	if request.json['gallons']:
		reservoir.gallons = request.json['gallons']

	db.session.commit()
	return jsonify(reservoir.as_dict()), 201



@app.route('/api/fishtank', methods=['GET', 'POST'])
def fishtank():
	
	if request.method == 'GET':
		
		data = FishTank.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new tank
		if not request.json:	
			abort(400)

		tank = FishTank(
			description=request.json['description'], 
			gallons=request.json['gallons'],
			reservoir_id=request.json['reservoirID']
		)

		db.session.add(tank)
		db.session.commit()
		return jsonify(request.json), 201


@app.route('/api/fishtank/<tank_id>', methods=['POST'])
def update_fishtank(tank_id):
	
	if not request.json:
		abort(400)

	print(tank_id)

	tank = FishTank.query.filter_by(tank_id=tank_id).first()
	
	# UPDATE tank
	if request.json['description']:
		tank.description = request.json['description']
	if request.json['gallons']:
		tank.gallons = request.json['gallons']
	if request.json['reservoirID']:
		tank.gallons = request.json['reservoirID']


	print(request.json)

	db.session.commit()
	return jsonify(tank.as_dict()), 201


@app.route('/api/growbed', methods=['GET', 'POST'])
def growbed():
	
	if request.method == 'GET':
		
		data = GrowBed.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new tank
		if not request.json:	
			abort(400)

		growbed = GrowBed(
			description=request.json['description'], 
			gallons=request.json['gallons'],
			reservoir_id=request.json['reservoirID']
		)

		db.session.add(growbed)
		db.session.commit()
		return jsonify(request.json), 201


@app.route('/api/growbed/<growbed_id>', methods=['POST'])
def update_growbed(growbed_id):
	
	if not request.json:
		print(request)
		abort(400)

	growbed = GrowBed.query.filter_by(growbed_id=growbed_id).first()
	
	# UPDATE tank
	if request.json['description']:
		growbed.description = request.json['description']
	if request.json['gallons']:
		growbed.gallons = request.json['gallons']
	if request.json['reservoirID']:
		growbed.gallons = request.json['reservoirID']

	db.session.commit()
	return jsonify(growbed.as_dict()), 201


@app.route('/api/systemsensor', methods=['GET', 'POST'])
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
			sensorid = request.json['sensorID'], 
			reservoirid = request.json['reservoirID'],
			description = request.json['description']
		)
		
		db.session.add(sensor)
		db.session.commit()

		return jsonify(request.json), 201


@app.route('/api/systemsensor/<sensor_id>', methods=['POST'])
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

	result = db.session.execute("""select "Sensor"."PersistTelemetry"(
		:sensorid, :measurement, :val, :ts)""", params)
	db.session.commit()

	return result[0], 201


@app.route('/api/telemetry/batch', methods=['POST'])
def persist_telemetry_batch():
	
	if not request.json:
		abort(400)

	batch = {"batch": list(map(ig, request.json['batch']))}
	print(batch)

	result = db.session.execute("""select "Sensor"."PersistTelemetryBatch"(
		CAST(:batch AS "Sensor".sensor_telemetry[]))""", batch)
	db.session.commit()

	return batch, 201


if __name__ == '__main__':
	app.run(debug=True)