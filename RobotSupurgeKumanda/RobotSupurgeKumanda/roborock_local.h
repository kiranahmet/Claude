// Roborock yerel (LAN) protokolü — bulut olmadan TCP 58867 üzerinden komut.
//
// Protokol python-roborock kütüphanesindeki (Home Assistant'ın resmi Roborock
// entegrasyonunun kullandığı kütüphane) uygulamaya birebir uyar:
//   * "1.0" sürümü : AES-128-ECB, anahtar = MD5(kodlanmis_zaman + local_key + SALT)
//   * "L01" sürümü : AES-256-GCM (yeni firmware'ler), anahtar = SHA256(...)
// Bağlantıda önce HELLO ile sürüm anlaşılır, sonra JSON-RPC komutu gönderilir.
//
// Bu dosya Arduino'ya bağımlı değildir (Transport arayüzü üzerinden çalışır),
// böylece bilgisayarda da derlenip test edilebilir.
#pragma once

#include <stddef.h>
#include <stdint.h>

namespace rr {

enum Version : uint8_t { V10 = 0, VL01 = 1 };

enum Protocol : uint16_t {
  HELLO_REQUEST = 0,
  HELLO_RESPONSE = 1,
  PING_REQUEST = 2,
  PING_RESPONSE = 3,
  GENERAL_REQUEST = 4,
  GENERAL_RESPONSE = 5,
};

// Ağ katmanı soyutlaması (ESP32'de WiFiClient, bilgisayarda POSIX soket).
class Transport {
 public:
  virtual ~Transport() {}
  virtual bool open() = 0;
  virtual void close() = 0;
  virtual bool write(const uint8_t* data, size_t len) = 0;
  // En fazla `cap` bayt okur. Dönüş: >0 okunan bayt, 0 zaman aşımı, -1 bağlantı kapandı.
  virtual int read(uint8_t* buf, size_t cap, uint32_t timeoutMs) = 0;
  virtual uint32_t millis() = 0;
  virtual uint32_t random32() = 0;
  // Unix zamanı (saniye); bilinmiyorsa 0. Robotun HELLO yanıtı saati düzeltir.
  virtual uint32_t unixTime() { return 0; }
};

struct Session {
  char localKey[17];      // Roborock local_key (16 karakter)
  Version version;        // anlaşılan protokol sürümü
  uint32_t connectNonce;  // HELLO isteğindeki random
  uint32_t ackNonce;      // HELLO yanıtındaki random (L01 için)
  bool hasAck;
};

struct Message {
  char version[4];
  uint32_t seq;
  uint32_t random;
  uint32_t timestamp;
  uint16_t protocol;
  uint8_t* payload;   // çözülmüş içerik (payloadBuf içine), yoksa nullptr
  size_t payloadLen;
};

// Tek bir çerçeve oluşturur (4 bayt uzunluk öneki dahil). 0 = hata.
size_t buildFrame(const Session& s, Version v, uint32_t seq, uint32_t random, uint32_t ts,
                  uint16_t protocol, const uint8_t* plain, size_t plainLen, uint8_t* out,
                  size_t outCap);

// Tampondaki ilk çerçeveyi çözer.
// Dönüş: >0 tüketilen bayt (msg doldu), 0 = çerçeve henüz tamamlanmadı,
//        <0 = bozuk çerçeve (-dönüş kadar bayt atlanmalı).
int parseFrame(const Session& s, const uint8_t* buf, size_t len, Message& msg,
               uint8_t* payloadBuf, size_t payloadCap);

class Client {
 public:
  Client(Transport& t, const char* localKey);

  // Bağlanır ve protokol sürümünü anlaşır. Önce `preferred` denenir.
  bool connect(Version preferred, uint32_t helloTimeoutMs = 3000);
  void close();

  // JSON-RPC çağrısı. paramsJson örn: "[{\"segments\":[16,17]}]" veya "[]".
  // Cihazın yanıtı (iç JSON, örn {"id":123,"result":["ok"]}) `out`a yazılır.
  bool call(const char* method, const char* paramsJson, char* out, size_t outCap,
            uint32_t timeoutMs = 4000);

  Version version() const { return session_.version; }
  uint32_t deviceTime() const;  // HELLO yanıtındaki saat + geçen süre
  const char* lastError() const { return lastError_; }

 private:
  bool hello(Version v, uint32_t timeoutMs);
  // Belirli protokol/seq ya da RPC id'si gelene kadar okur.
  bool waitFor(int protocol, uint32_t seq, uint32_t rpcId, Message& msg, uint32_t timeoutMs);
  bool readMore(uint32_t timeoutMs);

  Transport& t_;
  Session session_;
  bool open_ = false;
  uint32_t baseTime_ = 0;
  uint32_t baseMillis_ = 0;
  const char* lastError_ = "";

  uint8_t rx_[4096];
  size_t rxLen_ = 0;
  uint8_t payload_[3072];
};

// Yardımcılar (test için dışarı açık)
void encodeTimestamp(uint32_t ts, char out[9]);
uint32_t crc32(const uint8_t* data, size_t len);
// JSON içindeki "key":"..." string değerini kaçış karakterlerini çözerek kopyalar.
bool extractJsonString(const char* json, const char* key, char* out, size_t outCap);

}  // namespace rr
