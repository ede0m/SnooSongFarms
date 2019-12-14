from flask import Blueprint
from flask import request, jsonify, abort
from models import db, GrowBed

growbed_api = Blueprint('growbed_api', __name__)

@growbed_api.route('/api/growbed', methods=['GET', 'POST'])
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
			reservoir_id=request.json['reservoirID'],
			substrate_id=request.json['substrateID']
		)

		db.session.add(growbed)
		db.session.commit()
		return jsonify(request.json), 201


@growbed_api.route('/api/growbed/<growbed_id>', methods=['POST'])
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
		growbed.reservoir_id = request.json['reservoirID']
	if request.json['substrateID']:
		growbed.substrate_id = request.json['substrateID']
	if (request.json['lightID']):
		growbed.light_id = request.json['lightID']

	db.session.commit()
	return jsonify(growbed.as_dict()), 201