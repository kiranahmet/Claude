# Robot Süpürge Oda Kumandası (Roborock S8 + ESP32)

Üzerinde oda butonları olan bir kutu. Odaları seçersin, her odanın üstündeki
LED yanar, **Başlat**'a basınca robot seçtiğin odaları süpürür.

- Home Assistant **gerekmez**, bilgisayar ya da sunucu gerekmez.
- ESP32 robota **ev ağı üzerinden doğrudan** komut verir (bulutsuz, hızlı).
- Normal **ESP32 DevKit** kartıyla çalışır, yeni kart gerekmez.

## Kullanım

1. Odaların butonlarına bas. Basılan odanın LED'i **yanar** (seçildi).
2. Yanlış odaya bastıysan aynı butona **tekrar bas**, LED söner (seçim kalktı).
3. **Başlat**'a bas. Robot seçili odaları süpürmeye gider.
4. **Eve Dön**'e basarsan robot ne yapıyorsa bırakır ve istasyona döner.

Kutu boştayken uykudadır, herhangi bir butona basınca uyanır. 30 saniye hiçbir
şeye basılmazsa seçim silinir ve kutu tekrar uykuya geçer.

| LED'ler | Anlamı |
|---|---|
| Seçili odaların LED'leri yanıp sönüyor | Komut gönderiliyor |
| Seçili odalar 2 kez yavaşça yanıp söner | Tamam, robot yola çıktı |
| Tüm LED'ler 6 kez hızlı yanıp söner | Hata (Wi-Fi'ye ya da robota ulaşılamadı) |
| Tüm LED'ler 2 kez kısa yanıp söner | Hiç oda seçmeden Başlat'a bastın |
| Tüm LED'ler 3 kez uzun yanar | Pil zayıf (pil ölçümü bağlıysa) |
| LED'ler sırayla yanıp söner | Kumandaya güç verildi, hazır |

## Malzeme listesi

| Malzeme | Adet | Not |
|---|---|---|
| ESP32 DevKit (elindeki) | 1 | |
| Buton (12 mm, anlık / basınca kapanan) | 8 | 6 oda + Başlat + Eve Dön |
| 5 mm LED | 6 | Her odanın üstüne bir tane |
| 330 Ω direnç | 6 | Her LED'e bir tane |
| Proje kutusu | 1 | Yaklaşık 12×8×4 cm |
| Kablo, havya, buton etiketleri | | |

Başlat butonu için farklı renkte (örneğin yeşil) bir buton seçersen kullanımı kolaylaşır.

## Bağlantı şeması

**Butonlar:** Bir ucu **3.3V**'a, diğer ucu ESP32 pinine bağlanır. Dirence
gerek yok, ESP32'nin içindeki dirençler kullanılıyor.

**LED'ler:** ESP32 pini → 330 Ω direnç → LED'in uzun bacağı (+). LED'in kısa
bacağı (−) **GND**'ye gider.

| Oda | Buton pini | LED pini |
|---|---|---|
| Mutfak | GPIO 32 | GPIO 23 |
| Oturma Odası | GPIO 33 | GPIO 22 |
| Salon | GPIO 25 | GPIO 21 |
| Koridor | GPIO 26 | GPIO 19 |
| Çocuk Odası | GPIO 27 | GPIO 18 |
| Yatak Odası | GPIO 14 | GPIO 17 |
| **Başlat** | GPIO 13 | – |
| **Eve Dön** | GPIO 4 | – |

```
  BUTONLAR                               LED'LER

  3V3 ──┬─────┬─ ... ─┬─────┬─────┐      GPIO23 ──[330Ω]──(+LED−)──┐
        │     │       │     │     │      GPIO22 ──[330Ω]──(+LED−)──┤
      [Mut] [Otu]   [Yat] [BAŞ] [EVE]    GPIO21 ──[330Ω]──(+LED−)──┤
        │     │       │     │     │      GPIO19 ──[330Ω]──(+LED−)──┤
     GPIO32 GPIO33 GPIO14 GPIO13 GPIO4   GPIO18 ──[330Ω]──(+LED−)──┤
                                         GPIO17 ──[330Ω]──(+LED−)──┤
                                                                  GND
```

- Kartın üzerindeki pin adları "D23", "G23" ya da sadece "23" diye yazılmış olabilir, hepsi aynı anlama gelir.
- Buton pinlerini değiştirmek istersen sadece şunları kullan:
  **32, 33, 25, 26, 27, 14, 13, 4**. Uykudan uyandırabilen pinler bunlar.
- **GPIO12'yi kullanma**, basılıyken kart açılmayabilir.
- Kartının üzerinde "WROVER" yazıyorsa GPIO16 ve 17 kullanılamaz. Yatak Odası LED'i
  için 17 yerine **5** kullan ve `config.h`'de de değiştir.
- Kartın üstündeki mavi LED (GPIO2) komut gönderilirken yanar.

## Güç: prizden mi, pille mi?

**En kolayı:** Telefon şarj adaptörüyle USB'den besle. Pil derdi olmaz.

**Pille kullanmak istersen:** Normal ESP32 DevKit kartlarında USB çipi, voltaj
regülatörü ve kırmızı güç LED'i uykudayken de akım çeker. 2000 mAh'lik bir pil
bu yüzden kartına göre yaklaşık **1–3 hafta** gider. Daha uzun dayanması için:

1. 18650 pil + **TP4056** şarj modülü + **HT7333** (ya da MCP1700-3.3) regülatör kullan.
2. Regülatörün çıkışını kartın **3V3** pinine bağla. VIN ya da 5V pinine bağlama,
   böylece karttaki regülatör devreden çıkar.
3. Kartın kırmızı güç LED'ini sökersen (ya da yolunu kesersen) tüketim daha da düşer.

Bu düzenlemelerle pil aylarca dayanır.

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
   `config.h`'ye yapıştıracağın hazır satırları ekrana yazar.
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
5. Kartı seç: **"ESP32 Dev Module"**.
6. *Yükle*'ye bas. Yükleme başlamazsa kartın üstündeki **BOOT** düğmesini
   "Connecting..." yazısı çıkana kadar basılı tut.
7. Yükleme bitince *Seri Monitör*'ü aç (115200 baud) ve bir butona bas. Ne olup
   bittiğini satır satır görürsün.

## Ayarlar (`config.h`)

| Ayar | Ne işe yarar |
|---|---|
| `SECIM_ZAMAN_ASIMI_MS` | Bu kadar milisaniye butona basılmazsa seçim silinir ve kutu uyur (varsayılan 30000 = 30 sn) |
| `BOS_BASLAT_TUM_EV` | Oda seçmeden Başlat'a basılırsa: 1 = bütün evi süpürür, 0 = hiçbir şey yapmaz |
| `TEKRAR_SAYISI` | Her oda kaç tur süpürülsün (1–3) |
| `MESGULSE_DURDUR` | Robot o an başka bir iş yapıyorsa: 1 = durdurup yeni odalara geçer, 0 = hata verir |
| `EVE_DON_PIN` | "Eve Dön" butonunun pini. Bu butonu istemiyorsan -1 yap |
| `DURUM_LED_PIN` | Komut gönderilirken yanan LED (DevKit'in mavi LED'i: 2). İstemezsen -1 |
| `PIL_PIN` | Pil ölçüm pini (iki 100 kΩ dirençle bölücü yapıp GPIO35'e bağla). Ölçüm yoksa -1 |

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| LED yanmıyor | LED ters takılmış olabilir. Uzun bacak (+) dirence, kısa bacak GND'ye gitmeli. |
| 6 hızlı yanıp sönme, Seri Monitör'de "Wi-Fi baglanamadi" | Wi-Fi adını ve şifresini kontrol et. Ağ 2.4 GHz mi? Sabit IP'yi kapatıp (`KUMANDA_SABIT_IP` satırının başına `//` koyarak) dene. |
| "Robota baglanilamadi" | `ROBOT_IP` doğru mu? Robot ile ESP32 aynı ağda mı? Misafir ağı ya da "AP izolasyonu" açıksa kapat. |
| "yanit zaman asimi" | `LOCAL_KEY` yanlış olabilir. Robotu sıfırladıysan ya da uygulamaya yeniden eklediysen key değişir, `kurulum.py`'yi tekrar çalıştır. |
| Yanlış oda süpürülüyor | Haritayı yeniden oluşturduysan oda numaraları değişir. `kurulum.py`'yi tekrar çalıştır. |
| Kutu kendi kendine uyanıyor | Buton kabloları uzunsa parazit alıyor olabilir. Her buton pini ile GND arasına 100 kΩ direnç ekle. |

## Dosyalar

```
RobotSupurgeKumanda/
├── RobotSupurgeKumanda/          ← Arduino projesi (bu klasörü aç)
│   ├── RobotSupurgeKumanda.ino   ← ana program: butonlar, LED'ler, uyku, Wi-Fi
│   ├── config.h                  ← SENİN AYARLARIN
│   └── roborock_local.h/.cpp     ← Roborock yerel ağ protokolü
├── kurulum/kurulum.py            ← robotun IP, key ve oda numaralarını bulur
└── test/                         ← testler (geliştirici için)
    ├── run_tests.sh              ← protokol testleri
    └── run_sim.sh                ← buton akışı simülasyonu
```

## Teknik not

Roborock S8, ev ağında **TCP 58867** portundan şifreli komut kabul eder. Bu proje
Home Assistant'ın resmi Roborock entegrasyonunun kullandığı protokolü
(python-roborock) ESP32'ye taşır. Hem eski `1.0` (AES-ECB) hem de yeni firmware'lerin
`L01` (AES-GCM) protokolünü destekler ve hangisi gerekiyorsa onu otomatik seçer.

Roborock uygulaması, programlı temizlikler ve sesli asistanlar eskisi gibi
çalışmaya devam eder, kumanda bunlara karışmaz.
