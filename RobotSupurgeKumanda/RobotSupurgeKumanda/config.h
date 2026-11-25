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

// Sabit IP önerilir: uyanınca Wi-Fi'ye daha hızlı bağlanır.
// Kullanmak istemezsen KUMANDA_SABIT_IP satırının başına // koy.
#define KUMANDA_SABIT_IP
#define KUMANDA_IP     192, 168, 1, 250   // ağında boş bir adres
#define AG_GECIDI      192, 168, 1, 1     // modem adresi
#define ALT_AG         255, 255, 255, 0
#define DNS_SUNUCU     192, 168, 1, 1

// --- Roborock S8 ------------------------------------------------------
// Robotun IP'si sabit olmalı: modem arayüzünden "DHCP rezervasyonu" yap.
#define ROBOT_IP       192, 168, 1, 50
#define LOCAL_KEY      "xxxxxxxxxxxxxxxx" // 16 karakter, kurulum.py verir

// --- Odalar: buton pini, LED pini, Roborock oda (segment) numarası ------
// Buton pinleri uykudan uyandırabilen pinler olmalı:
//   32 33 25 26 27 14 13 4   (12'yi KULLANMA, basılıyken kart açılmaz)
// LED pinleri herhangi bir çıkış pini olabilir: 23 22 21 19 18 17 16
struct Oda {
  const char* ad;
  uint8_t butonPin;
  uint8_t ledPin;
  uint16_t segment;
};

static const Oda ODALAR[] = {
  // ad              buton  LED  segment
  {"Mutfak",          32,   23,  16},
  {"Oturma Odasi",    33,   22,  17},
  {"Salon",           25,   21,  18},
  {"Koridor",         26,   19,  19},
  {"Cocuk Odasi",     27,   18,  20},
  {"Yatak Odasi",     14,   17,  21},
};

// Başlat butonu: seçili odaları süpürmeye başlar.
#define BASLAT_PIN     13

// Eve Dön butonu: robotu durdurup istasyona gönderir. İstemezsen -1 yap.
#define EVE_DON_PIN    4

// Durum LED'i (isteğe bağlı). ESP32 DevKit'in kendi mavi LED'i: 2.
// Komut gönderilirken yanar. İstemezsen -1 yap.
#define DURUM_LED_PIN  2

// --- Davranış ---------------------------------------------------------
// Bu süre boyunca hiçbir butona basılmazsa seçim silinir, kutu uyur.
#define SECIM_ZAMAN_ASIMI_MS 30000

// Hiç oda seçmeden Başlat'a basılırsa: 1 = bütün evi süpür, 0 = bir şey yapma
#define BOS_BASLAT_TUM_EV 0

// Her oda kaç tur süpürülsün (1-3).
#define TEKRAR_SAYISI  1

// Robot zaten çalışırken Başlat'a basılırsa: mevcut işi durdurup yeni
// odalara geçsin mi? (1 = evet, 0 = hayır, hata ışığı yanar)
#define MESGULSE_DURDUR 1

// --- Pil ölçümü (isteğe bağlı) -----------------------------------------
// Pil + ucundan iki adet 100k dirençle bölücü yapıp ortasını GPIO35'e
// bağlarsan pil zayıfladığında uyarı verir. Ölçüm yoksa -1 bırak.
#define PIL_PIN        -1
#define PIL_BOLUCU     2.0f
#define PIL_DUSUK_V    3.45f
