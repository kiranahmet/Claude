/*
  RobotDog ESP32 Firmware
  Telefon → ESP32 UDP komut alıcı
  Donanım: ESP32, L298N motor sürücü, 2x DC motor, 2x Servo, WS2812B LED
*/

#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Adafruit_NeoPixel.h>

// ─── WiFi AP Ayarları ───────────────────────────────────────────────
const char* AP_SSID     = "RobotDog";
const char* AP_PASSWORD = "robotdog123";
const int   UDP_PORT    = 4210;

// ─── Motor Pinleri (L298N) ──────────────────────────────────────────
#define MOTOR_L_EN  32   // PWM hız
#define MOTOR_L_IN1 33
#define MOTOR_L_IN2 25

#define MOTOR_R_EN  26   // PWM hız
#define MOTOR_R_IN1 27
#define MOTOR_R_IN2 14

// ─── Servo Pinleri ─────────────────────────────────────────────────
#define SERVO_PAN_PIN  18   // Sağ-Sol
#define SERVO_TILT_PIN 19   // Yukarı-Aşağı

// ─── LED Pinleri (WS2812B - Opsiyonel) ─────────────────────────────
#define LED_PIN    4
#define LED_COUNT  8

// ─── Buzzer (Opsiyonel) ─────────────────────────────────────────────
#define BUZZER_PIN 2

// ─── Ultrasonik Sensör ──────────────────────────────────────────────
#define TRIG_PIN 22
#define ECHO_PIN 23

// ────────────────────────────────────────────────────────────────────

WiFiUDP udp;
Servo servoPan, servoTilt;
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

int currentSpeed = 200;   // 0-255

void setup() {
  Serial.begin(115200);

  // Motor pinleri
  pinMode(MOTOR_L_EN, OUTPUT);
  pinMode(MOTOR_L_IN1, OUTPUT);
  pinMode(MOTOR_L_IN2, OUTPUT);
  pinMode(MOTOR_R_EN, OUTPUT);
  pinMode(MOTOR_R_IN1, OUTPUT);
  pinMode(MOTOR_R_IN2, OUTPUT);

  // Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  servoPan.setPeriodHertz(50);
  servoTilt.setPeriodHertz(50);
  servoPan.attach(SERVO_PAN_PIN, 500, 2400);
  servoTilt.attach(SERVO_TILT_PIN, 500, 2400);
  servoPan.write(90);
  servoTilt.write(90);

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);

  // Ultrasonik
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // LED
  strip.begin();
  strip.show();
  setLed(0, 50, 255);   // Başlangıç: mavi

  // WiFi AP
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.println("AP IP: " + WiFi.softAPIP().toString());
  udp.begin(UDP_PORT);

  bootBeep();
  Serial.println("RobotDog hazır!");
}

void loop() {
  handleUdp();
  checkObstacle();
  delay(10);
}

// ─── UDP komut işleme ───────────────────────────────────────────────
void handleUdp() {
  int pktSize = udp.parsePacket();
  if (pktSize == 0) return;

  char buf[256];
  int len = udp.read(buf, sizeof(buf) - 1);
  buf[len] = '\0';

  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, buf) != DeserializationError::Ok) return;

  const char* cmd = doc["cmd"];
  if (!cmd) return;

  if (strcmp(cmd, "move") == 0) {
    const char* dir = doc["dir"] | "S";
    int spd = doc["spd"] | 200;
    currentSpeed = spd;
    if      (strcmp(dir, "F") == 0) driveForward(spd);
    else if (strcmp(dir, "B") == 0) driveBackward(spd);
    else if (strcmp(dir, "L") == 0) turnLeft(spd);
    else if (strcmp(dir, "R") == 0) turnRight(spd);

  } else if (strcmp(cmd, "stop") == 0) {
    motorStop();

  } else if (strcmp(cmd, "head") == 0) {
    int pan  = doc["pan"]  | 90;
    int tilt = doc["tilt"] | 90;
    servoPan.write(constrain(pan, 30, 150));
    servoTilt.write(constrain(tilt, 45, 135));

  } else if (strcmp(cmd, "led") == 0) {
    int r = doc["r"] | 0;
    int g = doc["g"] | 0;
    int b = doc["b"] | 0;
    setLed(r, g, b);

  } else if (strcmp(cmd, "sound") == 0) {
    playNote(doc["note"] | "C4");

  } else if (strcmp(cmd, "emotion") == 0) {
    const char* type = doc["type"] | "idle";
    playEmotion(type);

  } else if (strcmp(cmd, "sensor") == 0) {
    sendSensorData();

  } else if (strcmp(cmd, "ping") == 0) {
    udp.beginPacket(udp.remoteIP(), udp.remotePort());
    udp.print("{\"pong\":1}");
    udp.endPacket();
  }
}

// ─── Motor fonksiyonları ─────────────────────────────────────────────
void setMotor(int enPin, int in1, int in2, bool fwd, int spd) {
  analogWrite(enPin, spd);
  digitalWrite(in1, fwd ? HIGH : LOW);
  digitalWrite(in2, fwd ? LOW  : HIGH);
}

void driveForward(int spd) {
  setMotor(MOTOR_L_EN, MOTOR_L_IN1, MOTOR_L_IN2, true, spd);
  setMotor(MOTOR_R_EN, MOTOR_R_IN1, MOTOR_R_IN2, true, spd);
  setLed(0, 200, 0);
}

void driveBackward(int spd) {
  setMotor(MOTOR_L_EN, MOTOR_L_IN1, MOTOR_L_IN2, false, spd);
  setMotor(MOTOR_R_EN, MOTOR_R_IN1, MOTOR_R_IN2, false, spd);
  setLed(200, 100, 0);
}

void turnLeft(int spd) {
  setMotor(MOTOR_L_EN, MOTOR_L_IN1, MOTOR_L_IN2, false, spd / 2);
  setMotor(MOTOR_R_EN, MOTOR_R_IN1, MOTOR_R_IN2, true,  spd);
}

void turnRight(int spd) {
  setMotor(MOTOR_L_EN, MOTOR_L_IN1, MOTOR_L_IN2, true,  spd);
  setMotor(MOTOR_R_EN, MOTOR_R_IN1, MOTOR_R_IN2, false, spd / 2);
}

void motorStop() {
  analogWrite(MOTOR_L_EN, 0);
  analogWrite(MOTOR_R_EN, 0);
  setLed(0, 50, 255);
}

// ─── LED ─────────────────────────────────────────────────────────────
void setLed(int r, int g, int b) {
  for (int i = 0; i < LED_COUNT; i++)
    strip.setPixelColor(i, strip.Color(r, g, b));
  strip.show();
}

void ledPulse(int r, int g, int b, int times) {
  for (int t = 0; t < times; t++) {
    for (int br = 0; br <= 255; br += 15) {
      strip.setBrightness(br);
      setLed(r, g, b);
      delay(20);
    }
    for (int br = 255; br >= 0; br -= 15) {
      strip.setBrightness(br);
      setLed(r, g, b);
      delay(20);
    }
  }
  strip.setBrightness(255);
}

// ─── Duygu efektleri ─────────────────────────────────────────────────
void playEmotion(const char* type) {
  if (strcmp(type, "happy") == 0) {
    ledPulse(0, 255, 100, 2);
    tone(BUZZER_PIN, 880, 100); delay(150);
    tone(BUZZER_PIN, 1046, 150); delay(200);
    noTone(BUZZER_PIN);

  } else if (strcmp(type, "speak") == 0) {
    setLed(255, 200, 0);

  } else if (strcmp(type, "dance") == 0) {
    for (int i = 0; i < 3; i++) {
      turnLeft(180); delay(300);
      turnRight(180); delay(300);
    }
    motorStop();
    ledPulse(255, 0, 200, 3);

  } else if (strcmp(type, "angry") == 0) {
    setLed(255, 0, 0);
    tone(BUZZER_PIN, 220, 500);
    delay(600); noTone(BUZZER_PIN);
  }
}

// ─── Buzzer nota ─────────────────────────────────────────────────────
void playNote(const char* note) {
  int freq = 440;
  if      (strcmp(note, "C4") == 0) freq = 262;
  else if (strcmp(note, "D4") == 0) freq = 294;
  else if (strcmp(note, "E4") == 0) freq = 330;
  else if (strcmp(note, "G4") == 0) freq = 392;
  else if (strcmp(note, "A4") == 0) freq = 440;
  tone(BUZZER_PIN, freq, 200);
  delay(250); noTone(BUZZER_PIN);
}

void bootBeep() {
  int melody[] = {523, 659, 784, 1047};
  for (int n : melody) { tone(BUZZER_PIN, n, 100); delay(120); }
  noTone(BUZZER_PIN);
}

// ─── Ultrasonik sensör ───────────────────────────────────────────────
void checkObstacle() {
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck < 200) return;
  lastCheck = millis();

  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long dur = pulseIn(ECHO_PIN, HIGH, 30000);
  int distCm = dur * 0.034 / 2;

  if (distCm > 0 && distCm < 15) {
    motorStop();
    setLed(255, 0, 0);
    Serial.println("ENGEL: " + String(distCm) + "cm");
  }
}

void sendSensorData() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long dur = pulseIn(ECHO_PIN, HIGH, 30000);
  int dist = dur * 0.034 / 2;

  String json = "{\"dist\":" + String(dist) + "}";
  udp.beginPacket(udp.remoteIP(), udp.remotePort());
  udp.print(json);
  udp.endPacket();
}
