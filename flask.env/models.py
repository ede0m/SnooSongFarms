from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ENUM
import datetime

db = SQLAlchemy()

# DB defined Enums
fish_types = ('unknown', 'neon_tetra', 'amano_shrimp')
fish_types_enum = ENUM(*fish_types, name="fish_types")

 # Base data model for all objects
class Base(db.Model):
	__abstract__ = True
	
	def as_dict(self):
			return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Reservoir(Base):
	__tablename__ = 'Reservoirs'
	__table_args__ = {'schema': 'Aquaponics'}
	reservoir_id = db.Column(db.Integer, unique=True, primary_key = True)
	description = db.Column(db.String)
	gallons = db.Column(db.Integer)

class FishTank(Base):
	__tablename__ = 'FishTanks'
	__table_args__ = {'schema': 'Aquaponics'}
	tank_id = db.Column(db.Integer, unique=True, primary_key = True)
	reservoir_id = db.Column(db.Integer)
	description = db.Column(db.String)
	gallons = db.Column(db.Integer)
	substrate_id = db.Column(db.Integer)
	light_id = db.Column(db.Integer)

class Substrate(Base):
	__tablename__ = 'Substrates'
	__table_args__ = {'schema': 'Aquaponics'}
	substrate_id = db.Column(db.Integer, unique=True, primary_key = True)
	description = db.Column(db.String)

class Fish(Base):
	__tablename__ = 'Fish'
	__table_args__ = {'schema': 'Aquaponics'}
	fish_id = db.Column(db.Integer, unique=True, primary_key = True)
	tank_id = db.Column(db.Integer)
	description = db.Column(db.String)
	size_inch = db.Column(db.Numeric(2,5))
	fish_type = db.Column(fish_types_enum)
	death = db.Column(db.DateTime)

class Plant(Base):
	__tablename__ = 'Plants'
	__table_args__ = {'schema': 'Aquaponics'}
	plant_id = db.Column(db.Integer, unique=True, primary_key = True)
	tank_id = db.Column(db.Integer)
	growbed_id = db.Column(db.Integer)
	description = db.Column(db.String)
	start_plant = db.Column(db.DateTime)
	end_germination = db.Column(db.DateTime)
	end_life = db.Column(db.DateTime)
	harvested = db.Column(db.Boolean, default=False)
	yield_lbs = db.Column(db.Numeric(3,5))
	max_height_inch = db.Column(db.Numeric(3,5))
	count = db.Column(db.Integer)
	units = db.Column(db.String)

class GrowBed(Base):
	__tablename__ = 'GrowBeds'
	__table_args__ = {'schema': 'Aquaponics'}
	growbed_id = db.Column(db.Integer, unique=True, primary_key = True)
	reservoir_id = db.Column(db.Integer)
	description = db.Column(db.String)
	gallons = db.Column(db.Integer)
	substrate_id = db.Column(db.Integer)
	light_id = db.Column(db.Integer)

class Light(Base):
	__tablename__ = 'Lights'
	__table_args__ = {'schema' : 'Aquaponics'}
	light_id = db.Column(db.Integer, unique=True, primary_key = True)
	spectrum_k = db.Column(db.Integer)
	lumens = db.Column(db.Integer)
	watts = db.Column(db.Integer)
	description = db.Column(db.String)	

class SystemSensor(Base):
	__tablename__ = 'SystemSensors'
	__table_args__ = {'schema' : 'Sensor'}
	sensor_id = db.Column(db.String, unique=True, primary_key = True)
	reservoir_id = db.Column(db.Integer)
	description = db.Column(db.String)
	enabled = db.Column(db.Boolean, default=False)

class SensorReading(Base):
	__tablename__ = 'SensorReadings'
	__table_args__ = {'schema' : 'Sensor'}
	telemetry_id = db.Column(db.Integer, unique=True, primary_key = True)
	sensor_id = db.Column(db.String)
	reservoir_id = db.Column(db.Integer)
	timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
	measurement = db.Column(db.String(20))
	value = db.Column(db.Numeric(3,7))

