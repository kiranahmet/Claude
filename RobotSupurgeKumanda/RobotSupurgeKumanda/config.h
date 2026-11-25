// =====================================================================
//  AYARLAR — yalnızca bu dosyayı düzenlemen yeterli.
//  ROBOT_IP, LOCAL_KEY ve oda numaralarını (segment) kurulum/kurulum.py
//  betiği senin için bulup hazır olarak ekrana yazar.
// =====================================================================
#pragma once
#include <stdint.h>

// --- Wi-Fi (2.4 GHz ağ olmalı; ESP32 5 GHz'e bağlanamaz) -------------
#define WIFI_SSID      "EvAgi"
#define WIFI_PASSWORD  "wifi-sifresi"

// Sabit IP önerilir: pilli kullanımda bağlantıyı ~1 sn hızlandırır.
// Kullanmak istemezsen KUMANDA_SABIT_IP satırını yorum yap.
#define KUMANDA_SABIT_IP
#define KUMANDA_IP     192, 168, 1, 250   // ağında boş bir adres
#define AG_GECIDI      192, 168, 1, 1     // modem adresi
#define ALT_AG         255, 255, 255, 0
#define DNS_SUNUCU     192, 168, 1, 1

// --- Roborock S8 ------------------------------------------------------
// Robotun IP'si sabit olmalı: modem arayüzünden "DHCP rezervasyonu" yap.
#define ROBOT_IP       192, 168, 1, 50
#define LOCAL_KEY      "xxxxxxxxxxxxxxxx" // 16 karakter, kurulum.py verir

// --- Odalar: buton pini + Roborock oda (segment) numarası --------------
// Pinler: yalnızca RTC pinleri derin uykudan uyandırabilir:
//   32 33 25 26 27 14 13 4 (bunları kullan; 12'yi KULLANMA)
struct Oda {
  const char* ad;
  uint8_t pin;
  uint16_t segment;
};

static const Oda ODALAR[] = {
  {"Mutfak",        32, 16},
  {"Oturma Odasi",  33, 17},
  {"Salon",         25, 18},
  {"Koridor",       26, 19},
  {"Cocuk Odasi",   27, 20},
  {"Yatak Odasi",   14, 21},
};

// "Eve Dön" butonu: robotu durdurup istasyona gönderir. İstemezsen -1 yap.
#define EVE_DON_PIN    13

// --- Davranış ---------------------------------------------------------
// İlk butondan sonra bu süre içinde basılan diğer odalar da aynı
// temizliğe eklenir (örn. Mutfak + Koridor art arda bas = ikisi birden).
#define BIRLESTIRME_MS 2500

// Her oda kaç tur süpürülsün (1-3).
#define TEKRAR_SAYISI  1

// Robot zaten çalışırken yeni oda seçilirse: mevcut işi durdurup yeni
// odaya geçsin mi? (1 = evet, 0 = hayır, hata ışığı yanar)
#define MESGULSE_DURDUR 1

// --- Durum ışığı ------------------------------------------------------
// Harici LED (220-330 ohm dirençle) ya da kartın kendi LED'i.
// ESP32 DevKit dahili LED: 2 (aktif HIGH).  LOLIN D32 dahili LED: 5 (aktif LOW).
#define LED_PIN        2
#define LED_AKTIF      HIGH

// --- Pil ölçümü (isteğe bağlı) -----------------------------------------
// LOLIN D32'de pil ölçümü dahili olarak GPIO35'tedir (100k/100k bölücü).
// Ölçüm yoksa -1 bırak. Pil düşükse komuttan sonra 3 uzun yanıp söner.
#define PIL_PIN        -1
#define PIL_BOLUCU     2.0f
#define PIL_DUSUK_V    3.45f
