--
-- PostgreSQL database dump
--

-- Dumped from database version 9.4.24
-- Dumped by pg_dump version 12.0

-- Started on 2019-12-14 14:03:41 CST

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
-- TOC entry 8 (class 2615 OID 16392)
-- Name: Aquaponics; Type: SCHEMA; Schema: -; Owner: moedepi
--

CREATE SCHEMA "Aquaponics";


ALTER SCHEMA "Aquaponics" OWNER TO "moedepi";

--
-- TOC entry 9 (class 2615 OID 16386)
-- Name: Sensor; Type: SCHEMA; Schema: -; Owner: moedepi
--

CREATE SCHEMA "Sensor";


ALTER SCHEMA "Sensor" OWNER TO "moedepi";

--
-- TOC entry 566 (class 1247 OID 16509)
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
-- TOC entry 585 (class 1247 OID 16572)
-- Name: fish_type; Type: TYPE; Schema: public; Owner: moedepi
--

CREATE TYPE "public"."fish_type" AS ENUM (
    'unknown',
    'neon_tetra',
    'amano_shrimp'
);


ALTER TYPE "public"."fish_type" OWNER TO "moedepi";

--
-- TOC entry 211 (class 1255 OID 16644)
-- Name: LogFishTransfer(); Type: FUNCTION; Schema: Aquaponics; Owner: moedepi
--

CREATE FUNCTION "Aquaponics"."LogFishTransfer"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$   
BEGIN   
  	INSERT INTO "Aquaponics"."FishTransfer" VALUES (new.tank_id, new.fish_id, current_timestamp);
      RETURN NEW;
END;
$$;


ALTER FUNCTION "Aquaponics"."LogFishTransfer"() OWNER TO "moedepi";

--
-- TOC entry 212 (class 1255 OID 16689)
-- Name: LogLightTransferGrowbed(); Type: FUNCTION; Schema: Aquaponics; Owner: moedepi
--

CREATE FUNCTION "Aquaponics"."LogLightTransferGrowbed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN   
  	INSERT INTO "Aquaponics"."LightTransfer" VALUES (NULL, new.growbed_id, new.light_id, current_timestamp);
      RETURN NEW;
END;$$;


ALTER FUNCTION "Aquaponics"."LogLightTransferGrowbed"() OWNER TO "moedepi";

--
-- TOC entry 213 (class 1255 OID 16690)
-- Name: LogLightTransferTank(); Type: FUNCTION; Schema: Aquaponics; Owner: moedepi
--

CREATE FUNCTION "Aquaponics"."LogLightTransferTank"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN   
  	INSERT INTO "Aquaponics"."LightTransfer" VALUES (new.tank_id, NULL, new.light_id, current_timestamp);
      RETURN NEW;
END;$$;


ALTER FUNCTION "Aquaponics"."LogLightTransferTank"() OWNER TO "moedepi";

--
-- TOC entry 209 (class 1255 OID 16506)
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
-- TOC entry 210 (class 1255 OID 16512)
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
-- TOC entry 188 (class 1259 OID 16557)
-- Name: Fish; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Fish" (
    "fish_id" bigint NOT NULL,
    "tank_id" bigint NOT NULL,
    "description" character varying,
    "size_inch" numeric(4,1),
    "fish_type" "public"."fish_type" DEFAULT 'unknown'::"public"."fish_type" NOT NULL,
    "death" "abstime"
);


ALTER TABLE "Aquaponics"."Fish" OWNER TO "moedepi";

--
-- TOC entry 182 (class 1259 OID 16515)
-- Name: FishTanks; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."FishTanks" (
    "tank_id" bigint NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" integer,
    "light_id" bigint,
    "substrate_id" bigint
);


ALTER TABLE "Aquaponics"."FishTanks" OWNER TO "moedepi";

--
-- TOC entry 181 (class 1259 OID 16513)
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
-- TOC entry 2131 (class 0 OID 0)
-- Dependencies: 181
-- Name: FishTanks_tankid_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."FishTanks_tankid_seq" OWNED BY "Aquaponics"."FishTanks"."tank_id";


--
-- TOC entry 193 (class 1259 OID 16629)
-- Name: FishTransfer; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."FishTransfer" (
    "tank_id" bigint NOT NULL,
    "fish_id" bigint NOT NULL,
    "ts" "abstime" NOT NULL
);


ALTER TABLE "Aquaponics"."FishTransfer" OWNER TO "moedepi";

--
-- TOC entry 187 (class 1259 OID 16555)
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
-- TOC entry 2132 (class 0 OID 0)
-- Dependencies: 187
-- Name: Fish_fish_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Fish_fish_id_seq" OWNED BY "Aquaponics"."Fish"."fish_id";


--
-- TOC entry 184 (class 1259 OID 16531)
-- Name: GrowBeds; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."GrowBeds" (
    "growbed_id" bigint NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" integer,
    "light_id" bigint,
    "substrate_id" bigint
);


ALTER TABLE "Aquaponics"."GrowBeds" OWNER TO "moedepi";

--
-- TOC entry 183 (class 1259 OID 16529)
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
-- TOC entry 2133 (class 0 OID 0)
-- Dependencies: 183
-- Name: GrowBed_growbed_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."GrowBed_growbed_id_seq" OWNED BY "Aquaponics"."GrowBeds"."growbed_id";


--
-- TOC entry 190 (class 1259 OID 16603)
-- Name: GrowCycle; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."GrowCycle" (
    "grow_cycle_id" bigint NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "start_cycle" "abstime" NOT NULL,
    "end_cycle" "abstime",
    "description" character varying
);


ALTER TABLE "Aquaponics"."GrowCycle" OWNER TO "moedepi";

--
-- TOC entry 189 (class 1259 OID 16601)
-- Name: GrowCycle_grow_cycle_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."GrowCycle_grow_cycle_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."GrowCycle_grow_cycle_id_seq" OWNER TO "moedepi";

--
-- TOC entry 2134 (class 0 OID 0)
-- Dependencies: 189
-- Name: GrowCycle_grow_cycle_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."GrowCycle_grow_cycle_id_seq" OWNED BY "Aquaponics"."GrowCycle"."grow_cycle_id";


--
-- TOC entry 196 (class 1259 OID 16686)
-- Name: LightTransfer; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."LightTransfer" (
    "tank_id" bigint,
    "growbed_id" bigint,
    "light_id" bigint,
    "ts" "abstime" NOT NULL
);


ALTER TABLE "Aquaponics"."LightTransfer" OWNER TO "moedepi";

--
-- TOC entry 195 (class 1259 OID 16649)
-- Name: Lights; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Lights" (
    "light_id" bigint NOT NULL,
    "description" character varying,
    "spectrum_k" integer,
    "lumens" integer,
    "watts" integer
);


ALTER TABLE "Aquaponics"."Lights" OWNER TO "moedepi";

--
-- TOC entry 194 (class 1259 OID 16647)
-- Name: Lights_light_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."Lights_light_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."Lights_light_id_seq" OWNER TO "moedepi";

--
-- TOC entry 2135 (class 0 OID 0)
-- Dependencies: 194
-- Name: Lights_light_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Lights_light_id_seq" OWNED BY "Aquaponics"."Lights"."light_id";


--
-- TOC entry 192 (class 1259 OID 16619)
-- Name: Plants; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Plants" (
    "plant_id" bigint NOT NULL,
    "grow_cycle_id" bigint NOT NULL,
    "description" character varying,
    "start_plant" "abstime" NOT NULL,
    "end_germination" "abstime",
    "end_life" "abstime",
    "harvested" boolean DEFAULT false NOT NULL,
    "yield_lbs" numeric(5,3),
    "max_height_inch" numeric(5,3)
);


ALTER TABLE "Aquaponics"."Plants" OWNER TO "moedepi";

--
-- TOC entry 191 (class 1259 OID 16617)
-- Name: Plants_plant_id_seq; Type: SEQUENCE; Schema: Aquaponics; Owner: moedepi
--

CREATE SEQUENCE "Aquaponics"."Plants_plant_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Aquaponics"."Plants_plant_id_seq" OWNER TO "moedepi";

--
-- TOC entry 2136 (class 0 OID 0)
-- Dependencies: 191
-- Name: Plants_plant_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Plants_plant_id_seq" OWNED BY "Aquaponics"."Plants"."plant_id";


--
-- TOC entry 177 (class 1259 OID 16411)
-- Name: Reservoirs; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Reservoirs" (
    "reservoir_id" bigint NOT NULL,
    "description" character varying,
    "gallons" smallint
);


ALTER TABLE "Aquaponics"."Reservoirs" OWNER TO "moedepi";

--
-- TOC entry 176 (class 1259 OID 16409)
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
-- TOC entry 2137 (class 0 OID 0)
-- Dependencies: 176
-- Name: Reservoirs_ReservoirID_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Reservoirs_ReservoirID_seq" OWNED BY "Aquaponics"."Reservoirs"."reservoir_id";


--
-- TOC entry 186 (class 1259 OID 16542)
-- Name: Substrates; Type: TABLE; Schema: Aquaponics; Owner: moedepi
--

CREATE TABLE "Aquaponics"."Substrates" (
    "substrate_id" bigint NOT NULL,
    "description" character varying
);


ALTER TABLE "Aquaponics"."Substrates" OWNER TO "moedepi";

--
-- TOC entry 185 (class 1259 OID 16540)
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
-- TOC entry 2138 (class 0 OID 0)
-- Dependencies: 185
-- Name: Substrate_substrate_id_seq; Type: SEQUENCE OWNED BY; Schema: Aquaponics; Owner: moedepi
--

ALTER SEQUENCE "Aquaponics"."Substrate_substrate_id_seq" OWNED BY "Aquaponics"."Substrates"."substrate_id";


--
-- TOC entry 179 (class 1259 OID 16422)
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
-- TOC entry 178 (class 1259 OID 16420)
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
-- TOC entry 2139 (class 0 OID 0)
-- Dependencies: 178
-- Name: SensorReadings_TelemetryID_seq; Type: SEQUENCE OWNED BY; Schema: Sensor; Owner: moedepi
--

ALTER SEQUENCE "Sensor"."SensorReadings_TelemetryID_seq" OWNED BY "Sensor"."SensorReadings"."telemetry_id";


--
-- TOC entry 175 (class 1259 OID 16401)
-- Name: SystemSensors; Type: TABLE; Schema: Sensor; Owner: moedepi
--

CREATE TABLE "Sensor"."SystemSensors" (
    "sensor_id" character varying(50) NOT NULL,
    "reservoir_id" bigint NOT NULL,
    "description" character varying
);


ALTER TABLE "Sensor"."SystemSensors" OWNER TO "moedepi";

--
-- TOC entry 1973 (class 2604 OID 16560)
-- Name: Fish fish_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish" ALTER COLUMN "fish_id" SET DEFAULT "nextval"('"Aquaponics"."Fish_fish_id_seq"'::"regclass");


--
-- TOC entry 1970 (class 2604 OID 16518)
-- Name: FishTanks tank_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks" ALTER COLUMN "tank_id" SET DEFAULT "nextval"('"Aquaponics"."FishTanks_tankid_seq"'::"regclass");


--
-- TOC entry 1971 (class 2604 OID 16534)
-- Name: GrowBeds growbed_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds" ALTER COLUMN "growbed_id" SET DEFAULT "nextval"('"Aquaponics"."GrowBed_growbed_id_seq"'::"regclass");


--
-- TOC entry 1975 (class 2604 OID 16606)
-- Name: GrowCycle grow_cycle_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowCycle" ALTER COLUMN "grow_cycle_id" SET DEFAULT "nextval"('"Aquaponics"."GrowCycle_grow_cycle_id_seq"'::"regclass");


--
-- TOC entry 1978 (class 2604 OID 16652)
-- Name: Lights light_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Lights" ALTER COLUMN "light_id" SET DEFAULT "nextval"('"Aquaponics"."Lights_light_id_seq"'::"regclass");


--
-- TOC entry 1976 (class 2604 OID 16622)
-- Name: Plants plant_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Plants" ALTER COLUMN "plant_id" SET DEFAULT "nextval"('"Aquaponics"."Plants_plant_id_seq"'::"regclass");


--
-- TOC entry 1968 (class 2604 OID 16414)
-- Name: Reservoirs reservoir_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Reservoirs" ALTER COLUMN "reservoir_id" SET DEFAULT "nextval"('"Aquaponics"."Reservoirs_ReservoirID_seq"'::"regclass");


--
-- TOC entry 1972 (class 2604 OID 16545)
-- Name: Substrates substrate_id; Type: DEFAULT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Substrates" ALTER COLUMN "substrate_id" SET DEFAULT "nextval"('"Aquaponics"."Substrate_substrate_id_seq"'::"regclass");


--
-- TOC entry 1969 (class 2604 OID 16425)
-- Name: SensorReadings telemetry_id; Type: DEFAULT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings" ALTER COLUMN "telemetry_id" SET DEFAULT "nextval"('"Sensor"."SensorReadings_TelemetryID_seq"'::"regclass");


--
-- TOC entry 1988 (class 2606 OID 16520)
-- Name: FishTanks FishTanks_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "FishTanks_pkey" PRIMARY KEY ("tank_id");


--
-- TOC entry 1994 (class 2606 OID 16565)
-- Name: Fish Fish_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish"
    ADD CONSTRAINT "Fish_pkey" PRIMARY KEY ("fish_id");


--
-- TOC entry 1990 (class 2606 OID 16539)
-- Name: GrowBeds GrowBed_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds"
    ADD CONSTRAINT "GrowBed_pkey" PRIMARY KEY ("growbed_id");


--
-- TOC entry 1996 (class 2606 OID 16611)
-- Name: GrowCycle GrowCycle_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowCycle"
    ADD CONSTRAINT "GrowCycle_pkey" PRIMARY KEY ("grow_cycle_id");


--
-- TOC entry 2000 (class 2606 OID 16657)
-- Name: Lights Lights_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Lights"
    ADD CONSTRAINT "Lights_pkey" PRIMARY KEY ("light_id");


--
-- TOC entry 1998 (class 2606 OID 16628)
-- Name: Plants Plants_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Plants"
    ADD CONSTRAINT "Plants_pkey" PRIMARY KEY ("plant_id");


--
-- TOC entry 1982 (class 2606 OID 16419)
-- Name: Reservoirs Reservoirs_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Reservoirs"
    ADD CONSTRAINT "Reservoirs_pkey" PRIMARY KEY ("reservoir_id");


--
-- TOC entry 1992 (class 2606 OID 16675)
-- Name: Substrates Substrates_pkey; Type: CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Substrates"
    ADD CONSTRAINT "Substrates_pkey" PRIMARY KEY ("substrate_id");


--
-- TOC entry 1984 (class 2606 OID 16469)
-- Name: SensorReadings SensorReadings_pkey; Type: CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "SensorReadings_pkey" PRIMARY KEY ("telemetry_id");


--
-- TOC entry 1980 (class 2606 OID 16408)
-- Name: SystemSensors SystemSensors_pkey; Type: CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SystemSensors"
    ADD CONSTRAINT "SystemSensors_pkey" PRIMARY KEY ("sensor_id");


--
-- TOC entry 1985 (class 1259 OID 16486)
-- Name: fki_Reservoirs_reservoirID_fkey; Type: INDEX; Schema: Sensor; Owner: moedepi
--

CREATE INDEX "fki_Reservoirs_reservoirID_fkey" ON "Sensor"."SensorReadings" USING "btree" ("reservoir_id");


--
-- TOC entry 1986 (class 1259 OID 16480)
-- Name: fki_SystemSensors_sendorid_fkey; Type: INDEX; Schema: Sensor; Owner: moedepi
--

CREATE INDEX "fki_SystemSensors_sendorid_fkey" ON "Sensor"."SensorReadings" USING "btree" ("sensor_id");


--
-- TOC entry 2015 (class 2620 OID 16646)
-- Name: Fish FishTransferTrigger; Type: TRIGGER; Schema: Aquaponics; Owner: moedepi
--

CREATE TRIGGER "FishTransferTrigger" AFTER INSERT OR UPDATE OF "tank_id" ON "Aquaponics"."Fish" FOR EACH ROW EXECUTE PROCEDURE "Aquaponics"."LogFishTransfer"();


--
-- TOC entry 2014 (class 2620 OID 16692)
-- Name: GrowBeds GrowbedLightTransferTrigger; Type: TRIGGER; Schema: Aquaponics; Owner: moedepi
--

CREATE TRIGGER "GrowbedLightTransferTrigger" AFTER UPDATE OF "light_id" ON "Aquaponics"."GrowBeds" FOR EACH ROW EXECUTE PROCEDURE "Aquaponics"."LogLightTransferGrowbed"();


--
-- TOC entry 2013 (class 2620 OID 16691)
-- Name: FishTanks TankLightTransferTrigger; Type: TRIGGER; Schema: Aquaponics; Owner: moedepi
--

CREATE TRIGGER "TankLightTransferTrigger" AFTER UPDATE OF "light_id" ON "Aquaponics"."FishTanks" FOR EACH ROW EXECUTE PROCEDURE "Aquaponics"."LogLightTransferTank"();


--
-- TOC entry 2009 (class 2606 OID 16566)
-- Name: Fish FishTanks_tankID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."Fish"
    ADD CONSTRAINT "FishTanks_tankID_fkey" FOREIGN KEY ("tank_id") REFERENCES "Aquaponics"."FishTanks"("tank_id");


--
-- TOC entry 2011 (class 2606 OID 16632)
-- Name: FishTransfer FishTanks_tankID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTransfer"
    ADD CONSTRAINT "FishTanks_tankID_fkey" FOREIGN KEY ("tank_id") REFERENCES "Aquaponics"."FishTanks"("tank_id");


--
-- TOC entry 2012 (class 2606 OID 16637)
-- Name: FishTransfer Fish_fishID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTransfer"
    ADD CONSTRAINT "Fish_fishID_fkey" FOREIGN KEY ("fish_id") REFERENCES "Aquaponics"."Fish"("fish_id");


--
-- TOC entry 2004 (class 2606 OID 16659)
-- Name: FishTanks Lights_lightID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "Lights_lightID_fkey" FOREIGN KEY ("light_id") REFERENCES "Aquaponics"."Lights"("light_id") NOT VALID;


--
-- TOC entry 2007 (class 2606 OID 16664)
-- Name: GrowBeds Lights_lightID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds"
    ADD CONSTRAINT "Lights_lightID_fkey" FOREIGN KEY ("light_id") REFERENCES "Aquaponics"."Lights"("light_id") NOT VALID;


--
-- TOC entry 2010 (class 2606 OID 16612)
-- Name: GrowCycle Reservoirs_ReservoirID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowCycle"
    ADD CONSTRAINT "Reservoirs_ReservoirID_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id");


--
-- TOC entry 2008 (class 2606 OID 16669)
-- Name: GrowBeds Reservoirs_reservoirID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds"
    ADD CONSTRAINT "Reservoirs_reservoirID_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id") NOT VALID;


--
-- TOC entry 2003 (class 2606 OID 16521)
-- Name: FishTanks Reservoirs_reservoirid_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "Reservoirs_reservoirid_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id");


--
-- TOC entry 2006 (class 2606 OID 16676)
-- Name: GrowBeds Substrates_substrateID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."GrowBeds"
    ADD CONSTRAINT "Substrates_substrateID_fkey" FOREIGN KEY ("substrate_id") REFERENCES "Aquaponics"."Substrates"("substrate_id") NOT VALID;


--
-- TOC entry 2005 (class 2606 OID 16681)
-- Name: FishTanks Substrates_substrateID_fkey; Type: FK CONSTRAINT; Schema: Aquaponics; Owner: moedepi
--

ALTER TABLE ONLY "Aquaponics"."FishTanks"
    ADD CONSTRAINT "Substrates_substrateID_fkey" FOREIGN KEY ("substrate_id") REFERENCES "Aquaponics"."Substrates"("substrate_id") NOT VALID;


--
-- TOC entry 2002 (class 2606 OID 16481)
-- Name: SensorReadings Reservoirs_reservoirID_fkey; Type: FK CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "Reservoirs_reservoirID_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "Aquaponics"."Reservoirs"("reservoir_id") NOT VALID;


--
-- TOC entry 2001 (class 2606 OID 16475)
-- Name: SensorReadings SystemSensors_sendorid_fkey; Type: FK CONSTRAINT; Schema: Sensor; Owner: moedepi
--

ALTER TABLE ONLY "Sensor"."SensorReadings"
    ADD CONSTRAINT "SystemSensors_sendorid_fkey" FOREIGN KEY ("sensor_id") REFERENCES "Sensor"."SystemSensors"("sensor_id") NOT VALID;


--
-- TOC entry 2130 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;
REVOKE ALL ON SCHEMA "public" FROM "postgres";
GRANT ALL ON SCHEMA "public" TO "postgres";
GRANT ALL ON SCHEMA "public" TO PUBLIC;


-- Completed on 2019-12-14 14:03:42 CST

--
-- PostgreSQL database dump complete
--

