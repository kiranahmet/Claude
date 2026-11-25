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

// Sabit IP (isteğe bağlı, genelde gerekmez). Kumanda hep açık olduğu için
// modemin otomatik verdiği IP yeterli. Kullanmak istersen aşağıdaki satırın
// başındaki // işaretini kaldır ve KUMANDA_IP'ye ağında boş bir adres yaz.
// #define KUMANDA_SABIT_IP
#define KUMANDA_IP     192, 168, 1, 250   // ağında boş bir adres
#define AG_GECIDI      192, 168, 1, 1     // modem adresi
#define ALT_AG         255, 255, 255, 0
#define DNS_SUNUCU     192, 168, 1, 1

// --- Roborock S8 ------------------------------------------------------
// Robotun IP'si sabit olmalı: modem arayüzünden "DHCP rezervasyonu" yap.
#define ROBOT_IP       192, 168, 1, 50
#define LOCAL_KEY      "xxxxxxxxxxxxxxxx" // 16 karakter, kurulum.py verir

// --- Odalar: buton pini, LED pini, Roborock oda (segment) numarası ------
// Segment 0 = bu robotta karşılığı yok: butona basınca LED'i 3 kez yanıp
// söner, oda seçilmez.
// Buton pinleri: 32 33 25 26 27 14 13 4  (34-39 ve 12'yi KULLANMA)
// LED pinleri  : 23 22 21 19 18 17 16
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

// Kartın kendi mavi LED'i (GPIO2): komut gönderilirken yanar,
// Wi-Fi bağlantısı yokken yavaş yanıp söner. İstemezsen -1 yap.
#define DURUM_LED_PIN  2

// --- Davranış ---------------------------------------------------------
// Oda seçildikten sonra bu süre içinde Başlat'a basılmazsa seçim silinir.
#ifndef SECIM_ZAMAN_ASIMI_MS
#define SECIM_ZAMAN_ASIMI_MS 30000
#endif

// Hiç oda seçmeden Başlat'a basılırsa: 1 = bütün evi süpür, 0 = bir şey yapma
#define BOS_BASLAT_TUM_EV 0

// Her oda kaç tur süpürülsün (1-3).
#define TEKRAR_SAYISI  1

// Robot zaten çalışırken Başlat'a basılırsa: mevcut işi durdurup yeni
// odalara geçsin mi? (1 = evet, 0 = hayır, hata ışığı yanar)
#define MESGULSE_DURDUR 1
