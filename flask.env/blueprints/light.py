from flask import Blueprint
from flask import request, jsonify, abort
from models import db, Light

light_api = Blueprint('light_api', __name__)

@light_api.route('/api/light', methods=['GET', 'POST'])
def light():
	
	if request.method == 'GET':
		
		data = Light.query.all()
		data = [r.as_dict() for r in data]
		return jsonify(data)

	else:
		# CREATE new tank
		if not request.json:	
			abort(400)

		light = Light(
			description=request.json['description'], 
			lumens=request.json['lumens'],
			spectrum_k=request.json['spectrumK'],
			watts=request.json['watts']
		)

		db.session.add(light)
		db.session.commit()
		return jsonify(request.json), 201


@light_api.route('/api/light/<light_id>', methods=['POST'])
def update_light(light_id):
	
	if not request.json:
		print(request)
		abort(400)

	light = Light.query.filter_by(light_id=light_id).first()
	
	# UPDATE light
	if request.json['description']:
		light.description = request.json['description']
	if request.json['lumens']:
		light.lumens = request.json['lumens']
	if request.json['spectrumK']:
		light.spectrum_k = request.json['spectrumK']
	if request.json['watts']:
		light.watts = request.json['watts']

	db.session.commit()
	return jsonify(light.as_dict()), 201