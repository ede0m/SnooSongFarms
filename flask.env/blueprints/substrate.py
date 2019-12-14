from flask import Blueprint
from flask import request, jsonify, abort
from models import db, Substrate

substrate_api = Blueprint('substrate_api', __name__)


@substrate_api.route('/api/substrate', methods=['GET', 'POST'])
def substrate():
	
	if request.method == 'GET':
		
		data = Substrate.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new substrate
		if not request.json:	
			abort(400)

		substrate = Substrate(
			description=request.json['description']
		)

		db.session.add(substrate)
		db.session.commit()
		return jsonify(request.json), 201


@substrate_api.route('/api/substrate/<substrate_id>', methods=['POST'])
def update_substrate(substrate_id):
	
	if not request.json:
		abort(400)

	substrate = Substrate.query.filter_by(substrate_id=substrate_id).first()
	
	# UPDATE tank
	if request.json['description']:
		substrate.description = request.json['description']

	db.session.commit()
	return jsonify(substrate.as_dict()), 201