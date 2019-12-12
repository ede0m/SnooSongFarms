--
-- PostgreSQL database dump
--

-- Dumped from database version 9.4.24
-- Dumped by pg_dump version 12.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SnooSongFarms; Type: DATABASE; Schema: -; Owner: moedepi
--

CREATE DATABASE "SnooSongFarms" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_GB.UTF-8' LC_CTYPE = 'en_GB.UTF-8';


ALTER DATABASE "SnooSongFarms" OWNER TO "moedepi";

\connect "SnooSongFarms"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Aquaponics; Type: SCHEMA; Schema: -; Owner: moedepi
--

CREATE SCHEMA "Aquaponics";


ALTER SCHEMA "Aquaponics" OWNER TO "moedepi";

--
-- Name: Sensor; Type: SCHEMA; Schema: -; Owner: moedepi
--

CREATE SCHEMA "Sensor";


ALTER SCHEMA "Sensor" OWNER TO "moedepi";

--
-- Name: sensor_telemetry; Type: TYPE; Schema: Sensor; Owner: moedepi
--

CREATE TYPE "Sensor"."sensor_telemetry" AS (
	"sensor_id" character varying(50),
	"measurement" character varying(20),
	"val" numeric(7,3),
	"ts" character varying(20)
);


ALTER TYPE "Sensor"."sensor_telemetry" OWNER TO "moedepi";

--
-- Name: fish_type; Type: TYPE; Schema: public; Owner: moedepi
--

CREATE TYPE "public"."fish_type" AS ENUM (
    'unknown',
    'neon_tetra',
    'amano_shrimp'
);


ALTER TYPE "public"."fish_type" OWNER TO "moedepi";

--
-- Name: PersistTelemetry(character varying, character varying, numeric, character varying); Type: FUNCTION; Schema: Sensor; Owner: moedepi
--

CREATE FUNCTION "Sensor"."PersistTelemetry"("sid" character varying, "measurement" character varying, "val" numeric, "ts" character varying) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$DECLARE SUCCESS BOOLEAN;
BEGIN
	BEGIN
		SUCCESS = false;
		INSERT INTO
		  "Sensor"."SensorReadings" (
			sensor_id,
			reservoir_id,
			timestamp,
			measurement,
			value
		  )
		VALUES
		  (
			sid,
			(
			  SELECT
				reservoir_id
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
END; $$;


ALTER FUNCTION "Sensor"."PersistTelemetry"("sid" character varying, "measurement" character varying, "val" numeric, "ts" character varying) OWNER TO "moedepi";

--
-- Name: PersistTelemetryBatch("Sensor"."sensor_telemetry"[]); Type: FUNCTION; Schema: Sensor; Owner: moedepi
--

CREATE FUNCTION "Sensor"."PersistTelemetryBatch"("batch" "Sensor"."sensor_telemetry"[]) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$DECLARE SUCCESS INTEGER;
DECLARE tel "Sensor".sensor_telemetry;

BEGIN
	BEGIN
		SUCCESS = 0;
		
		FOREACH tel IN ARRAY batch
	   	LOOP
			INSERT INTO
			  "Sensor"."SensorReadings" (
				sensor_id,
				reservoir_id,
				timestamp,
				measurement,
				value
			  )
			VALUES
			  (
				tel.sensor_id,
				(
				  SELECT
					reservoir_id
				  FROM
					"Sensor"."SystemSensors"
				  WHERE
					sensor_id = tel.sensor_id
				),
				to_timestamp(tel.ts, 'YYYY/MM/DD hh24:mi:ss'),
				tel.measurement,
				tel.val
			  );
			  SUCCESS = SUCCESS + 1;
	   	END LOOP;
		
	EXCEPTION WHEN OTHERS THEN	  
		RAISE NOTICE 'ErError % %', SQLERRM, SQLSTATE;
	END;
	
	RETURN SUCCESS;
END; $$;


ALTER FUNCTION "Sensor"."PersistTelemetryBatch"("batch" "Sensor"."sensor_telemetry"[]) OWNER TO "moedepi";

SET default_tablespace = '';

--
-- Name: Fish; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Fish" (
    "fish_id" bigint NOT NULL,
    "tank_id" bigint NOT NULL,
    "description" character varying,
    "size_inch" numeric(4,1),
    "fish_type" "public"."fish_type" DEFAULT 'unknown'::"public"."fish_type" NOT NULL
);


ALTER TABLE "Aquaponics"."Fish" OWNER TO "moedepi";

--
-- Name: FishTanks; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."FishTanks" (
    "tank_id" bigint NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" integer
);


ALTER TABLE "Aquaponics"."FishTanks" OWNER TO "moedepi";

--
-- Name: FishTanks_tankid_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."FishTanks_tankid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."FishTanks_tankid_seq" OWNER TO "moedepi";

--
-- Name: FishTanks_tankid_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."FishTanks_tankid_seq" OWNED BY "Aquaponics"."FishTanks"."tank_id";


--
-- Name: Fish_fish_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."Fish_fish_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."Fish_fish_id_seq" OWNER TO "moedepi";

--
-- Name: Fish_fish_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Fish_fish_id_seq" OWNED BY "Aquaponics"."Fish"."fish_id";


--
-- Name: GrowBeds; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."GrowBeds" (
    "growbed_id" bigint NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" integer
);


ALTER TABLE "Aquaponics"."GrowBeds" OWNER TO "moedepi";

--
-- Name: GrowBed_growbed_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."GrowBed_growbed_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."GrowBed_growbed_id_seq" OWNER TO "moedepi";

--
-- Name: GrowBed_growbed_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."GrowBed_growbed_id_seq" OWNED BY "Aquaponics"."GrowBeds"."growbed_id";


--
-- Name: Reservoirs; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Reservoirs" (
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" smallint
);


ALTER TABLE "Aquaponics"."Reservoirs" OWNER TO "moedepi";

--
-- Name: Reservoirs_ReservoirID_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."Reservoirs_ReservoirID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."Reservoirs_ReservoirID_seq" OWNER TO "moedepi";

--
-- Name: Reservoirs_ReservoirID_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Reservoirs_ReservoirID_seq" OWNED BY "Aquaponics"."Reservoirs"."reservoir_id";


--
-- Name: Substrates; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Substrates" (
    "substrate_id" bigint NOT NULL,
    "tank_id" bigint NOT NULL,
    "description" character varying
);


ALTER TABLE "Aquaponics"."Substrates" OWNER TO "moedepi";

--
-- Name: Substrate_substrate_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."Substrate_substrate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."Substrate_substrate_id_seq" OWNER TO "moedepi";

--
-- Name: Substrate_substrate_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Substrate_substrate_id_seq" OWNED BY "Aquaponics"."Substrates"."substrate_id";


--
-- Name: SensorReadings; Type: TABLE; Schema: Sensor; Owner: moedepi
--

CREATE TABLE "Sensor"."SensorReadings" (
    "telemetry_id" bigint NOT NULL,
    "sensor_id" character varying(50) NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "timestamp" "abstime" NOT NULL,
    "measurement" character varying(20) NOT NULL,
    "value" numeric(7,3) NOT NULL
);


ALTER TABLE "Sensor"."SensorReadings" OWNER TO "moedepi";

--
-- Name: SensorReadings_TelemetryID_seq; Type: SEQUENCE; Schema: Sensor; Owner: moedepi
--

CREATE SEQUENCE "Sensor"."SensorReadings_TelemetryID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Sensor"."SensorReadings_TelemetryID_seq" OWNER TO "moedepi";

--
-- Name: SensorReadings_TelemetryID_seq; Type: SEQUENCE OWNED BY; Schema: Sensor; Owner: moedepi
--

ALTER SEQUENCE "Sensor"."SensorReadings_TelemetryID_seq" OWNED BY "Sensor"."SensorReadings"."telemetry_id";


--
-- Name: SystemSensors; Type: TABLE; Schema: Sensor; Owner: moedepi
--

CREATE TABLE "Sensor"."SystemSensors" (
    "sensor_id" character varying(50) NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying
);


ALTER TABLE "Sensor"."SystemSensors" OWNER TO "moedepi";

--
-- Name: Fish fish_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish" ALTER COLUMN "fish_id" SET DEFAULT "nextval"('"Aquaponics"."Fish_fish_id_seq"'::"regclass");


--
-- Name: FishTanks tank_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks" ALTER COLUMN "tank_id" SET DEFAULT "nextval"('"Aquaponics"."FishTanks_tankid_seq"'::"regclass");


--
-- Name: GrowBeds growbed_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds" ALTER COLUMN "growbed_id" SET DEFAULT "nextval"('"Aquaponics"."GrowBed_growbed_id_seq"'::"regclass");


--
-- Name: Reservoirs reservoir_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Reservoirs" ALTER COLUMN "reservoir_id" SET DEFAULT "nextval"('"Aquaponics"."Reservoirs_ReservoirID_seq"'::"regclass");


--
-- Name: Substrates substrate_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Substrates" ALTER COLUMN "substrate_id" SET DEFAULT "nextval"('"Aquaponics"."Substrate_substrate_id_seq"'::"regclass");


--
-- Name: SensorReadings telemetry_id; Type: DEFAULT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings" ALTER COLUMN "telemetry_id" SET DEFAULT "nextval"('"Sensor"."SensorReadings_TelemetryID_seq"'::"regclass");


--
-- Name: FishTanks FishTanks_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "FishTanks_pkey" PRIMARY KEY ("tank_id");


--
-- Name: Fish Fish_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish"
    ADD CONSTRAINT "Fish_pkey" PRIMARY KEY ("fish_id");


--
-- Name: GrowBeds GrowBed_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds"
    ADD CONSTRAINT "GrowBed_pkey" PRIMARY KEY ("growbed_id");


--
-- Name: Reservoirs Reservoirs_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Reservoirs"
    ADD CONSTRAINT "Reservoirs_pkey" PRIMARY KEY ("reservoir_id");


--
-- Name: SensorReadings SensorReadings_pkey; Type: CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "SensorReadings_pkey" PRIMARY KEY ("telemetry_id");


--
-- Name: SystemSensors SystemSensors_pkey; Type: CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SystemSensors"
    ADD CONSTRAINT "SystemSensors_pkey" PRIMARY KEY ("sensor_id");


--
-- Name: fki_Reservoirs_reservoirID_fkey; Type: INDEX; Schema: Sensor; Owner: moedepi
--

CREATE INDEX "fki_Reservoirs_reservoirID_fkey" ON "Sensor"."SensorReadings" USING "btree" ("reservoir_id");


--
-- Name: fki_SystemSensors_sendorid_fkey; Type: INDEX; Schema: Sensor; Owner: moedepi
--

CREATE INDEX "fki_SystemSensors_sendorid_fkey" ON "Sensor"."SensorReadings" USING "btree" ("sensor_id");


--
-- Name: Substrates FishTanks_tankID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Substrates"
    ADD CONSTRAINT "FishTanks_tankID_fkey" FOREIGN KEY ("tank_id") REFERENCES "Aquaponics"."FishTanks"("tank_id");


--
-- Name: Fish FishTanks_tankID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish"
    ADD CONSTRAINT "FishTanks_tankID_fkey" FOREIGN KEY ("tank_id") REFERENCES "Aquaponics"."FishTanks"("tank_id");


--
-- Name: FishTanks Reservoirs_reservoirid_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "Reservoirs_reservoirid_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id");


--
-- Name: SensorReadings Reservoirs_reservoirID_fkey; Type: FK CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "Reservoirs_reservoirID_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id") NOT VALID;


--
-- Name: SensorReadings SystemSensors_sendorid_fkey; Type: FK CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "SystemSensors_sendorid_fkey" FOREIGN KEY ("sensor_id") REFERENCES "Sensor"."SystemSensors"("sensor_id") NOT VALID;


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;
REVOKE ALL ON SCHEMA "public" FROM "postgres";
GRANT ALL ON SCHEMA "public" TO "postgres";
GRANT ALL ON SCHEMA "public" TO PUBLIC;


--
-- PostgreSQL database dump complete
--

