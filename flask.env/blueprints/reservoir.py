from flask import Blueprint
from flask import request, jsonify, abort
from models import db, Reservoir

reservoir_api = Blueprint('reservoir_api', __name__)

@reservoir_api.route('/api/reservoir', methods=['GET', 'POST'])
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


@reservoir_api.route('/api/reservoir/<reservoir_id>', methods=['POST'])
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