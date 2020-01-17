/*
 * ESP8266 NodeMCU Mosquitto ADS/MQTT-Publish 
 * for WaterQuality Data Streaming
 * https://www.instructables.com/id/How-to-Use-MQTT-With-the-Raspberry-Pi-and-ESP8266/
 * 
 */

#include <Wire.h>
#include <Adafruit_ADS1015.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h> // Enables the ESP8266 to connect to the local network (via WiFi)
#include <PubSubClient.h> // Allows us to connect to, and publish to the MQTT broker

Adafruit_ADS1115 ads;

const char* ssid = "";
const char* wifi_password = "";

const char* mqtt_server = "";
const char* mqtt_topic = "ph";
const char* mqtt_username = "moedepi";
const char* mqtt_password = "";
const char clientID[] = "phSensorA.haoshiAnalogPh:";

// PH sampling 
int16_t adc0;
float volts;
float ph;
char phData[10];
const int n_samples = 10;
float ph_sum;
float ph_avg;
int sample_count;
char payload[sizeof(clientID) + sizeof(phData)];

// Initialise the WiFi and MQTT Client objects
WiFiClient wifiClient;
PubSubClient client(mqtt_server, 1883, wifiClient); // 1883 is the listener port for the Broker

void setup() {
  
  sample_count = 0;
  ph_sum = 0;

  pinMode(LED_BUILTIN, OUTPUT);

  // ads
  Wire.begin(D2, D1);

  // This is just for debugging purposes
  Serial.begin(115200);
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, wifi_password);

  // Wait until the connection has been confirmed before continuing
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Debugging - Output the IP Address of the ESP8266
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // client.connect returns a boolean value to let us know if the connection was successful.
  if (client.connect(clientID, mqtt_username, mqtt_password)) {
    Serial.println("Connected to MQTT Broker!");
  }
  else {
    Serial.println("Connection to MQTT Broker failed...");
  }
    
  // The ADC input range (or gain) can be changed via the following
  // functions, but be careful never to exceed VDD +0.3V max, or to
  // exceed the upper and lower limits if you adjust the input range!
  // Setting these values incorrectly may destroy your ADC!
  //                                                                ADS1015  ADS1115
  //                                                                -------  -------
  // ads.setGain(GAIN_TWOTHIRDS);  // 2/3x gain +/- 6.144V  1 bit = 3mV      0.1875mV (default)
  // ads.setGain(GAIN_ONE);        // 1x gain   +/- 4.096V  1 bit = 2mV      0.125mV
  // ads.setGain(GAIN_TWO);        // 2x gain   +/- 2.048V  1 bit = 1mV      0.0625mV
  // ads.setGain(GAIN_FOUR);       // 4x gain   +/- 1.024V  1 bit = 0.5mV    0.03125mV
  // ads.setGain(GAIN_EIGHT);      // 8x gain   +/- 0.512V  1 bit = 0.25mV   0.015625mV
  // ads.setGain(GAIN_SIXTEEN);    // 16x gain  +/- 0.256V  1 bit = 0.125mV  0.0078125mV
  ads.begin();
}

void loop() {
  
  adc0 = ads.readADC_SingleEnded(0);
  volts = adc0 * 0.1875 / 1000; // 0.1875 is the default multiplier for ADS1115
  ph = 3.5 * volts;
  ph_sum += ph;
  sample_count++;
  delay(100);

  if (sample_count >= n_samples){
    // smooth average 
    ph_avg = ph_sum/(double)sample_count;
    sample_count = 0.0;
    ph_sum = 0.0;

    sprintf(phData, "%4.2f", ph_avg);
    strcat(payload, clientID);
    strcat(payload, phData);

    // PUBLISH to the MQTT Broker (topic = mqtt_topic, defined at the beginning)
    if (client.publish(mqtt_topic, payload)) {

      // clear buffers
      memset(payload, 0, sizeof(payload));
      memset(phData, 0, sizeof(phData));
  
      // light on
      digitalWrite(LED_BUILTIN, LOW);
      delay(100);
      // light flicker for send data
      digitalWrite(LED_BUILTIN, HIGH);
      delay(100);
      digitalWrite(LED_BUILTIN, LOW);
      delay(100);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(8700);
    }
    // client.publish will return a boolean value depending on whether it succeded or not.
    // If the message failed to send, we will try again, as the connection may have broken.
    else {
      Serial.println("Message failed to send. Reconnecting to MQTT Broker and trying again");
      client.connect(clientID, mqtt_username, mqtt_password);
      delay(1000); // This delay ensures that client.publish doesn't clash with the client.connect call
      client.publish(mqtt_topic, payload);
    }
  }
}
