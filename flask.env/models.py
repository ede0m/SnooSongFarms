from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()

"""
class BaseModel(db.Model):
 # Base data model for all objects
	__abstract__ = True
	# define here __repr__ and json methods or any common method
	# that you need for all your models
"""

class Reservoir(db.Model):
	__tablename__ = 'Reservoirs'
	__table_args__ = {'schema': 'Aquaponics'}
	reservoirid = db.Column(db.Integer, unique=True, primary_key = True)
	description = db.Column(db.String)
	gallons = db.Column(db.Integer)

	def as_dict(self):
		return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class SystemSensor(db.Model):
	__tablename__ = 'SystemSensors'
	__table_args__ = {'schema' : 'Sensor'}
	sensorid = db.Column(db.String, unique=True, primary_key = True)
	reservoirid = db.Column(db.Integer)
	description = db.Column(db.String)

	def as_dict(self):
		return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class SensorReading(db.Model):
	__tablename__ = 'SensorReadings'
	__table_args__ = {'schema' : 'Sensor'}
	telemetryid = db.Column(db.Integer, unique=True, primary_key = True)
	sensorid = db.Column(db.String)
	reservoirid = db.Column(db.Integer)
	timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
	measurement = db.Column(db.String(20))
	value = db.Column(db.Numeric(3,7))

