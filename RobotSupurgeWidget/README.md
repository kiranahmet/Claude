# Robot Süpürge Widget'ı (Android)

Telefonun ana ekranına eklenen bir widget. Üzerinde oda adları yazan butonlar var:
odalara dokun, **BAŞLAT**'a bas, robot seçtiğin odaları süpürsün. Kutudaki ESP32
kumandasıyla aynı şekilde çalışır ve robota **ev Wi-Fi'si üzerinden doğrudan** komut
gönderir (bulut yok, Roborock uygulaması açık olmasına gerek yok).

- Android 7 ve üstü
- Uygulama boyutu: ~630 KB, ek izin yok (sadece internet/ağ erişimi)
- Telefon **evin Wi-Fi'sine bağlıyken** çalışır. Dışarıdayken ya da mobil veride çalışmaz.

## Kurulum

1. **APK'yı telefona gönder.** `RobotSupurgeWidget.apk` dosyasını WhatsApp, e-posta,
   Google Drive ya da USB kablosuyla telefona at.
2. **Dosyayı aç ve kur.** Telefon "bilinmeyen kaynaklardan yükleme" izni isteyebilir:
   açtığın uygulama (örn. Dosyalar ya da WhatsApp) için izin ver. Google Play Protect
   uyarı verirse **"Yine de yükle"**ye bas. Bu uygulama Play Store'dan gelmediği için
   bu uyarı normal.
3. **"Robot Süpürge" uygulamasını aç** ve bilgileri gir:
   - **Robotun IP adresi:** `kurulum.py`'nin verdiği IP (Hacer'in robotu: 192.168.1.135)
   - **Local key:** `kurulum.py`'nin verdiği 16 karakterlik key
   - **Odalar:** Her satıra bir oda, `Oda adı = numara` şeklinde (en fazla 8):
     ```
     Oturma Odası = 16
     Koridor = 17
     Balkon = 18
     Çocuk Odası = 20
     ```
4. **Kaydet**'e, ardından **Bağlantıyı dene**'ye bas. "✓ Robot yanıt verdi" yazısını
   görmelisin (robot hareket etmez, sadece pil durumunu sorar).
5. **Widget'ı ana ekrana ekle:** Ana ekranda boş bir yere **uzun bas → Widget'lar →
   Robot Süpürge** → sürükleyip bırak. Kenarlarından tutup büyütebilir/küçültebilirsin.

## Kullanım

| Ne yaparsın | Ne olur |
|---|---|
| Oda adına dokun | Oda seçilir (mavi olur). Tekrar dokunursan seçim kalkar |
| **BAŞLAT** | Seçili odalar süpürülür. Butonda kaç oda seçili olduğu yazar |
| **EVE DÖN** | Robot ne yapıyorsa bırakır, istasyona döner |
| Widget'ın başlığına dokun | Ayar ekranı açılır |

Widget'ın üst satırı ne olduğunu yazar: "Gönderiliyor…", "✓ Yola çıktı: Koridor,
Balkon (14:32)", "✗ Robota ulaşılamadı…" gibi.

Robot o an başka bir iş yapıyorsa (örneğin başka odayı süpürüyorsa) widget mevcut işi
durdurup yeni odalara gönderir.

**Tek dokunuş modu:** Ayarlardaki "Tek dokunuşla başlat" açılırsa odaya dokununca
robot hemen o odaya gider, BAŞLAT butonu gizlenir.

## Sorun giderme

| Mesaj | Çözüm |
|---|---|
| "Robota ulaşılamadı. Telefon evin Wi-Fi'sinde mi?" | Telefon evin Wi-Fi'sine bağlı mı? Robot IP'si doğru mu? Modem robota yeni IP vermiş olabilir: `kurulum.py`'yi tekrar çalıştır ve modemde robota sabit IP ver (DHCP rezervasyonu). |
| "Robot cevap vermedi. Local key doğru mu?" | Key'i kontrol et. Robot sıfırlandıysa ya da uygulamaya yeniden eklendiyse key değişir. |
| "Kurulum gerekli" | Uygulamayı aç, bilgileri girip Kaydet'e bas. |
| Widget listede yok | Uygulamayı en az bir kez açtıktan sonra tekrar bak. Bazı telefonlarda widget listesi "Robot Süpürge" adının altında. |
| Güncelleme kurulmuyor ("paket çakışıyor") | Eski sürümü kaldırıp yenisini kur. |

## Başka robota geçmek

Uygulamayı aç, yeni robotun IP'sini, key'ini ve odalarını gir, Kaydet'e bas.
Widget kendiliğinden güncellenir.

## Geliştirici notları

- Kaynak kod: `app/src/main/java/com/robotsupurge/widget/`
  - `RoborockYerel.java`: Roborock yerel protokolü (1.0 AES-ECB ve L01 AES-GCM), ESP32 kodunun Java karşılığı
  - `OdaWidget.kt`: ana ekran widget'ı, `AyarlarActivity.kt`: ayar ekranı
- **Android Studio ile:** Bu klasörü aç, *Build → Build APK(s)*.
- **Android Studio olmadan:** `apk_derle.sh` (açıklaması dosyanın başında).
- Test: `test/run_tests.sh` protokolü python-roborock'un sahte robotuna karşı dener.
