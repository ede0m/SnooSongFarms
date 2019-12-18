from flask import Blueprint
from flask import request, jsonify, abort
from models import db, Plant

plant_api = Blueprint('plant_api', __name__)


@plant_api.route('/api/plantby/fishtank/<tank_id>', methods=['GET'])
def plant_by_tank(tank_id):
		
	data = Plant.query.filter_by(tank_id=tank_id)
	data = [r.as_dict() for r in data]
	return jsonify(data)

@plant_api.route('/api/plantby/growbed/<growbed_id>', methods=['GET'])
def plant_by_growbed(growbed_id):
		
	data = Plant.query.filter_by(growbed_id=growbed_id)
	data = [r.as_dict() for r in data]
	return jsonify(data)

@plant_api.route('/api/plant', methods=['GET', 'POST'])
def plant():
	
	if request.method == 'GET':
		
		data = Plant.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new substrate
		if not request.json:	
			abort(400)

		plant = Plant(
			description=request.json['description'],
			tank_id = request.json['tankID'],
			growbed_id = request.json['growbedID'],
			count = request.json['count'],
			units = request.json['units'],
			start_plant = request.json['start']
		)

		db.session.add(plant)
		db.session.commit()
		return jsonify(request.json), 201


@plant_api.route('/api/plant/<plant_id>', methods=['POST'])
def update_plant(plant_id):
	
	if not request.json:
		abort(400)

	plant = Plant.query.filter_by(plant_id=plant_id).first()
	
	# UPDATE plant
	if request.json['description']:
		plant.description = request.json['description']
	if request.json['tankID']:
		plant.tank_id = request.json['tankID']
		plant.growbed_id = None
	if request.json['growbedID']:
		plant.growbed_id = request.json['growbedID']
		plant.tank_id = None
	if request.json['count']:
		plant.count = request.json['count']
	if request.json['units']:
		plant.units = request.json['units']
	if request.json['start']:
		plant.start_plant = request.json['start']


	db.session.commit()
	return jsonify(plant.as_dict()), 201