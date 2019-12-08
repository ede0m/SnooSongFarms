CREATE DATABASE "SnooSongFarms"
    WITH 
    OWNER = moedepi
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_GB.UTF-8'
    LC_CTYPE = 'en_GB.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE SCHEMA "Aquaponics"
    AUTHORIZATION moedepi;

CREATE SCHEMA "Sensor"
    AUTHORIZATION moedepi;

----------

CREATE TABLE "Aquaponics"."Reservoirs"
(
    reservoirid bigint NOT NULL DEFAULT nextval('"Aquaponics"."Reservoirs_ReservoirID_seq"'::regclass),
    description character varying COLLATE pg_catalog."default",
    gallons smallint,
    CONSTRAINT "Reservoirs_pkey" PRIMARY KEY (reservoirid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "Aquaponics"."Reservoirs"
    OWNER to moedepi;

------------

CREATE TABLE "Sensor"."SensorReadings"
(
    telemetryid bigint NOT NULL DEFAULT nextval('"Sensor"."SensorReadings_TelemetryID_seq"'::regclass),
    sensorid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    reservoirid bigint NOT NULL,
    "timestamp" abstime NOT NULL,
    measurement character varying(20) COLLATE pg_catalog."default" NOT NULL,
    value numeric(7,3) NOT NULL,
    CONSTRAINT "SensorReadings_pkey" PRIMARY KEY (telemetryid),
    CONSTRAINT "Reservoirs_reservoirID_fkey" FOREIGN KEY (reservoirid)
        REFERENCES "Aquaponics"."Reservoirs" (reservoirid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "SystemSensors_sendorid_fkey" FOREIGN KEY (sensorid)
        REFERENCES "Sensor"."SystemSensors" (sensorid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "Sensor"."SensorReadings"
    OWNER to moedepi;


CREATE INDEX "fki_Reservoirs_reservoirID_fkey"
    ON "Sensor"."SensorReadings" USING btree
    (reservoirid)
    TABLESPACE pg_default;


CREATE INDEX "fki_SystemSensors_sendorid_fkey"
    ON "Sensor"."SensorReadings" USING btree
    (sensorid COLLATE pg_catalog."default")
    TABLESPACE pg_default;

-------------

CREATE TABLE "Sensor"."SystemSensors"
(
    sensorid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    reservoirid bigint NOT NULL,
    description character varying COLLATE pg_catalog."default",
    CONSTRAINT "SystemSensors_pkey" PRIMARY KEY (sensorid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "Sensor"."SystemSensors"
    OWNER to moedepi;


--------------

CREATE TYPE "Sensor".sensor_telemetry AS
(
	sensorid character varying(50),
	measurement character varying(20),
	val numeric(7,3),
	ts character varying(20)
);

ALTER TYPE "Sensor".sensor_telemetry
    OWNER TO moedepi;

-------------

CREATE OR REPLACE FUNCTION "Sensor"."PersistTelemetry"(
	sid character varying,
	measurement character varying,
	val numeric,
	ts character varying)
RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$DECLARE SUCCESS BOOLEAN;
BEGIN
	BEGIN
		SUCCESS = false;
		INSERT INTO
		  "Sensor"."SensorReadings" (
			sensorid,
			reservoirid,
			timestamp,
			measurement,
			value
		  )
		VALUES
		  (
			sid,
			(
			  SELECT
				reservoirid
			  FROM
				"Sensor"."SystemSensors"
			  WHERE
				sensorid = sid
			),
			to_timestamp(ts, 'YYYY/MM/DD hh24:mi:ss'),
			measurement,
			val
		  );
		  SUCCESS = true;
	EXCEPTION WHEN OTHERS THEN
		SUCCESS = false;	  
		RAISE NOTICE 'ErError % %', SQLERRM, SQLSTATE;
	END;

	RETURN SUCCESS;
END; $BODY$;

ALTER FUNCTION "Sensor"."PersistTelemetry"(character varying, character varying, numeric, character varying)
    OWNER TO moedepi;

------------------

CREATE OR REPLACE FUNCTION "Sensor"."PersistTelemetryBatch"(
	batch "Sensor".sensor_telemetry[])
RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$DECLARE SUCCESS INTEGER;
DECLARE tel "Sensor".sensor_telemetry;

BEGIN
	BEGIN
		SUCCESS = 0;
		
		FOREACH tel IN ARRAY batch
	   	LOOP
			INSERT INTO
			  "Sensor"."SensorReadings" (
				sensorid,
				reservoirid,
				timestamp,
				measurement,
				value
			  )
			VALUES
			  (
				tel.sensorid,
				(
				  SELECT
					reservoirid
				  FROM
					"Sensor"."SystemSensors"
				  WHERE
					sensorid = tel.sensorid
				),
				to_timestamp(tel.ts, 'YYYY/MM/DD hh24:mi:ss'),
				tel.measurement,
				tel.val
			  );
			  SUCCESS = SUCCESS + 1;
	   	END LOOP;
		
	EXCEPTION WHEN OTHERS THEN
		SUCCESS = false;	  
		RAISE NOTICE 'ErError % %', SQLERRM, SQLSTATE;
	END;
	
	RETURN SUCCESS;
END; $BODY$;

ALTER FUNCTION "Sensor"."PersistTelemetryBatch"("Sensor".sensor_telemetry[])
    OWNER TO moedepi;

------------


