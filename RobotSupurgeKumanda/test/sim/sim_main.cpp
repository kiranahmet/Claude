// ESP32 programını bilgisayarda çalıştırır. Buton basışları komut satırından
// "pin@ms" biçiminde verilir (o anda 120 ms basılı tutulur).
// Kullanım: sim <robot_port> <uyandiran_pin|-1> [pin@ms ...]
#include <arpa/inet.h>
#include <netinet/in.h>
#include <poll.h>
#include <stdlib.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <time.h>
#include <unistd.h>

#include <random>
#include <vector>

#include "Arduino.h"
#include "WiFi.h"
#include "esp_sleep.h"

HwSerial Serial;
WiFiClass WiFi;
static int robotPort = 0;
static int uyandiran = -1;
struct Basis { int pin; unsigned long t; };
static std::vector<Basis> basislar;
static int ledDurum[40];

static unsigned long simdi() {
  timespec t; clock_gettime(CLOCK_MONOTONIC, &t);
  return t.tv_sec * 1000UL + t.tv_nsec / 1000000UL;
}
static unsigned long t0 = simdi();
unsigned long millis() { return simdi() - t0; }
void delay(unsigned long ms) { usleep(ms * 1000); }
uint32_t esp_random() { static std::mt19937 r(42); return r(); }
uint32_t analogReadMilliVolts(int) { return 0; }
void configTime(long, int, const char*, const char*) {}
void pinMode(int, int) {}
void digitalWrite(int p, int v) {
  if (ledDurum[p] != v) { ledDurum[p] = v; printf("LED %d=%d @%lu\n", p, v, millis()); }
}
int digitalRead(int p) {
  unsigned long m = millis();
  if (p == uyandiran && m < 120) return HIGH;
  for (auto& b : basislar) if (b.pin == p && m >= b.t && m < b.t + 120) return HIGH;
  return LOW;
}
esp_sleep_wakeup_cause_t esp_sleep_get_wakeup_cause() {
  return uyandiran >= 0 ? ESP_SLEEP_WAKEUP_EXT1 : ESP_SLEEP_WAKEUP_UNDEFINED;
}
uint64_t esp_sleep_get_ext1_wakeup_status() { return uyandiran >= 0 ? 1ULL << uyandiran : 0; }
void esp_deep_sleep_start() { printf("UYKU @%lu\n", millis()); fflush(stdout); exit(0); }

int WiFiClient::connect(IPAddress, uint16_t, int32_t) {
  fd = socket(AF_INET, SOCK_STREAM, 0);
  sockaddr_in a{}; a.sin_family = AF_INET; a.sin_port = htons(robotPort);
  inet_pton(AF_INET, "127.0.0.1", &a.sin_addr);
  return ::connect(fd, (sockaddr*)&a, sizeof(a)) == 0;
}
void WiFiClient::stop() { if (fd >= 0) close(fd); fd = -1; }
size_t WiFiClient::write(const uint8_t* d, size_t n) { return send(fd, d, n, 0); }
int WiFiClient::available() { int n = 0; ioctl(fd, FIONREAD, &n); return n; }
uint8_t WiFiClient::connected() {
  if (fd < 0) return 0;
  char c; ssize_t r = recv(fd, &c, 1, MSG_PEEK | MSG_DONTWAIT);
  return r != 0;
}
int WiFiClient::read(uint8_t* b, size_t n) { return (int)recv(fd, b, n, 0); }

void setup();
void loop();

int main(int argc, char** argv) {
  setvbuf(stdout, nullptr, _IOLBF, 0);
  robotPort = atoi(argv[1]);
  uyandiran = atoi(argv[2]);
  for (int i = 3; i < argc; i++) {
    int p; unsigned long t;
    if (sscanf(argv[i], "%d@%lu", &p, &t) == 2) basislar.push_back({p, t});
  }
  setup();
  for (;;) loop();
}
