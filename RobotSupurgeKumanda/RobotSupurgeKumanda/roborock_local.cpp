#include "roborock_local.h"

#include <stdio.h>
#include <string.h>

#include "mbedtls/aes.h"
#include "mbedtls/gcm.h"
#include "mbedtls/md.h"

namespace rr {

static const uint8_t SALT[] = "TXdfu$jyZ#TZHsg4";  // 16 bayt (+ '\0')
static const size_t HEADER_LEN = 3 + 4 + 4 + 4 + 2;  // version seq random ts protocol

// ---------------------------------------------------------------- yardımcılar

static void putBE32(uint8_t* p, uint32_t v) {
  p[0] = v >> 24; p[1] = v >> 16; p[2] = v >> 8; p[3] = v;
}
static void putBE16(uint8_t* p, uint16_t v) { p[0] = v >> 8; p[1] = v; }
static uint32_t getBE32(const uint8_t* p) {
  return ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16) | ((uint32_t)p[2] << 8) | p[3];
}
static uint16_t getBE16(const uint8_t* p) { return (uint16_t)((p[0] << 8) | p[1]); }

void encodeTimestamp(uint32_t ts, char out[9]) {
  char hex[9];
  snprintf(hex, sizeof(hex), "%08x", (unsigned)ts);
  static const int order[8] = {5, 6, 3, 7, 1, 2, 0, 4};
  for (int i = 0; i < 8; i++) out[i] = hex[order[i]];
  out[8] = '\0';
}

uint32_t crc32(const uint8_t* data, size_t len) {
  uint32_t c = 0xFFFFFFFFu;
  for (size_t i = 0; i < len; i++) {
    c ^= data[i];
    for (int k = 0; k < 8; k++) c = (c >> 1) ^ (0xEDB88320u & (0u - (c & 1u)));
  }
  return c ^ 0xFFFFFFFFu;
}

static bool hashWith(mbedtls_md_type_t type, const uint8_t* in, size_t len, uint8_t* out) {
  const mbedtls_md_info_t* info = mbedtls_md_info_from_type(type);
  return info && mbedtls_md(info, in, len, out) == 0;
}

// kodlanmis_zaman(8) + local_key(16) + SALT(16)
static size_t keyMaterial(const Session& s, uint32_t ts, uint8_t* buf) {
  char enc[9];
  encodeTimestamp(ts, enc);
  size_t kl = strlen(s.localKey);
  memcpy(buf, enc, 8);
  memcpy(buf + 8, s.localKey, kl);
  memcpy(buf + 8 + kl, SALT, 16);
  return 8 + kl + 16;
}

// ------------------------------------------------------------ 1.0 (AES-ECB)

static size_t encryptV10(const Session& s, uint32_t ts, const uint8_t* in, size_t len,
                         uint8_t* out, size_t cap) {
  uint8_t km[64], key[16];
  if (!hashWith(MBEDTLS_MD_MD5, km, keyMaterial(s, ts, km), key)) return 0;
  size_t padded = (len / 16 + 1) * 16;  // PKCS7
  if (padded > cap) return 0;
  memcpy(out, in, len);
  memset(out + len, (int)(padded - len), padded - len);
  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);
  mbedtls_aes_setkey_enc(&aes, key, 128);
  for (size_t i = 0; i < padded; i += 16)
    mbedtls_aes_crypt_ecb(&aes, MBEDTLS_AES_ENCRYPT, out + i, out + i);
  mbedtls_aes_free(&aes);
  return padded;
}

static int decryptV10(const Session& s, uint32_t ts, const uint8_t* in, size_t len, uint8_t* out,
                      size_t cap) {
  if (len == 0 || len % 16 != 0 || len > cap) return -1;
  uint8_t km[64], key[16];
  if (!hashWith(MBEDTLS_MD_MD5, km, keyMaterial(s, ts, km), key)) return -1;
  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);
  mbedtls_aes_setkey_dec(&aes, key, 128);
  for (size_t i = 0; i < len; i += 16)
    mbedtls_aes_crypt_ecb(&aes, MBEDTLS_AES_DECRYPT, in + i, out + i);
  mbedtls_aes_free(&aes);
  uint8_t pad = out[len - 1];
  if (pad == 0 || pad > 16) return -1;
  return (int)(len - pad);
}

// ----------------------------------------------------------- L01 (AES-GCM)

static void l01Params(const Session& s, uint32_t ts, uint32_t seq, uint32_t nonce, uint8_t key[32],
                      uint8_t iv[12], uint8_t* aad, size_t* aadLen) {
  uint8_t km[64];
  hashWith(MBEDTLS_MD_SHA256, km, keyMaterial(s, ts, km), key);

  uint8_t ivIn[12], digest[32];
  putBE32(ivIn, seq);
  putBE32(ivIn + 4, nonce);
  putBE32(ivIn + 8, ts);
  hashWith(MBEDTLS_MD_SHA256, ivIn, 12, digest);
  memcpy(iv, digest, 12);

  size_t n = 0;
  putBE32(aad + n, seq); n += 4;
  putBE32(aad + n, s.connectNonce); n += 4;
  if (s.hasAck) { putBE32(aad + n, s.ackNonce); n += 4; }
  putBE32(aad + n, nonce); n += 4;
  putBE32(aad + n, ts); n += 4;
  *aadLen = n;
}

static size_t encryptL01(const Session& s, uint32_t ts, uint32_t seq, uint32_t nonce,
                         const uint8_t* in, size_t len, uint8_t* out, size_t cap) {
  if (len + 16 > cap) return 0;
  uint8_t key[32], iv[12], aad[20];
  size_t aadLen;
  l01Params(s, ts, seq, nonce, key, iv, aad, &aadLen);
  mbedtls_gcm_context gcm;
  mbedtls_gcm_init(&gcm);
  int rc = mbedtls_gcm_setkey(&gcm, MBEDTLS_CIPHER_ID_AES, key, 256);
  if (rc == 0)
    rc = mbedtls_gcm_crypt_and_tag(&gcm, MBEDTLS_GCM_ENCRYPT, len, iv, 12, aad, aadLen, in, out,
                                   16, out + len);
  mbedtls_gcm_free(&gcm);
  return rc == 0 ? len + 16 : 0;
}

static int decryptL01(const Session& s, uint32_t ts, uint32_t seq, uint32_t nonce,
                      const uint8_t* in, size_t len, uint8_t* out, size_t cap) {
  if (len < 16 || len - 16 > cap) return -1;
  uint8_t key[32], iv[12], aad[20];
  size_t aadLen;
  l01Params(s, ts, seq, nonce, key, iv, aad, &aadLen);
  mbedtls_gcm_context gcm;
  mbedtls_gcm_init(&gcm);
  int rc = mbedtls_gcm_setkey(&gcm, MBEDTLS_CIPHER_ID_AES, key, 256);
  if (rc == 0)
    rc = mbedtls_gcm_auth_decrypt(&gcm, len - 16, iv, 12, aad, aadLen, in + len - 16, 16, in, out);
  mbedtls_gcm_free(&gcm);
  return rc == 0 ? (int)(len - 16) : -1;
}

// ------------------------------------------------------------------ çerçeve

static bool validVersion(const uint8_t* p) {
  return !memcmp(p, "1.0", 3) || !memcmp(p, "L01", 3) || !memcmp(p, "A01", 3) ||
         !memcmp(p, "B01", 3);
}

size_t buildFrame(const Session& s, Version v, uint32_t seq, uint32_t random, uint32_t ts,
                  uint16_t protocol, const uint8_t* plain, size_t plainLen, uint8_t* out,
                  size_t outCap) {
  if (outCap < 4 + HEADER_LEN + 4) return 0;
  uint8_t* m = out + 4;
  memcpy(m, v == VL01 ? "L01" : "1.0", 3);
  putBE32(m + 3, seq);
  putBE32(m + 7, random);
  putBE32(m + 11, ts);
  putBE16(m + 15, protocol);
  size_t mlen = HEADER_LEN;

  if (plain) {
    size_t room = outCap - 4 - HEADER_LEN - 2 - 4;
    size_t enc = (v == VL01) ? encryptL01(s, ts, seq, random, plain, plainLen, m + mlen + 2, room)
                             : encryptV10(s, ts, plain, plainLen, m + mlen + 2, room);
    if (enc == 0 || enc > 0xFFFF) return 0;
    putBE16(m + mlen, (uint16_t)enc);
    mlen += 2 + enc;
  }
  putBE32(m + mlen, crc32(m, mlen));
  mlen += 4;
  putBE32(out, (uint32_t)mlen);
  return 4 + mlen;
}

int parseFrame(const Session& s, const uint8_t* buf, size_t len, Message& msg, uint8_t* payloadBuf,
               size_t payloadCap) {
  if (len < 7) return 0;
  if (!validVersion(buf + 4)) return -1;  // senkron kayması: 1 bayt atla
  uint32_t flen = getBE32(buf);
  if (flen < HEADER_LEN || flen > 65535) return -1;
  if (len < 4 + flen) return 0;

  const uint8_t* m = buf + 4;
  memcpy(msg.version, m, 3);
  msg.version[3] = '\0';
  msg.seq = getBE32(m + 3);
  msg.random = getBE32(m + 7);
  msg.timestamp = getBE32(m + 11);
  msg.protocol = getBE16(m + 15);
  msg.payload = nullptr;
  msg.payloadLen = 0;

  // İçeriksiz mesajlar (HELLO yanıtı vb.) robot/firmware'e göre farklı
  // biçimlerde gelebilir: [başlık], [başlık+CRC], [başlık+0000], [başlık+0000+CRC]
  size_t rest = flen - HEADER_LEN;
  if (rest < 2 || rest == 4) return (int)(4 + flen);
  size_t plen = getBE16(m + HEADER_LEN);
  if (plen == 0) return (int)(4 + flen);
  if (HEADER_LEN + 2 + plen > flen) return -(int)(4 + flen);
  size_t msgLen = HEADER_LEN + 2 + plen;
  if (flen >= msgLen + 4 && crc32(m, msgLen) != getBE32(m + msgLen)) return -(int)(4 + flen);

  const uint8_t* enc = m + HEADER_LEN + 2;
  int n = -1;
  if (!memcmp(msg.version, "L01", 3))
    n = decryptL01(s, msg.timestamp, msg.seq, msg.random, enc, plen, payloadBuf, payloadCap - 1);
  else if (!memcmp(msg.version, "1.0", 3))
    n = decryptV10(s, msg.timestamp, enc, plen, payloadBuf, payloadCap - 1);
  if (n < 0) return (int)(4 + flen);  // çözülemedi: başlık geçerli, içerik yok sayılır
  payloadBuf[n] = '\0';
  msg.payload = payloadBuf;
  msg.payloadLen = (size_t)n;
  return (int)(4 + flen);
}

// --------------------------------------------------------------------- JSON

bool extractJsonString(const char* json, const char* key, char* out, size_t outCap) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char* p = strstr(json, pat);
  if (!p) return false;
  p += strlen(pat);
  while (*p == ' ' || *p == ':') p++;
  if (*p != '"') return false;
  p++;
  size_t o = 0;
  while (*p && *p != '"') {
    char c = *p++;
    if (c == '\\' && *p) {
      char e = *p++;
      switch (e) {
        case 'n': c = '\n'; break;
        case 't': c = '\t'; break;
        case 'r': c = '\r'; break;
        case 'u':  // \uXXXX: ASCII dışını '?' yap
          for (int i = 0; i < 4 && *p; i++) p++;
          c = '?';
          break;
        default: c = e;  // \" \\ \/
      }
    }
    if (o + 1 >= outCap) return false;
    out[o++] = c;
  }
  out[o] = '\0';
  return *p == '"';
}

// "key": 123 biçimindeki sayıyı okur (boşluklara toleranslı). Yoksa 0.
static uint32_t jsonUint(const char* json, const char* key) {
  char pat[32];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char* p = strstr(json, pat);
  if (!p) return 0;
  p += strlen(pat);
  while (*p == ' ' || *p == ':') p++;
  uint32_t v = 0;
  while (*p >= '0' && *p <= '9') v = v * 10 + (uint32_t)(*p++ - '0');
  return v;
}

// ------------------------------------------------------------------- Client

Client::Client(Transport& t, const char* localKey) : t_(t) {
  memset(&session_, 0, sizeof(session_));
  strncpy(session_.localKey, localKey, 16);
}

void Client::close() {
  if (open_) t_.close();
  open_ = false;
  rxLen_ = 0;
}

uint32_t Client::deviceTime() const {
  return baseTime_ + (t_.millis() - baseMillis_) / 1000;
}

bool Client::readMore(uint32_t timeoutMs) {
  if (rxLen_ >= sizeof(rx_)) rxLen_ = 0;  // taşma: tamponu boşalt
  int n = t_.read(rx_ + rxLen_, sizeof(rx_) - rxLen_, timeoutMs);
  if (n < 0) {
    lastError_ = "baglanti kapandi";
    open_ = false;
    return false;
  }
  rxLen_ += (size_t)n;
  return true;
}

bool Client::waitFor(int protocol, uint32_t seq, uint32_t rpcId, Message& msg, uint32_t timeoutMs) {
  uint32_t start = t_.millis();
  for (;;) {
    // Tampondaki tüm çerçeveleri işle
    while (rxLen_ > 0) {
      int r = parseFrame(session_, rx_, rxLen_, msg, payload_, sizeof(payload_));
      if (r == 0) break;
      size_t used = (size_t)(r > 0 ? r : -r);
      if (used > rxLen_) used = rxLen_;
      memmove(rx_, rx_ + used, rxLen_ - used);
      rxLen_ -= used;
      if (r < 0) continue;

      if (protocol >= 0 && msg.protocol == protocol && msg.seq == seq) return true;
      if (rpcId && msg.payload) {
        static char inner[1024];
        if (extractJsonString((const char*)msg.payload, "102", inner, sizeof(inner))) {
          if (jsonUint(inner, "id") == rpcId) {
            size_t n = strlen(inner);
            memcpy(payload_, inner, n + 1);
            msg.payload = payload_;
            msg.payloadLen = n;
            return true;
          }
        }
      }
      // diğer mesajlar (durum bildirimleri vb.) yok sayılır
    }
    uint32_t elapsed = t_.millis() - start;
    if (elapsed >= timeoutMs) {
      lastError_ = "yanit zaman asimi";
      return false;
    }
    if (!readMore(timeoutMs - elapsed)) return false;
  }
}

bool Client::hello(Version v, uint32_t timeoutMs) {
  if (!open_) {
    if (!t_.open()) {
      lastError_ = "TCP 58867 baglantisi kurulamadi";
      return false;
    }
    open_ = true;
    rxLen_ = 0;
  }
  session_.version = v;
  session_.connectNonce = 10000 + t_.random32() % 22768;  // 10000..32767
  session_.hasAck = false;
  session_.ackNonce = 0;

  uint8_t frame[64];
  size_t n = buildFrame(session_, v, 1, session_.connectNonce, deviceTime(), HELLO_REQUEST,
                        nullptr, 0, frame, sizeof(frame));
  if (!n || !t_.write(frame, n)) {
    lastError_ = "HELLO gonderilemedi";
    return false;
  }
  Message msg;
  if (!waitFor(HELLO_RESPONSE, 1, 0, msg, timeoutMs)) return false;

  session_.ackNonce = msg.random;
  session_.hasAck = true;
  if (msg.timestamp > 1600000000u) {  // robotun saatini referans al
    baseTime_ = msg.timestamp;
    baseMillis_ = t_.millis();
  }
  return true;
}

bool Client::connect(Version preferred, uint32_t helloTimeoutMs) {
  // Başlangıç zamanı: robottan saat gelene kadar cihazın kendi saati
  if (baseTime_ < 1600000000u) {
    baseTime_ = t_.unixTime();
    baseMillis_ = t_.millis();
  }
  Version order[2] = {preferred, preferred == V10 ? VL01 : V10};
  for (int i = 0; i < 2; i++) {
    if (hello(order[i], helloTimeoutMs)) return true;
    close();  // diğer sürümü temiz bağlantıyla dene
  }
  return false;
}

bool Client::call(const char* method, const char* paramsJson, char* out, size_t outCap,
                  uint32_t timeoutMs) {
  if (!open_) {
    lastError_ = "bagli degil";
    return false;
  }
  uint32_t id = 10000 + t_.random32() % 22768;
  uint32_t ts = deviceTime();

  static char inner[512];
  int il = snprintf(inner, sizeof(inner), "{\"id\":%u,\"method\":\"%s\",\"params\":%s}",
                    (unsigned)id, method, (paramsJson && *paramsJson) ? paramsJson : "[]");
  if (il <= 0 || il >= (int)sizeof(inner)) {
    lastError_ = "komut cok uzun";
    return false;
  }
  // {"dps":{"101":"<inner, kaçışlı>"},"t":ts}
  static char body[1100];
  size_t b = (size_t)snprintf(body, sizeof(body), "{\"dps\":{\"101\":\"");
  for (int i = 0; i < il && b + 4 < sizeof(body); i++) {
    if (inner[i] == '"' || inner[i] == '\\') body[b++] = '\\';
    body[b++] = inner[i];
  }
  int tail = snprintf(body + b, sizeof(body) - b, "\"},\"t\":%u}", (unsigned)ts);
  if (tail <= 0 || b + tail >= sizeof(body)) {
    lastError_ = "komut cok uzun";
    return false;
  }
  b += tail;

  static uint8_t frame[1200];
  uint32_t seq = 100000 + t_.random32() % 900000;
  uint32_t rnd = 10000 + t_.random32() % 90000;
  size_t n = buildFrame(session_, session_.version, seq, rnd, ts, GENERAL_REQUEST,
                        (const uint8_t*)body, b, frame, sizeof(frame));
  if (!n || !t_.write(frame, n)) {
    lastError_ = "komut gonderilemedi";
    return false;
  }
  Message msg;
  if (!waitFor(-1, 0, id, msg, timeoutMs)) return false;
  if (out && outCap) {
    strncpy(out, (const char*)msg.payload, outCap - 1);
    out[outCap - 1] = '\0';
  }
  return true;
}

}  // namespace rr
