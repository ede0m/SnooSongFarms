#!flask/bin/python
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from models import fish_types
from models import db, Reservoir, GrowBed, Substrate, Fish, Light
from models import SystemSensor, SensorReading
from operator import itemgetter

from blueprints.tank import tank_api
from blueprints.fish import fish_api
from blueprints.growbed import growbed_api
from blueprints.systemsensor import system_sensor_api
from blueprints.substrate import substrate_api
from blueprints.reservoir import reservoir_api
from blueprints.light  import light_api
from blueprints.plant  import plant_api

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object('config')

#register blueprints
app.register_blueprint(tank_api)
app.register_blueprint(fish_api)
app.register_blueprint(growbed_api)
app.register_blueprint(system_sensor_api)
app.register_blueprint(substrate_api)
app.register_blueprint(reservoir_api)
app.register_blueprint(light_api)
app.register_blueprint(plant_api)


# for mapping batch telemetry to postgres function sensor_telemetry array parameter
ig = itemgetter("sensorID", "measurement", "value", "timestamp") 

# database conn
app.config['SQLALCHEMY_DATABASE_URI'] = app.config["DB_CONN"]
db.init_app(app)


## ENDPOINTS ##

@app.route('/api')
def index():
	return "Snoo Song Farms - System Monitor API"


@app.route('/api/types', methods=['GET'])
def get_types():
	types = {
		"fish_types" : list(fish_types)
	}
	return jsonify(types), 201


if __name__ == '__main__':
	app.run(debug=True)