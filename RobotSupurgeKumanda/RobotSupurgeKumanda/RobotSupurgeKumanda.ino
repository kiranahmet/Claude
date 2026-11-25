// Roborock S8 oda kumandası — ESP32 (ESP32-WROOM-32U DevKit), USB adaptörle beslenir
//
// Kullanım:
//   1. Oda butonlarına bas: oda seçilir, üstündeki LED yanar.
//      Aynı butona tekrar basarsan seçim kalkar, LED söner.
//   2. BAŞLAT'a bas: robot seçili odaları süpürmeye gider.
//   3. EVE DÖN: robot ne yapıyorsa bırakır, istasyona döner.
//
// Kutu prizden beslendiği için hiç uyumaz, Wi-Fi hep bağlı kalır; Başlat'a
// basınca robot hemen yola çıkar. 30 sn içinde Başlat'a basılmazsa seçim silinir.
//
// LED kodları:
//   seçili odaların LED'leri yanıp sönüyor : komut gönderiliyor
//   seçili odalar 2 kez yavaş yanıp söner  : tamam, robot yola çıktı
//   tüm LED'ler 6 kez hızlı yanıp söner    : hata (Wi-Fi ya da robot)
//   tüm LED'ler 2 kez kısa yanıp söner     : oda seçmeden Başlat'a basıldı
//   kartın mavi LED'i yavaş yanıp sönüyor  : Wi-Fi bağlantısı yok
//   açılışta LED'ler sırayla yanar         : kumanda çalışıyor
//
// Ayarlar config.h içinde.

#include <WiFi.h>
#include <sys/time.h>
#include <time.h>

#include "config.h"
#include "roborock_local.h"

static const size_t ODA_SAYISI = sizeof(ODALAR) / sizeof(ODALAR[0]);
static_assert(sizeof(ODALAR) / sizeof(ODALAR[0]) <= 30, "en fazla 30 oda");

static uint32_t secim = 0;        // bit i = ODALAR[i] seçili
static uint32_t sonEtkinlik = 0;  // son buton basımı (ms)
static uint64_t oncekiPinler = 0;
static uint32_t kilit[40] = {0};  // buton sıçrama (debounce) kilidi
static uint8_t robotSurum = rr::V10;  // robotun konuştuğu protokol (ilk bağlantıda öğrenilir)
static bool gonderiliyor = false;

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
  for (int p = 0; p < 40; p++)
    if (m & (1ULL << p)) pinMode(p, INPUT_PULLDOWN);  // buton 3V3'e bağlı, basınca HIGH
}

// Seçimi temizle, LED'leri söndür, yeni komut için hazır bekle
static void hazirdaBekle() {
  secim = 0;
  ledleriGoster(0);
  durumLed(false);
  sonEtkinlik = millis();
}

// --------------------------------------------------------------------- Wi-Fi

static uint32_t wifiBaslangic = 0;

static void wifiBaslat() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
#ifdef KUMANDA_SABIT_IP
  WiFi.config(IPAddress(KUMANDA_IP), IPAddress(AG_GECIDI), IPAddress(ALT_AG),
              IPAddress(DNS_SUNUCU));
#endif
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  wifiBaslangic = millis();
}

// Arka planda çağrılır: bağlantı koptuysa ya da kurulamadıysa yeniden dener.
static bool wifiKontrol() {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (millis() - wifiBaslangic > 15000) {
    Serial.println("Wi-Fi yok, yeniden baglaniliyor...");
    WiFi.disconnect();
    wifiBaslat();
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
  if (time(nullptr) > 1600000000) return;  // saat zaten ayarlı
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
  gonderiliyor = true;
  durumLed(true);
  if (!wifiBekle(gosterilecek, 12000)) {
    Serial.println("Wi-Fi baglanamadi.");
    gonderiliyor = false;
    return false;
  }
  ledleriGoster(gosterilecek);
  saatiAyarla();

  // static: ~7 KB tampon yığına (8 KB) sığmaz
  static WifiTransport tasima{IPAddress(ROBOT_IP)};
  static rr::Client robot(tasima, LOCAL_KEY);

  bool ok = false;
  static char yanit[512];
  yanit[0] = '\0';
  if (!robot.connect((rr::Version)robotSurum)) {
    Serial.printf("Robota baglanilamadi: %s\n", robot.lastError());
  } else {
    robotSurum = robot.version();
    Serial.printf("Robot baglandi (protokol %s)\n", robotSurum == rr::VL01 ? "L01" : "1.0");

    uint32_t rs = robot.deviceTime();  // robotun saatini ESP32'ye de al
    if (rs > 1600000000) {
      timeval tv = {(time_t)rs, 0};
      settimeofday(&tv, nullptr);
    }

    Serial.printf("Komut: %s %s\n", method, params);
    ok = robot.call(method, params, yanit, sizeof(yanit));
    Serial.printf("Yanit: %s\n", ok ? yanit : robot.lastError());

    if (ok && !yanitBasarili(yanit) && mesgulseDurdur) {
      Serial.println("Robot mesgul, mevcut is durduruluyor...");
      robot.call("app_stop", "[]", yanit, sizeof(yanit));
      delay(1500);
      ok = robot.call(method, params, yanit, sizeof(yanit));
      Serial.printf("Yanit: %s\n", ok ? yanit : robot.lastError());
    }
    robot.close();
  }
  gonderiliyor = false;
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

// ------------------------------------------------------------ Buton olayları

static void sonucuGoster(bool ok, uint32_t gosterilecek) {
  durumLed(false);
  ledleriGoster(0);
  delay(300);
  if (ok)
    yanSon(gosterilecek ? gosterilecek : tumOdalar(), 2, 500, 300);
  else
    yanSon(tumOdalar(), 6, 90, 90);
  hazirdaBekle();
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
      sonucuGoster(odalariSupur(s), s);
    } else if (BOS_BASLAT_TUM_EV) {
      Serial.println("Butun ev supuruluyor");
      sonucuGoster(robotaGonder("app_start", "[]", MESGULSE_DURDUR, tumOdalar()), tumOdalar());
    } else {
      Serial.println("Once oda sec");
      yanSon(tumOdalar(), 2, 120, 120);  // "önce oda seç"
    }
    return;
  }

  if (EVE_DON_PIN >= 0 && pin == EVE_DON_PIN) {
    Serial.println("Istasyona donuluyor");
    secim = 0;
    sonucuGoster(robotaGonder("app_charge", "[]", false, tumOdalar()), tumOdalar());
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
  butonlariHazirla();

  Serial.println("Robot supurge kumandasi calisiyor.");
  for (size_t i = 0; i < ODA_SAYISI; i++) {  // açılış: LED'leri sırayla yak
    ledleriGoster(1UL << i);
    delay(120);
  }
  ledleriGoster(0);

  wifiBaslat();
  oncekiPinler = basiliPinler();
  hazirdaBekle();
}

void loop() {
  uint64_t simdi = basiliPinler();
  uint64_t yeni = simdi & ~oncekiPinler;
  oncekiPinler = simdi;
  if (yeni) basilanlariIsle(yeni);

  // Kartın mavi LED'i: Wi-Fi yokken yavaş yanıp söner
  bool bagli = wifiKontrol();
  if (!gonderiliyor) durumLed(!bagli && (millis() / 500) % 2);

  if (secim && millis() - sonEtkinlik > SECIM_ZAMAN_ASIMI_MS) {
    Serial.println("Zaman asimi, secim silindi.");
    hazirdaBekle();
  }
  delay(10);
}
