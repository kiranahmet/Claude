// Roborock S8 oda kumandası — ESP32 (normal ESP32 DevKit / ESP32-WROOM)
//
// Kullanım:
//   1. Oda butonlarına bas: oda seçilir, üstündeki LED yanar.
//      Aynı butona tekrar basarsan seçim kalkar, LED söner.
//   2. BAŞLAT'a bas: robot seçili odaları süpürmeye gider.
//   3. EVE DÖN: robot ne yapıyorsa bırakır, istasyona döner.
//
// Pil modunda kutu boştayken derin uykudadır; herhangi bir butona basınca
// uyanır. 30 sn hiçbir şeye basılmazsa seçim silinir ve tekrar uyur.
// Adaptör modunda (config.h: ADAPTOR_MODU 1) hiç uyumaz, hep hazırdır.
//
// LED kodları:
//   seçili odaların LED'leri yanıp sönüyor : komut gönderiliyor
//   seçili odalar 2 kez yavaş yanıp söner  : tamam, robot yola çıktı
//   tüm LED'ler 6 kez hızlı yanıp söner    : hata (Wi-Fi ya da robot)
//   tüm LED'ler 2 kez kısa yanıp söner     : oda seçmeden Başlat'a basıldı
//   tüm LED'ler 3 kez çok uzun yanar       : pil zayıf
//   pil takılınca tüm LED'ler sırayla yanar: kumanda hazır
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
static_assert(sizeof(ODALAR) / sizeof(ODALAR[0]) <= 30, "en fazla 30 oda");

// Derin uykuda korunan bilgiler (hızlı yeniden bağlanma için)
RTC_DATA_ATTR static bool rtcWifiGecerli = false;
RTC_DATA_ATTR static uint8_t rtcKanal = 0;
RTC_DATA_ATTR static uint8_t rtcBssid[6] = {0};
RTC_DATA_ATTR static uint8_t rtcSurum = rr::V10;  // robotun konuştuğu protokol

static uint32_t secim = 0;        // bit i = ODALAR[i] seçili
static uint32_t sonEtkinlik = 0;  // son buton basımı (ms)
static uint64_t oncekiPinler = 0;
static uint32_t kilit[40] = {0};  // buton sıçrama (debounce) kilidi

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

// --------------------------------------------------------------------- LED'ler

static void durumLed(bool acik) {
  if (DURUM_LED_PIN >= 0) digitalWrite(DURUM_LED_PIN, acik ? HIGH : LOW);
}

// maske: hangi odaların LED'i yansın
static void ledleriGoster(uint32_t maske) {
  for (size_t i = 0; i < ODA_SAYISI; i++)
    digitalWrite(ODALAR[i].ledPin, (maske & (1UL << i)) ? HIGH : LOW);
}

static uint32_t tumOdalar() { return (ODA_SAYISI >= 32) ? 0xFFFFFFFFu : ((1UL << ODA_SAYISI) - 1); }

static void yanSon(uint32_t maske, int adet, int acikMs, int kapaliMs) {
  for (int i = 0; i < adet; i++) {
    ledleriGoster(maske);
    delay(acikMs);
    ledleriGoster(0);
    delay(kapaliMs);
  }
}

static void ledleriHazirla() {
  for (size_t i = 0; i < ODA_SAYISI; i++) {
    pinMode(ODALAR[i].ledPin, OUTPUT);
    digitalWrite(ODALAR[i].ledPin, LOW);
  }
  if (DURUM_LED_PIN >= 0) {
    pinMode(DURUM_LED_PIN, OUTPUT);
    durumLed(false);
  }
}

// ------------------------------------------------------------------ Butonlar

static uint64_t butonMaskesi() {
  uint64_t m = 0;
  for (size_t i = 0; i < ODA_SAYISI; i++) m |= 1ULL << ODALAR[i].butonPin;
  m |= 1ULL << BASLAT_PIN;
  if (EVE_DON_PIN >= 0) m |= 1ULL << EVE_DON_PIN;
  return m;
}

static uint64_t basiliPinler() {
  uint64_t m = 0, tum = butonMaskesi();
  for (int p = 0; p < 40; p++)
    if ((tum & (1ULL << p)) && digitalRead(p) == HIGH) m |= 1ULL << p;
  return m;
}

static void butonlariHazirla() {
  uint64_t m = butonMaskesi();
  for (int p = 0; p < 40; p++) {
    if (!(m & (1ULL << p))) continue;
    rtc_gpio_deinit((gpio_num_t)p);  // uykudan kalan RTC ayarını bırak
    pinMode(p, INPUT_PULLDOWN);
  }
}

// --------------------------------------------------------------------- Uyku

static void uyu() {
  if (ADAPTOR_MODU) {
    // Prizden besleniyor: uyumaya gerek yok, Wi-Fi açık kalsın, hazırda bekle.
    secim = 0;
    ledleriGoster(0);
    durumLed(false);
    sonEtkinlik = millis();
    return;
  }
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  ledleriGoster(0);
  durumLed(false);

  // Basılı tutulan buton bırakılana kadar bekle (en fazla 10 sn).
  uint64_t maske = butonMaskesi();
  uint32_t bas = millis();
  while ((basiliPinler() & maske) && millis() - bas < 10000) delay(20);
  maske &= ~basiliPinler();  // hâlâ basılı (arızalı) buton sürekli uyandırmasın

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

static uint32_t wifiBaslangic = 0;
static bool wifiHizliDeneniyor = false;

static void wifiBaslat(bool hizli) {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
#ifdef KUMANDA_SABIT_IP
  WiFi.config(IPAddress(KUMANDA_IP), IPAddress(AG_GECIDI), IPAddress(ALT_AG),
              IPAddress(DNS_SUNUCU));
#endif
  wifiHizliDeneniyor = hizli && rtcWifiGecerli;
  if (wifiHizliDeneniyor)
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, rtcKanal, rtcBssid);
  else
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  wifiBaslangic = millis();
}

// Arka planda çağrılır: hızlı bağlanma tutmazsa normal bağlanmaya geçer.
static bool wifiKontrol() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!rtcWifiGecerli || rtcKanal != WiFi.channel()) {
      rtcKanal = WiFi.channel();
      memcpy(rtcBssid, WiFi.BSSID(), 6);
      rtcWifiGecerli = true;
    }
    return true;
  }
  if (wifiHizliDeneniyor && millis() - wifiBaslangic > 3000) {  // kanal/BSSID değişmiş
    rtcWifiGecerli = false;
    WiFi.disconnect();
    wifiBaslat(false);
  } else if (!wifiHizliDeneniyor && millis() - wifiBaslangic > 15000) {
    WiFi.disconnect();  // takıldıysa yeniden dene
    wifiBaslat(false);
  }
  return false;
}

// Bağlanana kadar bekler; beklerken seçili LED'leri yakıp söndürür.
static bool wifiBekle(uint32_t gosterilecek, uint32_t sureMs) {
  uint32_t bas = millis();
  while (!wifiKontrol()) {
    if (millis() - bas > sureMs) return false;
    ledleriGoster(((millis() / 200) % 2) ? gosterilecek : 0);
    delay(20);
  }
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

// method: "app_segment_clean", "app_charge", "app_start"
static bool robotaGonder(const char* method, const char* params, bool mesgulseDurdur,
                         uint32_t gosterilecek) {
  durumLed(true);
  if (!wifiBekle(gosterilecek, 12000)) {
    Serial.println("Wi-Fi baglanamadi.");
    return false;
  }
  ledleriGoster(gosterilecek);
  saatiAyarla();

  // static: ~7 KB tampon yığına (8 KB) sığmaz
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

  static char yanit[512];
  yanit[0] = '\0';
  Serial.printf("Komut: %s %s\n", method, params);
  bool ok = robot.call(method, params, yanit, sizeof(yanit));
  Serial.printf("Yanit: %s\n", ok ? yanit : robot.lastError());

  if (ok && !yanitBasarili(yanit) && mesgulseDurdur) {
    Serial.println("Robot mesgul, mevcut is durduruluyor...");
    robot.call("app_stop", "[]", yanit, sizeof(yanit));
    delay(1500);
    ok = robot.call(method, params, yanit, sizeof(yanit));
    Serial.printf("Yanit: %s\n", ok ? yanit : robot.lastError());
  }
  robot.close();
  return ok && yanitBasarili(yanit);
}

static bool odalariSupur(uint32_t odalar) {
  char params[200];
  size_t n = snprintf(params, sizeof(params), "[{\"segments\":[");
  bool ilk = true;
  for (size_t i = 0; i < ODA_SAYISI; i++) {
    if (!(odalar & (1UL << i))) continue;
    n += snprintf(params + n, sizeof(params) - n, "%s%u", ilk ? "" : ",", ODALAR[i].segment);
    Serial.printf("Oda: %s (segment %u)\n", ODALAR[i].ad, ODALAR[i].segment);
    ilk = false;
  }
  if (TEKRAR_SAYISI > 1)
    snprintf(params + n, sizeof(params) - n, "],\"repeat\":%d}]", TEKRAR_SAYISI);
  else
    snprintf(params + n, sizeof(params) - n, "]}]");
  return robotaGonder("app_segment_clean", params, MESGULSE_DURDUR, odalar);
}

// --------------------------------------------------------------------- Pil

static bool pilZayif() {
  if (PIL_PIN < 0) return false;
  float v = analogReadMilliVolts(PIL_PIN) * PIL_BOLUCU / 1000.0f;
  Serial.printf("Pil: %.2f V\n", v);
  return v > 0.5f && v < PIL_DUSUK_V;  // 0.5 V altı: ölçüm bağlı değil
}

// ------------------------------------------------------------ Buton olayları

static void sonucuGosterVeUyu(bool ok, uint32_t gosterilecek) {
  durumLed(false);
  ledleriGoster(0);
  delay(300);
  if (ok)
    yanSon(gosterilecek ? gosterilecek : tumOdalar(), 2, 500, 300);
  else
    yanSon(tumOdalar(), 6, 90, 90);
  if (pilZayif()) {
    delay(400);
    yanSon(tumOdalar(), 3, 900, 300);
  }
  secim = 0;
  uyu();
}

static void butonaBasildi(int pin) {
  sonEtkinlik = millis();

  for (size_t i = 0; i < ODA_SAYISI; i++) {
    if (pin != ODALAR[i].butonPin) continue;
    secim ^= 1UL << i;  // seç / seçimi kaldır
    ledleriGoster(secim);
    Serial.printf("%s %s\n", ODALAR[i].ad, (secim & (1UL << i)) ? "secildi" : "kaldirildi");
    return;
  }

  if (pin == BASLAT_PIN) {
    if (secim) {
      uint32_t s = secim;
      sonucuGosterVeUyu(odalariSupur(s), s);
    } else if (BOS_BASLAT_TUM_EV) {
      Serial.println("Butun ev supuruluyor");
      sonucuGosterVeUyu(robotaGonder("app_start", "[]", MESGULSE_DURDUR, tumOdalar()), tumOdalar());
    } else {
      Serial.println("Once oda sec");
      yanSon(tumOdalar(), 2, 120, 120);  // "önce oda seç"
    }
    return;
  }

  if (EVE_DON_PIN >= 0 && pin == EVE_DON_PIN) {
    Serial.println("Istasyona donuluyor");
    secim = 0;
    sonucuGosterVeUyu(robotaGonder("app_charge", "[]", false, tumOdalar()), tumOdalar());
  }
}

static void basilanlariIsle(uint64_t yeni) {
  for (int p = 0; p < 40; p++) {
    if (!(yeni & (1ULL << p))) continue;
    if (kilit[p] && millis() - kilit[p] < 250) continue;  // sıçrama (0 = hiç basılmadı)
    kilit[p] = millis() | 1;
    butonaBasildi(p);
  }
}

// -------------------------------------------------------------------- Ana

void setup() {
  Serial.begin(115200);
  ledleriHazirla();

  esp_sleep_wakeup_cause_t neden = esp_sleep_get_wakeup_cause();
  uint64_t uyandiran =
      (neden == ESP_SLEEP_WAKEUP_EXT1) ? esp_sleep_get_ext1_wakeup_status() : 0;
  butonlariHazirla();

  if (neden != ESP_SLEEP_WAKEUP_EXT1) {
    // Güç verildi / reset: LED'leri sırayla yak ("hazırım").
    // Pil modunda uyur; adaptör modunda uyumaz, aşağıda Wi-Fi'ye bağlanır.
    Serial.printf("Robot supurge kumandasi hazir (%s modu).\n", ADAPTOR_MODU ? "adaptor" : "pil");
    for (size_t i = 0; i < ODA_SAYISI; i++) {
      ledleriGoster(1UL << i);
      delay(120);
    }
    ledleriGoster(0);
    uyu();
  }

  wifiBaslat(true);  // seçim yapılırken arka planda bağlansın
  oncekiPinler = basiliPinler();
  sonEtkinlik = millis();
  basilanlariIsle(uyandiran | oncekiPinler);
}

void loop() {
  uint64_t simdi = basiliPinler();
  uint64_t yeni = simdi & ~oncekiPinler;
  oncekiPinler = simdi;
  if (yeni) basilanlariIsle(yeni);

  wifiKontrol();

  if (millis() - sonEtkinlik > SECIM_ZAMAN_ASIMI_MS) {
    if (secim || !ADAPTOR_MODU) Serial.println("Zaman asimi, secim silindi.");
    secim = 0;
    uyu();  // adaptör modunda yalnızca seçimi temizler
  }
  delay(10);
}
