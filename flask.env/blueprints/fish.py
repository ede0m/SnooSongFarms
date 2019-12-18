from flask import Blueprint
from flask import request, jsonify, abort
from models import db, Fish

fish_api = Blueprint('fish_api', __name__)

@fish_api.route('/api/fishby/fishtank/<tank_id>', methods=['GET'])
def plant_by_tank(tank_id):
		
	data = Fish.query.filter_by(tank_id=tank_id)
	data = [r.as_dict() for r in data]
	return jsonify(data)


@fish_api.route('/api/fish', methods=['GET', 'POST'])
def fish():
	
	if request.method == 'GET':
		
		data = Fish.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new substrate
		if not request.json:	
			abort(400)

		fish = Fish(
			description=request.json['description'], 
			tank_id=request.json['tankID'],
			size_inch = request.json['inchSize'],
			fish_type = request.json['fishType']
		)

		db.session.add(fish)
		db.session.commit()
		return jsonify(request.json), 201


@fish_api.route('/api/fish/<fish_id>', methods=['POST'])
def update_fish(fish_id):
	
	if not request.json:
		abort(400)

	fish = Fish.query.filter_by(fish_id=fish_id).first()
	
	# UPDATE tank
	if request.json['description']:
		fish.description = request.json['description']
	if request.json['tankID']:
		fish.tank_id = request.json['tankID'],
	if request.json['inchSize']:
		fish.size_inch = request.json['inchSize'],
	if request.json['fishType']:
		fish.fish_type = request.json['fishType']

	db.session.commit()
	return jsonify(fish.as_dict()), 201