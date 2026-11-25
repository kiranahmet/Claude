// Roborock S8 oda kumandası — ESP32 (normal ESP32 / ESP32-WROOM)
//
// Çalışma şekli (pil dostu):
//   1. Kutu derin uykuda bekler (~10-150 µA, karta göre).
//   2. Bir oda butonuna basınca uyanır, Wi-Fi'ye bağlanırken 2.5 sn boyunca
//      başka oda butonlarını da toplar (birden çok oda seçilebilir).
//   3. Robota ev ağı üzerinden doğrudan (bulutsuz) "şu odaları süpür" der.
//   4. LED ile sonucu gösterir ve tekrar uykuya döner.
//
// LED kodları:
//   sürekli yanık          : komut toplanıyor / gönderiliyor
//   2 uzun yanıp sönme     : tamam, robot yola çıktı
//   6 hızlı yanıp sönme    : hata (Wi-Fi ya da robot bağlantısı)
//   3 çok uzun yanıp sönme : pil zayıf
//
// Ayarlar config.h içinde.

#include <WiFi.h>
#include <driver/rtc_io.h>
#include <esp_sleep.h>
#include <sys/time.h>
#include <time.h>

#include "config.h"
#include "roborock_local.h"

static const size_t ODA_SAYISI = sizeof(ODALAR) / sizeof(ODALAR[0]);
static const uint32_t EVE_DON_BIT = 1UL << 31;
static_assert(sizeof(ODALAR) / sizeof(ODALAR[0]) <= 30, "en fazla 30 oda");

// Derin uykuda korunan bilgiler (hızlı yeniden bağlanma için)
RTC_DATA_ATTR static bool rtcWifiGecerli = false;
RTC_DATA_ATTR static uint8_t rtcKanal = 0;
RTC_DATA_ATTR static uint8_t rtcBssid[6] = {0};
RTC_DATA_ATTR static uint8_t rtcSurum = rr::V10;  // robotun konuştuğu protokol

// ---------------------------------------------------------------- Transport

class WifiTransport : public rr::Transport {
 public:
  explicit WifiTransport(IPAddress ip) : ip_(ip) {}
  bool open() override {
    bool ok = client_.connect(ip_, 58867, 3000);
    if (ok) client_.setNoDelay(true);
    return ok;
  }
  void close() override { client_.stop(); }
  bool write(const uint8_t* d, size_t n) override { return client_.write(d, n) == n; }
  int read(uint8_t* buf, size_t cap, uint32_t timeoutMs) override {
    uint32_t bas = ::millis();
    while (!client_.available()) {
      if (!client_.connected()) return -1;
      if (::millis() - bas >= timeoutMs) return 0;
      delay(5);
    }
    int n = client_.read(buf, cap);
    return n < 0 ? -1 : n;
  }
  uint32_t millis() override { return ::millis(); }
  uint32_t random32() override { return esp_random(); }
  uint32_t unixTime() override {
    time_t t = time(nullptr);
    return t > 1600000000 ? (uint32_t)t : 0;
  }

 private:
  IPAddress ip_;
  WiFiClient client_;
};

// ---------------------------------------------------------------------- LED

static void led(bool acik) { digitalWrite(LED_PIN, acik ? LED_AKTIF : !LED_AKTIF); }

static void yanSon(int adet, int acikMs, int kapaliMs) {
  for (int i = 0; i < adet; i++) {
    led(true);
    delay(acikMs);
    led(false);
    delay(kapaliMs);
  }
}

// ------------------------------------------------------------------ Butonlar

static void butonPin(int pin, uint64_t& maske) {
  if (pin < 0) return;
  maske |= 1ULL << pin;
}

static uint64_t tumButonMaskesi() {
  uint64_t m = 0;
  for (size_t i = 0; i < ODA_SAYISI; i++) butonPin(ODALAR[i].pin, m);
  butonPin(EVE_DON_PIN, m);
  return m;
}

// Pin maskesini (GPIO bitleri) seçim bitlerine (oda indeksleri) çevirir
static uint32_t pinlerdenSecim(uint64_t pinMaskesi) {
  uint32_t secim = 0;
  for (size_t i = 0; i < ODA_SAYISI; i++)
    if (pinMaskesi & (1ULL << ODALAR[i].pin)) secim |= 1UL << i;
  if (EVE_DON_PIN >= 0 && (pinMaskesi & (1ULL << EVE_DON_PIN))) secim |= EVE_DON_BIT;
  return secim;
}

static uint64_t basiliPinler() {
  uint64_t m = 0;
  for (size_t i = 0; i < ODA_SAYISI; i++)
    if (digitalRead(ODALAR[i].pin) == HIGH) m |= 1ULL << ODALAR[i].pin;
  if (EVE_DON_PIN >= 0 && digitalRead(EVE_DON_PIN) == HIGH) m |= 1ULL << EVE_DON_PIN;
  return m;
}

static void butonlariHazirla() {
  uint64_t m = tumButonMaskesi();
  for (int p = 0; p < 40; p++) {
    if (!(m & (1ULL << p))) continue;
    rtc_gpio_deinit((gpio_num_t)p);  // uykudan kalan RTC ayarını bırak
    pinMode(p, INPUT_PULLDOWN);
  }
}

// --------------------------------------------------------------------- Uyku

static void uyu() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  led(false);

  // Basılı tutulan buton bırakılana kadar bekle (en fazla 10 sn).
  uint64_t maske = tumButonMaskesi();
  uint32_t bas = millis();
  while ((basiliPinler() & maske) && millis() - bas < 10000) delay(20);
  uint64_t takili = basiliPinler();
  maske &= ~takili;  // hâlâ basılı (arızalı) pin sürekli uyandırmasın

  for (int p = 0; p < 40; p++) {
    if (!(maske & (1ULL << p))) continue;
    rtc_gpio_init((gpio_num_t)p);
    rtc_gpio_set_direction((gpio_num_t)p, RTC_GPIO_MODE_INPUT_ONLY);
    rtc_gpio_pullup_dis((gpio_num_t)p);
    rtc_gpio_pulldown_en((gpio_num_t)p);
  }
  // Dahili pull-down dirençleri uykuda da çalışsın
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_ON);
  if (maske) esp_sleep_enable_ext1_wakeup(maske, ESP_EXT1_WAKEUP_ANY_HIGH);
  Serial.println("Uykuya geciliyor.");
  Serial.flush();
  esp_deep_sleep_start();
}

// --------------------------------------------------------------------- Wi-Fi

static void wifiBaslat(bool hizli) {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
#ifdef KUMANDA_SABIT_IP
  WiFi.config(IPAddress(KUMANDA_IP), IPAddress(AG_GECIDI), IPAddress(ALT_AG),
              IPAddress(DNS_SUNUCU));
#endif
  if (hizli && rtcWifiGecerli)
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, rtcKanal, rtcBssid);
  else
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

// Bağlantı kurulana kadar bekler; hızlı bağlanma tutmazsa normal bağlanır.
static bool wifiBekle(uint32_t baslangic, uint32_t sureMs) {
  bool hizliDenendi = rtcWifiGecerli;
  while (WiFi.status() != WL_CONNECTED) {
    uint32_t gecen = millis() - baslangic;
    if (gecen > sureMs) return false;
    if (hizliDenendi && gecen > 3000) {  // kanal/BSSID değişmiş olabilir
      hizliDenendi = false;
      rtcWifiGecerli = false;
      WiFi.disconnect();
      wifiBaslat(false);
    }
    delay(20);
  }
  rtcKanal = WiFi.channel();
  memcpy(rtcBssid, WiFi.BSSID(), 6);
  rtcWifiGecerli = true;
  return true;
}

static void saatiAyarla() {
  if (time(nullptr) > 1600000000) return;  // RTC saati zaten var
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  uint32_t bas = millis();
  while (time(nullptr) < 1600000000 && millis() - bas < 3000) delay(50);
}

// ------------------------------------------------------------- Robot komutu

static bool yanitBasarili(const char* yanit) {
  return strstr(yanit, "\"result\"") && !strstr(yanit, "\"error\"");
}

static bool robotaGonder(uint32_t secim) {
  // static: ~7 KB tampon setup() yığınına (8 KB) sığmaz
  static WifiTransport tasima{IPAddress(ROBOT_IP)};
  static rr::Client robot(tasima, LOCAL_KEY);

  if (!robot.connect((rr::Version)rtcSurum)) {
    Serial.printf("Robota baglanilamadi: %s\n", robot.lastError());
    return false;
  }
  rtcSurum = robot.version();
  Serial.printf("Robot baglandi (protokol %s)\n", rtcSurum == rr::VL01 ? "L01" : "1.0");

  // Robotun saatini ESP32'ye de al (uyku sırasında kayan saati düzeltir)
  uint32_t rs = robot.deviceTime();
  if (rs > 1600000000) {
    timeval tv = {(time_t)rs, 0};
    settimeofday(&tv, nullptr);
  }

  char yanit[512] = {0};
  bool ok;
  if (secim & EVE_DON_BIT) {
    Serial.println("Komut: istasyona don");
    ok = robot.call("app_charge", "[]", yanit, sizeof(yanit));
  } else {
    char params[200];
    size_t n = snprintf(params, sizeof(params), "[{\"segments\":[");
    bool ilk = true;
    for (size_t i = 0; i < ODA_SAYISI; i++) {
      if (!(secim & (1UL << i))) continue;
      n += snprintf(params + n, sizeof(params) - n, "%s%u", ilk ? "" : ",", ODALAR[i].segment);
      Serial.printf("Oda: %s (segment %u)\n", ODALAR[i].ad, ODALAR[i].segment);
      ilk = false;
    }
    if (TEKRAR_SAYISI > 1)
      snprintf(params + n, sizeof(params) - n, "],\"repeat\":%d}]", TEKRAR_SAYISI);
    else
      snprintf(params + n, sizeof(params) - n, "]}]");

    ok = robot.call("app_segment_clean", params, yanit, sizeof(yanit));
    Serial.printf("Yanit: %s\n", ok ? yanit : robot.lastError());

    if (ok && !yanitBasarili(yanit) && MESGULSE_DURDUR) {
      // Robot başka bir işteyse: durdur ve tekrar dene
      Serial.println("Robot mesgul, mevcut is durduruluyor...");
      robot.call("app_stop", "[]", yanit, sizeof(yanit));
      delay(1500);
      ok = robot.call("app_segment_clean", params, yanit, sizeof(yanit));
    }
  }
  Serial.printf("Son yanit: %s\n", ok ? yanit : robot.lastError());
  robot.close();
  return ok && yanitBasarili(yanit);
}

// --------------------------------------------------------------------- Pil

static bool pilZayif() {
  if (PIL_PIN < 0) return false;
  float v = analogReadMilliVolts(PIL_PIN) * PIL_BOLUCU / 1000.0f;
  Serial.printf("Pil: %.2f V\n", v);
  return v > 0.5f && v < PIL_DUSUK_V;  // 0.5 V altı: ölçüm bağlı değil
}

// -------------------------------------------------------------------- Ana

void setup() {
  uint32_t baslangic = millis();
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  led(false);

  uint32_t secim = 0;
  esp_sleep_wakeup_cause_t neden = esp_sleep_get_wakeup_cause();
  if (neden == ESP_SLEEP_WAKEUP_EXT1) secim = pinlerdenSecim(esp_sleep_get_ext1_wakeup_status());
  butonlariHazirla();
  secim |= pinlerdenSecim(basiliPinler());

  if (secim == 0) {
    // Pil takıldı / reset: "hazırım" de ve uyu
    Serial.println("Robot supurge kumandasi hazir.");
    yanSon(1, 600, 100);
    uyu();
  }

  led(true);
  wifiBaslat(true);

  // Birleştirme penceresi: Wi-Fi bağlanırken ek oda butonlarını topla
  uint64_t onceki = basiliPinler();
  uint32_t sonBasim = millis();
  while (millis() - sonBasim < BIRLESTIRME_MS) {
    uint64_t simdi = basiliPinler();
    uint64_t yeni = simdi & ~onceki;
    if (yeni) {
      secim |= pinlerdenSecim(yeni);
      sonBasim = millis();
      led(false);  // basıldığını göster
      delay(80);
      led(true);
    }
    onceki = simdi;
    delay(15);
  }

  bool ok = false;
  if (!wifiBekle(baslangic, 12000)) {
    Serial.println("Wi-Fi baglanamadi.");
  } else {
    Serial.printf("Wi-Fi tamam (%lu ms)\n", (unsigned long)(millis() - baslangic));
    saatiAyarla();
    ok = robotaGonder(secim);
  }

  led(false);
  delay(250);
  if (ok)
    yanSon(2, 400, 250);
  else
    yanSon(6, 90, 90);

  if (pilZayif()) {
    delay(400);
    yanSon(3, 900, 300);
  }
  uyu();
}

void loop() {}
