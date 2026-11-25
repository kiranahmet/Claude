# Robot Süpürge Oda Kumandası (Roborock S8 + ESP32)

Duvara ya da masaya koyulan, pille çalışan bir kutu. Üzerinde her oda için bir
buton var. **Mutfak**'a basınca robot mutfağa gidip süpürür, **Yatak Odası**'na
basınca yatak odasını süpürür.

- Home Assistant **gerekmez**, bilgisayar ya da sunucu gerekmez.
- ESP32 robota **ev ağı üzerinden doğrudan** komut verir (bulutsuz, hızlı).
- Normal **ESP32** yeterli (S3/C3 gerekmez).
- Kutu derin uykuda bekler, pil aylarca gider.

## Nasıl çalışır?

1. Bir oda butonuna basarsın, ESP32 uykudan uyanır, LED yanar.
2. 2,5 saniye içinde başka odalara da basarsan onlar da eklenir
   (örneğin Mutfak + Koridor art arda basılırsa ikisi birlikte süpürülür).
3. ESP32 Wi-Fi'ye bağlanır ve robota "şu odaları süpür" komutunu gönderir.
4. LED sonucu gösterir ve kutu tekrar uykuya geçer.

| LED | Anlamı |
|---|---|
| Sürekli yanıyor | Komut hazırlanıyor ve gönderiliyor |
| 2 uzun yanıp sönme | Tamam, robot yola çıktı |
| 6 hızlı yanıp sönme | Hata (Wi-Fi'ye ya da robota ulaşılamadı) |
| 3 çok uzun yanıp sönme | Pil zayıf, şarj et |
| 1 uzun yanma (pil takınca) | Kumanda hazır |

**Eve Dön** butonu: robot ne yapıyorsa bırakır ve istasyona döner.

## Malzeme listesi

| Malzeme | Not |
|---|---|
| **LOLIN D32** (önerilen) ya da FireBeetle ESP32 | Normal ESP32 kartı. Üzerinde pil girişi ve şarj devresi var, uykuda az akım çeker. |
| 1 adet LiPo pil (1000–2500 mAh, JST-PH 2.0 fişli) | Ya da 18650 pil + yuvası |
| 7 adet 12 mm anlık (basınca kapanan) buton | 6 oda + 1 "Eve Dön" |
| 1 LED + 330 Ω direnç | Kartın üstündeki LED'i kullanacaksan gerekmez |
| Proje kutusu (yaklaşık 10×7×4 cm) | Plastik kutu ya da 3D baskı |
| Biraz kablo, havya | |
| Buton etiketleri | Etiket makinesi ya da yazıcı çıktısı |

> **Neden LOLIN D32?** Sıradan "ESP32 DevKit" kartları da çalışır. Ama üzerlerindeki
> USB çipi ve voltaj regülatörü uykuda bile akım çeker, pil birkaç günde ya da birkaç
> haftada biter. Kumandayı prize takılı (USB adaptörle) kullanacaksan DevKit'te sorun
> yok. Pille kullanacaksan LOLIN D32 ya da FireBeetle gibi düşük tüketimli bir kart al.

## Bağlantı şeması

Butonların bir ucu **3.3V**'a, diğer ucu ESP32 pinine bağlanır. Dirence gerek
yok, ESP32'nin içindeki dirençler kullanılıyor.

```
                    ESP32 (LOLIN D32)
     3V3 ──┬──────┬──────┬──────┬──────┬──────┬──────┐
           │      │      │      │      │      │      │
         [BTN]  [BTN]  [BTN]  [BTN]  [BTN]  [BTN]  [BTN]
           │      │      │      │      │      │      │
        GPIO32 GPIO33 GPIO25 GPIO26 GPIO27 GPIO14 GPIO13
        Mutfak Oturma Salon  Koridor Çocuk  Yatak  EVE DÖN
               Odası                 Odası  Odası

     GPIO2 ──[330Ω]──►|── GND        (LED, isteğe bağlı)

     Pil ──► kartın JST pil girişi (LOLIN D32 USB'den şarj eder)
```

- Pin numaralarını değiştirmek istersen sadece şunları kullan:
  **32, 33, 25, 26, 27, 14, 13, 4**. Uykudan uyandırabilen pinler bunlar.
- **GPIO12'yi kullanma**, basılıyken kart açılmayabilir.
- LOLIN D32'nin kendi LED'i GPIO5'te. Onu kullanacaksan `config.h`'de
  `LED_PIN 5` ve `LED_AKTIF LOW` yap.
- LOLIN D32'de pil ölçümü kartın içinde GPIO35'e bağlı. Pil uyarısı için
  `PIL_PIN 35` yap.

## Kurulum (bir kez yapılır)

### 1. Robotun bilgilerini bul (bilgisayarda, 5 dakika)

ESP32'nin robotla konuşabilmesi için üç bilgi lazım: robotun **IP adresi**,
**local key** denen şifresi ve her odanın **numarası**. Bunları `kurulum/kurulum.py`
betiği senin için bulur.

1. Bilgisayarına Python 3.11 ya da daha yenisini kur (python.org).
2. Komut satırını (Windows'ta "cmd") aç ve şunu yaz:

```bash
pip install python-roborock
```

3. Proje klasöründe şunu çalıştır:

```bash
python kurulum/kurulum.py
```

4. Roborock uygulamasında kullandığın e-postayı gir. E-postana gelen kodu yaz.
5. Betik robotun odalarını listeler, **yerel bağlantıyı test eder** ve
   `config.h`'ye yapıştıracağın hazır satırları ekrana yazar. Ekran şöyle görünür:

```
Robotun haritasındaki odalar:
  segment  16 = Mutfak
  segment  17 = Oturma Odası
  ...
---------------- config.h'ye yapıştır ----------------
#define ROBOT_IP       192, 168, 1, 50
#define LOCAL_KEY      "a1B2c3D4e5F6g7H8"
static const Oda ODALAR[] = { ... };
```

6. İstersen betik gerçek bir oda süpürme testi de yapar. Böylece kutuyu
   lehimlemeden önce oda numaralarının doğru olduğundan emin olursun.

> Oda adları Roborock uygulamasında verdiğin adlardır. Betik bunları otomatik
> eşleştirir. Eşleşmeyen satırın yanına uyarı yazar, o numarayı listeden elle yaz.

### 2. Robota sabit IP ver

Modemin arayüzüne gir (genelde 192.168.1.1) ve robot için **DHCP rezervasyonu**
yap. Böylece robotun IP adresi hiç değişmez. Bunu yapmazsan, modem yeniden
başladığında robot yeni bir IP alabilir ve kumanda çalışmayı bırakır.

### 3. ESP32'yi programla (Arduino IDE)

1. Arduino IDE 2.x'i kur.
2. *Araçlar → Kart → Kart Yöneticisi*'nden **"esp32 by Espressif Systems"**
   paketini kur.
3. `RobotSupurgeKumanda/RobotSupurgeKumanda.ino` dosyasını aç.
4. `config.h` sekmesinde şunları düzenle:
   - Wi-Fi adı ve şifresi (**2.4 GHz** ağ olmalı)
   - Kurulum betiğinin verdiği satırlar (`ROBOT_IP`, `LOCAL_KEY`, `ODALAR`)
   - Sabit IP kullanacaksan `KUMANDA_IP` için ağında boş bir adres yaz
5. Kartı seç: **"WEMOS LOLIN32"** (LOLIN D32 için) ya da **"ESP32 Dev Module"**.
6. *Yükle*'ye bas.
7. Yükleme bitince *Seri Monitör*'ü aç (115200 baud) ve bir butona bas. Ne olup
   bittiğini satır satır görürsün.

## Ayarlar (`config.h`)

| Ayar | Ne işe yarar |
|---|---|
| `BIRLESTIRME_MS` | İlk butondan sonra kaç milisaniye boyunca başka odaların ekleneceği (varsayılan 2500) |
| `TEKRAR_SAYISI` | Her oda kaç tur süpürülsün (1–3) |
| `MESGULSE_DURDUR` | Robot o an başka bir iş yapıyorsa: 1 = durdurup yeni odaya geçer, 0 = hata verir |
| `EVE_DON_PIN` | "Eve Dön" butonunun pini. Bu butonu istemiyorsan -1 yap |
| `PIL_PIN` | Pil ölçüm pini (LOLIN D32'de 35). Ölçüm yoksa -1 |

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| 6 hızlı yanıp sönme, Seri Monitör'de "Wi-Fi baglanamadi" | Wi-Fi adını ve şifresini kontrol et. Ağ 2.4 GHz mi? Sabit IP'yi kapatıp (`KUMANDA_SABIT_IP` satırını yorum yaparak) dene. |
| "Robota baglanilamadi" | `ROBOT_IP` doğru mu? Robot ile ESP32 aynı ağda mı? Misafir ağı ya da "AP izolasyonu" açıksa kapat. |
| "yanit zaman asimi" | `LOCAL_KEY` yanlış olabilir. Robotu sıfırladıysan ya da uygulamaya yeniden eklediysen key değişir, `kurulum.py`'yi tekrar çalıştır. |
| Yanlış oda süpürülüyor | Haritayı yeniden oluşturduysan oda numaraları değişir. `kurulum.py`'yi tekrar çalıştır. |
| Pil çok çabuk bitiyor | Kartın uykuda çok akım çekiyordur (DevKit kartlarında olur). LOLIN D32 ya da FireBeetle kullan. |
| Kutu kendi kendine uyanıyor | Buton kabloları çok uzunsa ya da parazit alıyorsa, her buton pini ile GND arasına 100 kΩ direnç ekle. |

## Dosyalar

```
RobotSupurgeKumanda/
├── RobotSupurgeKumanda/          ← Arduino projesi (bu klasörü aç)
│   ├── RobotSupurgeKumanda.ino   ← ana program: butonlar, uyku, Wi-Fi
│   ├── config.h                  ← SENİN AYARLARIN
│   ├── roborock_local.h/.cpp     ← Roborock yerel ağ protokolü
├── kurulum/kurulum.py            ← robotun IP, key ve oda numaralarını bulur
└── test/                         ← protokol testleri (geliştirici için)
```

## Teknik not

Roborock S8, ev ağında **TCP 58867** portundan şifreli komut kabul eder. Bu proje
Home Assistant'ın resmi Roborock entegrasyonunun kullandığı protokolü
(python-roborock) ESP32'ye taşır. Hem eski `1.0` (AES-ECB) hem de yeni firmware'lerin
`L01` (AES-GCM) protokolünü destekler ve hangisi gerekiyorsa onu otomatik seçer.
`test/run_tests.sh`, ESP32 kodunun ürettiği paketleri gerçek python-roborock
kütüphanesine karşı doğrular.

Roborock uygulaması, programlı temizlikler ve sesli asistanlar eskisi gibi
çalışmaya devam eder, kumanda bunlara karışmaz.
