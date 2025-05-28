#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Maks77";
const char* password = "06051977";

// Server details
const char* serverUrl = "http://192.168.0.107:5000/api/sensors/683220f3f7d3fe003c76184e/data";

// LED pins
const int redPin = 15;    // GPIO15
const int greenPin = 12;  // GPIO12
const int bluePin = 13;   // GPIO13

// Variables for LED state
String currentColor = "";
bool ledState = false;

void setup() {
  Serial.begin(115200);
  
  // Configure LED pins as outputs
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  
  // Turn off all LEDs initially
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void updateLED() {
  // Turn off all LEDs first
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);
  
  if (!ledState) {
    Serial.println("LED state is OFF");
    return; // If LED should be off, we're done
  }
  
  Serial.print("Setting LED to color: ");
  Serial.println(currentColor);
  
  // Turn on appropriate LED based on color
  if (currentColor == "red") {
    digitalWrite(redPin, HIGH);
    Serial.println("RED LED ON");
  } 
  else if (currentColor == "green") {
    digitalWrite(greenPin, HIGH);
    Serial.println("GREEN LED ON");
  } 
  else if (currentColor == "blue") {
    digitalWrite(bluePin, HIGH);
    Serial.println("BLUE LED ON");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read light sensor value
    int lightLevel = analogRead(A0);
    Serial.print("Light level: ");
    Serial.println(lightLevel);
    
    // Create HTTP client
    WiFiClient client;
    HTTPClient http;
    
    // Start HTTP POST request
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON document
    StaticJsonDocument<200> doc;
    doc["lightLevel"] = lightLevel;
    doc["ledColor"] = currentColor;
    doc["state"] = ledState;
    
    // Serialize JSON to string
    String jsonString;
    serializeJson(doc, jsonString);
    Serial.print("Sending JSON: ");
    Serial.println(jsonString);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      
      // Parse response
      StaticJsonDocument<512> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error) {
        // Check if we need to update LED state
        if (responseDoc["data"]["ledColor"]) {
          String newColor = responseDoc["data"]["ledColor"].as<String>();
          bool newState = responseDoc["data"]["state"] | false;
          
          if (newColor != currentColor || newState != ledState) {
            currentColor = newColor;
            ledState = newState;
            updateLED();
          }
        }
      }
    }
    
    http.end();
  }
  
  delay(2000);
} 