"""Roborock kumanda kurulum yardımcısı.

Bilgisayarında bir kez çalıştırırsın. Şunları yapar:
  1. Roborock hesabına e-posta koduyla giriş yapar
  2. Süpürgenin IP adresini, local_key'ini ve oda (segment) numaralarını bulur
  3. ESP32'nin kullanacağı yerel bağlantıyı (bulutsuz, TCP 58867) test eder
  4. config.h'ye yapıştıracağın hazır satırları ekrana yazar

Kurulum:
    pip install python-roborock      (Python 3.11 veya üstü gerekir)
    python kurulum.py

Not: Şifren ya da kodun hiçbir yere kaydedilmez; yalnızca Roborock'un kendi
sunucusuna gönderilir (Roborock uygulamasının yaptığı gibi).
"""

import asyncio
import sys

try:
    from roborock.devices.device_manager import UserParams, create_device_manager
    from roborock.devices.transport.local_channel import LocalChannel
    from roborock.protocols.v1_protocol import RequestMessage, decode_rpc_response
    from roborock.roborock_message import RoborockMessageProtocol
    from roborock.web_api import RoborockApiClient
except ImportError:
    sys.exit("Önce kütüphaneyi kur:  pip install python-roborock   (Python 3.11+)")

# config.h'deki ile aynı: (ad, buton pini, LED pini)
ODALAR = [
    ("Mutfak", 32, 23),
    ("Oturma Odasi", 33, 22),
    ("Salon", 25, 21),
    ("Koridor", 26, 19),
    ("Cocuk Odasi", 27, 18),
    ("Yatak Odasi", 14, 17),
]

_TR = str.maketrans("ıİçÇşŞğĞüÜöÖ", "iicCsSgGuUoO")


def sade(ad: str) -> str:
    return "".join(ad.translate(_TR).lower().split())


async def yerel_komut(ip: str, key: str, duid: str, method: str, params=None):
    """ESP32'nin yaptığının aynısı: doğrudan robota TCP 58867 üzerinden komut."""
    kanal = LocalChannel(ip, key, duid)
    await kanal.connect()
    try:
        istek = RequestMessage(method=method, params=params)
        mesaj = istek.encode_message(
            RoborockMessageProtocol.GENERAL_REQUEST, version=kanal.protocol_version
        )
        sonuc = asyncio.get_running_loop().create_future()

        def yakala(m):
            try:
                r = decode_rpc_response(m)
            except Exception:  # noqa: BLE001 - ilgisiz bildirimler
                return
            if r.request_id == istek.request_id and not sonuc.done():
                sonuc.set_result(r)

        iptal = await kanal.subscribe(yakala)
        await kanal.publish(mesaj)
        try:
            r = await asyncio.wait_for(sonuc, 8)
        finally:
            iptal()
        if r.api_error:
            raise RuntimeError(f"Robot hata döndü: {r.api_error}")
        return kanal.protocol_version, r.data
    finally:
        kanal.close()


async def main():
    if len(sys.argv) == 6 and sys.argv[1] == "yerel-test":
        # Geliştirici testi: python kurulum.py yerel-test <ip> <local_key> <duid> <komut>
        _, _, ip, key, duid, method = sys.argv
        print(await yerel_komut(ip, key, duid, method))
        return

    email = input("Roborock uygulamasındaki e-posta adresin: ").strip()
    api = RoborockApiClient(email)
    print("Doğrulama kodu e-postana gönderiliyor...")
    await api.request_code()
    kod = input("E-postana gelen kodu gir: ").strip()
    user_data = await api.code_login(kod)
    print("Giriş başarılı. Cihazlar aranıyor (10-20 sn sürebilir)...\n")

    yonetici = await create_device_manager(UserParams(username=email, user_data=user_data))
    try:
        cihazlar = [c for c in await yonetici.get_devices() if c.v1_properties is not None]
        if not cihazlar:
            print("Hesapta desteklenen süpürge bulunamadı.")
            return
        for cihaz in cihazlar:
            await kur(cihaz)
    finally:
        await yonetici.close()


async def kur(cihaz):
    p = cihaz.v1_properties
    await p.start()
    print("=" * 64)
    print(f"Cihaz : {cihaz.name}  ({cihaz.product.model})")

    await p.network_info.refresh()
    ip = p.network_info.ip
    key = cihaz.device_info.local_key
    print(f"IP    : {ip}")
    print(f"Key   : {key}")

    await p.rooms.refresh()
    odalar = {r.segment_id: r.name for r in (p.rooms.rooms or [])}
    print("\nRobotun haritasındaki odalar:")
    for seg, ad in sorted(odalar.items()):
        print(f"  segment {seg:>3} = {ad}")

    print("\nYerel bağlantı (ESP32'nin kullanacağı yol) test ediliyor...")
    try:
        surum, durum = await yerel_komut(ip, key, cihaz.duid, "get_status")
        pil = durum[0].get("battery") if isinstance(durum, list) and durum else "?"
        print(f"  TAMAM: robot yerel ağdan yanıt verdi (protokol {surum}, pil %{pil}).")
    except Exception as e:  # noqa: BLE001
        print(f"  SORUN: yerel bağlantı kurulamadı: {e}")
        print("  - ESP32 ile robot aynı ağda mı? Misafir ağı / AP izolasyonu kapalı mı?")
        print("  - Bilgisayarın da aynı Wi-Fi'de olmalı.")

    # config.h için hazır satırlar
    ad_to_seg = {sade(ad): seg for seg, ad in odalar.items()}
    print("\n---------------- config.h'ye yapıştır ----------------")
    print(f"#define ROBOT_IP       {ip.replace('.', ', ')}")
    print(f'#define LOCAL_KEY      "{key}"')
    print("\nstatic const Oda ODALAR[] = {")
    print("  // ad              buton  LED  segment")
    for ad, buton, led in ODALAR:
        seg = ad_to_seg.get(sade(ad))
        yorum = "" if seg else "   // <-- eşleşmedi: yukarıdaki listeden doğru numarayı yaz"
        ad_alani = f'"{ad}",'
        print(f"  {{{ad_alani:<17} {buton:>3},   {led:>3},  {seg or 0}}},{yorum}")
    print("};")
    print("------------------------------------------------------\n")
    print("ÖNEMLİ: Modem arayüzünden robota sabit IP ver (DHCP rezervasyonu).")

    cevap = input("\nGerçek bir oda süpürme testi yapalım mı? Segment numarası yaz (boş = geç): ").strip()
    if cevap.isdigit():
        seg = int(cevap)
        print(f"'{odalar.get(seg, seg)}' süpürülüyor (yerel bağlantıyla)...")
        try:
            _, sonuc = await yerel_komut(ip, key, cihaz.duid, "app_segment_clean", [{"segments": [seg]}])
            print(f"  Robot yanıtı: {sonuc}")
            if input("Robotu istasyona geri göndereyim mi? (e/h): ").strip().lower().startswith("e"):
                await yerel_komut(ip, key, cihaz.duid, "app_charge")
        except Exception as e:  # noqa: BLE001
            print(f"  Hata: {e}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
