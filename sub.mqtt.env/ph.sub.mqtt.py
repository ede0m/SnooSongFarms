"""
Python MQTT Subscription client.
propegates ph telemetry
"""

from datetime import datetime
import paho.mqtt.client as mqtt
import config
import json

mqtt_username = config.MQTT_USERNAME
mqtt_password = config.MQTT_PASSWORD
mqtt_topic = config.MQTT_TOPIC
mqtt_broker_ip = config.MQTT_BROKER_IP

client = mqtt.Client()
client.username_pw_set(mqtt_username, mqtt_password)

def on_connect(client, userdata, flags, rc):
    # rc is the error code returned when connecting to the broker
    print("connected to modedpi broker : " + str(rc))
    client.subscribe(mqtt_topic)
    
def on_message(client, userdata, msg):

    try:
        msgStr = msg.payload.decode("utf-8")
        payloadData = msgStr.split(":")
        sensorData = float(payloadData[1])
        sensorId = str(payloadData[0])
    except Exception as e:
        print(e)
    
    telemetry = {}
    telemetry['sensorID'] = sensorId
    telemetry['measurement'] = msg.topic
    telemetry['value'] = sensorData
    telemetry['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print(telemetry)

# Here, we are telling the client which functions are to be run
# on connecting, and on receiving a message
client.on_connect = on_connect
client.on_message = on_message

# Once everything has been set up, we can connect to the broker
# 1883 is the listener port that the MQTT broker is using
client.connect(mqtt_broker_ip, 1883)

# Once we have told the client to connect, let the client object run itself
client.loop_forever()
client.disconnect()
