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

| Yöntem | Çalışır mı? | Pil ömrü (2000 mAh) |
|---|---|---|
| **USB şarj adaptörü** (telefon şarj aleti) | Evet, en kolayı | Sınırsız |
| Pil + **5V yükseltici** (MT3608, XL6009, powerbank kartı) → ESP32'nin **5V/VIN** pini | Evet | Yaklaşık **1 hafta** |
| Pil + **ayarlı düşürücü** (LM2596, Mini-360) | **Hayır**. Tek Li-ion pil (3.0–4.2V), 3.3V çıkış için yetmez | – |
| Pil + **AMS1117-3.3 modülü** | **Hayır**. Aynı sorun, pil yarılanınca kart kapanır | – |
| Pil + **düşük tüketimli 3.3V regülatör** → ESP32'nin **3V3** pini | Evet, en iyisi | **Aylarca** |

**Neden 5V yükseltici ile pil kısa gider?** Yükseltici kart, ESP32'nin kendi
regülatörü ve kırmızı güç LED'i, kutu uykudayken bile sürekli akım çeker.

**Düşük tüketimli 3.3V regülatör:** HT7333 bulamazsan şunlardan herhangi biri
aynı işi görür: **MCP1700-3302**, **XC6206P332**, **ME6211C33**, **HT7533**.
Hepsi çok ucuz (birkaç lira) ve küçük parçalar.

### Elindeki 5V yükseltici kartla bağlantı

```
18650 pil ── TP4056 (B+ / B−) ── TP4056 (OUT+ / OUT−) ── yükseltici IN+ / IN−
                                                         yükseltici OUT+ ── ESP32 VIN (5V)
                                                         yükseltici OUT− ── ESP32 GND
```

> **DİKKAT:** Ayarlı yükseltici kartlar 12V, hatta 28V'a kadar çıkabilir ve
> ESP32'yi yakar. ESP32'yi bağlamadan **önce** kartın çıkışını multimetreyle ölç ve
> üstündeki trimpotu çevirerek **5.0V**'a ayarla.

Pil ömrünü uzatmak için ESP32 kartındaki kırmızı güç LED'ini sökebilirsin. Bu
1 haftayı yaklaşık 2 haftaya çıkarır.

### Düşük tüketimli regülatörle bağlantı (aylarca dayanır)

```
18650 pil ── TP4056 ── OUT+ ── regülatör IN    regülatör OUT ── ESP32 3V3 pini
                       OUT− ── regülatör GND ─────────────────── ESP32 GND
```

Bu bağlantıda kart **VIN/5V** pininden değil, **3V3** pininden beslenir. Ayrıca
kırmızı güç LED'ini de sök. Programlarken USB kablosu takılıysa pili çıkar.

## 3D baskı kutu

`kutu/` klasöründe hazır baskı dosyaları var:

| Dosya | Ne |
|---|---|
| `govde.stl` | Alt kutu (112 × 140 × 52 mm) |
| `kapak.stl` | Butonların takıldığı ön panel, oda adları yazılı |
| `kutu.scad` | Düzenlenebilir tasarım (OpenSCAD) |

![Kapak](kutu/resimler/kapak.png)

**Kutunun özellikleri:**
- Kapakta 6 oda butonu (12 mm), her birinin üstünde LED deliği (5 mm) ve altında oda adı yazısı var.
- Başlat butonunun etrafında halka var, kolay bulunuyor.
- Kapağın iç yüzünde her deliğin yanına **ESP32 pin numarası** yazılı. Kablolarken neyi nereye bağlayacağını oradan görürsün.
- Gövdenin içinde ESP32 için 4 ayak var. Kart, altına jumper kablo sığacak yükseklikte oturur, USB girişi alttaki delikten dışarı bakar.
- 18650 pil yuvası için kızak ve TP4056 şarj modülü için ikinci bir USB deliği var.
- Duvara asmak için arkada 2 anahtar deliği var (vida başı en fazla 8 mm).
- Kapak 4 adet M3 vidayla (ya da 3 mm sunta vidasıyla) kapanır. Vida boyu 10–12 mm olmalı.

**Baskı ayarları:** PLA ya da PETG, 0.2 mm katman, %20 doluluk. **Destek gerekmez.**
- Gövde: tabanı tablaya gelecek şekilde (dosyadaki gibi).
- Kapak: yazılı yüzü tablaya gelecek şekilde (dosya zaten öyle çevrili).
- Yazıların farklı renkte çıkmasını istersen dilimleyicide (Cura, PrusaSlicer, Bambu
  Studio) 0.8 mm'de filament değiştir.

**Ölçüleri değiştirmek için:** `kutu.scad` dosyasını ücretsiz **OpenSCAD**
programıyla aç. *Pencere → Özelleştirici* menüsünden ayarları değiştir: buton
çapı, kutu derinliği, kart ölçüsü, oda adları gibi. Sonra **F6** ile oluştur,
**F7** ile STL olarak kaydet.

> **Butonlarını almadan önce ölç:** Butonun kapak altında kalan boyu (kablo uçları
> dahil) **25 mm**'den uzunsa `buton_govde` ve `derinlik` değerlerini büyüt. Butonun
> delik çapı 12 mm değilse `buton_delik` değerini değiştir. Kapak 2.6 mm kalınlığında,
> panel butonlarının somunu rahatça takılır.

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
├── kutu/                         ← 3D baskı kutu (govde.stl, kapak.stl, kutu.scad)
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
