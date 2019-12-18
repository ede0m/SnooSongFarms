from flask import Blueprint
from flask import request, jsonify, abort
from models import db, FishTank

tank_api = Blueprint('tank_api', __name__)

@tank_api.route('/api/fishtank', methods=['GET', 'POST'])
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
			reservoir_id=request.json['reservoirID'],
			substrate_id=request.json['substrateID']
		)

		db.session.add(tank)
		db.session.commit()
		return jsonify(request.json), 201


@tank_api.route('/api/fishtank/<tank_id>', methods=['POST'])
def update_fishtank(tank_id):
	
	if not request.json:
		abort(400)
		

	tank = FishTank.query.filter_by(tank_id=tank_id).first()
	
	# UPDATE tank
	if request.json['description']:
		tank.description = request.json['description']
	if request.json['gallons']:
		tank.gallons = request.json['gallons']
	if request.json['reservoirID']:
		tank.reservoir_id = request.json['reservoirID']
	if request.json['substrateID']:
		tank.substrate_id = request.json['substrateID']
	if (request.json['lightID']):
		tank.light_id = request.json['lightID']

	db.session.commit()
	return jsonify(tank.as_dict()), 201


@tank_api.route('/api/fishtank/telemetry/<tank_id>/<time>/<measurement>', methods=['GET'])
def fishtank_telemetry(tank_id, time, measurement):
	
	# set time param
	if time == 'month':
		time_q = '1 month'
	elif time == 'today':
		time_q = '24 hours'
	else:
		time_q = '5 years' # probably want to figure out the right way to do this..

	param = {
		"tid": tank_id,
		"time": time_q,
		"measurement" : measurement
	}
	sql = """select value, timestamp from "Sensor"."SensorReadings"
			where reservoir_id = (select reservoir_id from "Aquaponics"."FishTanks" where tank_id = :tid)
			and measurement = :measurement
			and timestamp BETWEEN NOW() - INTERVAL :time AND NOW()
			order by timestamp asc """

	result_ph = db.session.execute(sql, param)

	values_ph = []
	times_ph = []

	for r in result_ph:
		values_ph.append(r[0])
		times_ph.append(r[1])

	# ... similar queries for other sensor data

	result = {
		'values' : values_ph,
		'times' : times_ph
	}

	return jsonify(result), 201



