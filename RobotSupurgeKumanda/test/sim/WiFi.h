#pragma once
#include "Arduino.h"
struct IPAddress { IPAddress() {} IPAddress(uint8_t, uint8_t, uint8_t, uint8_t) {} };
struct WiFiClient {
  int fd = -1;
  int connect(IPAddress, uint16_t port, int32_t);
  void setNoDelay(bool) {}
  void stop();
  size_t write(const uint8_t*, size_t);
  int available();
  uint8_t connected();
  int read(uint8_t*, size_t);
};
enum { WL_CONNECTED = 3 };
enum { WIFI_STA = 1, WIFI_OFF = 0 };
struct WiFiClass {
  void persistent(bool) {}
  bool mode(int) { return true; }
  bool config(IPAddress, IPAddress, IPAddress, IPAddress) { return true; }
  int begin(const char*, const char*, int32_t = 0, const uint8_t* = nullptr, bool = true) { return 0; }
  int status() { return WL_CONNECTED; }
  bool disconnect(bool = false) { return true; }
  int32_t channel() { return 6; }
  uint8_t* BSSID() { static uint8_t b[6]; return b; }
};
extern WiFiClass WiFi;
