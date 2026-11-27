"""A4 bağlantı şeması sayfasını üretir (adaptörlü kumanda).

Çıktı: baglanti_semasi.html — tarayıcıda açıp Yazdır → A4 ile basılabilir.
PDF zaten hazır: baglanti_semasi.pdf
"""

from pathlib import Path

ODALAR = [  # ad, buton pini, LED pini  (config.h ile aynı)
    ("Mutfak", 32, 23),
    ("Oturma Odası", 33, 22),
    ("Salon", 25, 21),
    ("Koridor", 26, 19),
    ("Çocuk Odası", 27, 18),
    ("Yatak Odası", 14, 17),
]
BASLAT_PIN, EVE_DON_PIN = 13, 4

KIRMIZI = "#c62828"   # 3V3
SIYAH = "#222"        # GND
MAVI = "#1565c0"      # sinyal
GRI = "#555"

W, H = 190, 124           # şema alanı (mm)
KART = (78, 12, 114, 100)  # ESP32 kartı x1 y1 x2 y2
BUS_3V3, BUS_GND = 8, 178
SATIR_UST = 17            # 3V3 / GND pini
def oda_y(i): return 26 + i * 10
Y_BASLAT, Y_EVE = 86, 96


class Svg:
    def __init__(self):
        self.p = []

    def add(self, s):
        self.p.append(s)

    def cizgi(self, pts, renk=MAVI, kalin=0.45):
        d = " ".join(f"{x},{y}" for x, y in pts)
        self.add(f'<polyline points="{d}" fill="none" stroke="{renk}" stroke-width="{kalin}" stroke-linejoin="round"/>')

    def nokta(self, x, y, renk=SIYAH):
        self.add(f'<circle cx="{x}" cy="{y}" r="0.9" fill="{renk}"/>')

    def yazi(self, x, y, t, boy=2.8, hiza="start", renk="#111", kalin=False, don=0):
        fw = ' font-weight="700"' if kalin else ""
        tr = f' transform="rotate({don} {x} {y})"' if don else ""
        self.add(f'<text x="{x}" y="{y}" font-size="{boy}" text-anchor="{hiza}" fill="{renk}"{fw}{tr}>{t}</text>')

    def kutu(self, x1, y1, x2, y2, dolgu="#fff", cizgi=SIYAH, r=1.5, kalin=0.45):
        self.add(f'<rect x="{x1}" y="{y1}" width="{x2 - x1}" height="{y2 - y1}" rx="{r}" fill="{dolgu}"'
                 f' stroke="{cizgi}" stroke-width="{kalin}"/>')

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm"'
                f' font-family="DejaVu Sans, Arial, sans-serif">' + "".join(self.p) + "</svg>")


def buton(s, x, y):
    """Normalde açık buton: x..x+14."""
    for xx in (x, x + 14):
        s.add(f'<circle cx="{xx}" cy="{y}" r="0.9" fill="#fff" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.cizgi([(x + 1, y - 2.6), (x + 13, y - 2.6)], SIYAH, 0.5)
    s.cizgi([(x + 7, y - 2.6), (x + 7, y - 5)], SIYAH, 0.5)
    s.cizgi([(x + 5, y - 5), (x + 9, y - 5)], SIYAH, 0.5)


def direnc(s, x1, y, x2, etiket):
    s.kutu(x1, y - 1.4, x2, y + 1.4, "#fff", SIYAH, 0.3, 0.4)
    s.yazi((x1 + x2) / 2, y - 2.2, etiket, 2.2, "middle", SIYAH)


def led(s, x, y, isaret=False):
    """Anot solda (x), katot sağda (x+5)."""
    s.add(f'<polygon points="{x},{y - 2.6} {x},{y + 2.6} {x + 5},{y}" fill="#81c784" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.cizgi([(x + 5, y - 2.6), (x + 5, y + 2.6)], SIYAH, 0.5)
    for dx in (1.5, 3.5):
        s.cizgi([(x + dx, y - 3), (x + dx + 2, y - 5)], "#e65100", 0.35)
        s.add(f'<polygon points="{x + dx + 2.3},{y - 5.4} {x + dx + 1},{y - 4.9} {x + dx + 2},{y - 4}" fill="#e65100"/>')
    if isaret:
        s.yazi(x - 0.5, y + 4.6, "+ uzun bacak", 1.9, "end", GRI)
        s.yazi(x + 6, y + 4.6, "− kısa bacak", 1.9, "start", GRI)


def pin(s, x, y, etiket, sag=False):
    s.kutu(x - 1, y - 1, x + 1, y + 1, "#c9a227", "#8d6e00", 0.2, 0.25)
    s.yazi(x - 2 if sag else x + 2, y + 1, etiket, 2.4, "end" if sag else "start", "#111", True)


def sema():
    s = Svg()
    x1, y1, x2, y2 = KART
    # anten
    s.cizgi([(96, y1), (96, 5.5)], SIYAH, 0.5)
    s.add(f'<polygon points="93.5,5.5 98.5,5.5 96,8" fill="none" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.yazi(99.5, 7, "Harici anten — 32U kartta mutlaka takılı olmalı", 2.3, "start", "#111", True)
    # kart
    s.kutu(x1, y1, x2, y2, "#e8eef6", "#37474f", 2, 0.6)
    s.yazi(97.6, 58, "ESP32  WROOM-32U", 4.2, "middle", "#37474f", True, -90)
    # açıklamalar (sol üst)
    s.yazi(BUS_3V3, 4, "Buton: bir ucu 3V3 hattına, diğer ucu GPIO pinine. Direnç gerekmez.", 2.2, "start", GRI)
    s.yazi(BUS_3V3, 7.2, "Pin numaraları kartın üstünde yazar (D32, G32 ya da 32).", 2.2, "start", GRI)

    # 3V3 ortak hattı ve butonlar
    s.cizgi([(x1, SATIR_UST), (BUS_3V3, SATIR_UST), (BUS_3V3, Y_EVE)], KIRMIZI, 0.6)
    pin(s, x1, SATIR_UST, "3V3")
    s.yazi(BUS_3V3 - 3, 58, "3V3 ortak hat (bütün butonlar)", 2.4, "middle", KIRMIZI, True, -90)
    satirlar = [(ad, b, oda_y(i), False) for i, (ad, b, _) in enumerate(ODALAR)]
    satirlar += [("BAŞLAT", BASLAT_PIN, Y_BASLAT, True), ("EVE DÖN", EVE_DON_PIN, Y_EVE, True)]
    for ad, b, y, onemli in satirlar:
        if y != Y_EVE:
            s.nokta(BUS_3V3, y, KIRMIZI)
        s.cizgi([(BUS_3V3, y), (30, y)], KIRMIZI)
        buton(s, 30, y)
        s.cizgi([(44, y), (x1, y)], MAVI)
        s.yazi(47, y - 1.4, ad, 2.7, "start", "#111", onemli)
        pin(s, x1, y, f"GPIO{b}")

    # GND ortak hattı ve LED'ler
    s.cizgi([(x2, SATIR_UST), (BUS_GND, SATIR_UST), (BUS_GND, oda_y(5))], SIYAH, 0.6)
    pin(s, x2, SATIR_UST, "GND", sag=True)
    s.yazi(BUS_GND + 4, 47, "GND ortak hat (bütün LED'ler)", 2.4, "middle", SIYAH, True, 90)
    for i, (ad, _, l) in enumerate(ODALAR):
        y = oda_y(i)
        pin(s, x2, y, f"GPIO{l}", sag=True)
        s.cizgi([(x2, y), (124, y)], MAVI)
        direnc(s, 124, y, 136, "220 Ω")
        s.cizgi([(136, y), (146, y)], MAVI)
        led(s, 146, y, isaret=(i == 0))
        s.cizgi([(151, y), (BUS_GND, y)], SIYAH)
        if i < 5:
            s.nokta(BUS_GND, y)
        s.yazi(155, y - 1.4, ad, 2.4, "start", "#111")
    s.yazi(124, oda_y(5) + 7, "Yeşil LED + 220 Ω. Başka renk: aşağıdaki tablo.", 2.2, "start", GRI)

    # USB ve adaptör
    s.kutu(91, y2, 101, y2 + 4, "#455a64", "#263238", 0.5, 0.3)
    s.yazi(96, y2 + 3, "USB", 1.8, "middle", "#fff", True)
    s.cizgi([(96, y2 + 4), (96, 110)], SIYAH, 1.2)
    s.yazi(98, 107.5, "USB kablosu", 2.2, "start", GRI)
    s.kutu(72, 110, 120, 123, "#fffde7", "#f9a825", 2, 0.5)
    s.yazi(96, 115.5, "USB şarj adaptörü", 3, "middle", "#111", True)
    s.yazi(96, 120.3, "5V, en az 1A (telefon şarj aleti)", 2.2, "middle", "#333")
    return s.svg()


def pin_tablosu():
    satir = "".join(f"<tr><td>{ad}</td><td>GPIO{b}</td><td>GPIO{l}</td></tr>" for ad, b, l in ODALAR)
    satir += f"<tr><td><b>Başlat</b></td><td>GPIO{BASLAT_PIN}</td><td>–</td></tr>"
    satir += f"<tr><td><b>Eve Dön</b></td><td>GPIO{EVE_DON_PIN}</td><td>–</td></tr>"
    return ("<table><tr><th>Buton</th><th>Buton pini</th><th>LED pini</th></tr>" + satir +
            "<tr><td colspan=3 class=not>Butonların öbür ucu → <b>3V3</b> &nbsp;•&nbsp; "
            "LED'lerin kısa bacağı → <b>GND</b></td></tr></table>")


SAYFA = """<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>Bağlantı Şeması</title>
<style>
  @page {{ size: A4; margin: 8mm 8mm; }}
  html, body {{ margin: 0; background: #fff; }}
  body {{ font-family: "DejaVu Sans", Arial, sans-serif; color: #111; font-size: 8.6pt; }}
  @media screen {{ body {{ width: 194mm; margin: 0 auto; padding: 8mm 0; }} }}
  h1 {{ font-size: 15pt; margin: 0; }}
  .alt {{ color: #555; font-size: 9pt; margin: 0.5mm 0 1.5mm; }}
  h3 {{ font-size: 10pt; margin: 0 0 1.2mm; }}
  svg {{ display: block; width: 180mm; height: auto; margin: 0 auto; }}
  .ikili {{ display: flex; gap: 5mm; margin-top: 1.5mm; }}
  .ikili > div {{ flex: 1; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ border: 0.25mm solid #b0bec5; padding: 0.45mm 1.8mm; text-align: left; }}
  th {{ background: #eceff1; }}
  td.not {{ color: #444; font-size: 8pt; }}
  ul, ol {{ margin: 0; padding-left: 4.5mm; }}
  li {{ margin: 0.4mm 0; }}
  .dikkat {{ border: 0.35mm solid #c62828; background: #ffebee; border-radius: 1.5mm; padding: 1.5mm 2.5mm; }}
  .dikkat h3 {{ color: #c62828; }}
  .adimlar li {{ list-style: none; margin-left: -4.5mm; }}
  .kutucuk {{ display: inline-block; width: 3mm; height: 3mm; border: 0.3mm solid #333; margin-right: 1.5mm;
             vertical-align: -0.4mm; }}
  .notlar {{ margin-top: 2.5mm; border: 0.3mm dashed #90a4ae; border-radius: 1.5mm; padding: 1.5mm 2.5mm 2mm; }}
  .satirlar {{ display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; row-gap: 2.2mm; }}
  .satirlar div {{ display: flex; align-items: flex-end; white-space: nowrap; }}
  .cizgi {{ flex: 1; border-bottom: 0.25mm solid #777; margin-left: 1.5mm; height: 3.5mm; }}
  code {{ font-family: "DejaVu Sans Mono", monospace; font-size: 8pt; background: #f1f3f4; padding: 0 0.6mm; }}
</style></head><body>
<h1>Robot Süpürge Kumandası — Bağlantı Şeması</h1>
<div class="alt">ESP32-WROOM-32U • USB adaptör • yeşil LED • hazır kutu
  <span style="float:right;font-weight:bold;color:#c62828">GÜNCEL: 27.11.2026</span></div>
{sema}
<div class="ikili">
  <div>
    <h3>Bağlantı tablosu</h3>
    {tablo}
  </div>
  <div>
    <h3>LED direnci (LED rengine göre)</h3>
    <table>
      <tr><th>LED rengi</th><th>Direnç</th></tr>
      <tr style="background:#e8f5e9;font-weight:bold"><td>Yeşil (önerilen)</td><td>220 Ω</td></tr>
      <tr><td>Kırmızı, sarı, turuncu</td><td>330 Ω</td></tr>
      <tr><td>Mavi, beyaz</td><td>68–100 Ω</td></tr>
    </table>
    <div class="dikkat" style="margin-top:2mm">
      <h3>Dikkat</h3>
      <ul>
        <li>Kablolarken USB kablosu <b>takılı olmasın</b>.</li>
        <li>LED direncini <b>asla atlama</b>, LED ve ESP32 bozulur.</li>
        <li>32U kartta <b>anten takılı</b> olmalı, yoksa Wi-Fi çalışmaz.</li>
        <li>Wi-Fi <b>2.4 GHz</b> olmalı (5 GHz'e bağlanmaz).</li>
      </ul>
    </div>
  </div>
</div>
<div class="ikili">
  <div class="adimlar">
    <h3>Kurulum adımları</h3>
    <ol>
      <li><span class="kutucuk"></span>Bilgisayarda <code>kurulum/kurulum.py</code> çalıştır, çıkan satırları not al.</li>
      <li><span class="kutucuk"></span>Modemden robota sabit IP ver (DHCP rezervasyonu).</li>
      <li><span class="kutucuk"></span><code>config.h</code>: Wi-Fi adı/şifresi + kurulum satırları.</li>
      <li><span class="kutucuk"></span>Arduino IDE → kart: <b>ESP32 Dev Module</b> → Yükle.</li>
      <li><span class="kutucuk"></span>Kutuyu del: 8 × 12 mm (buton), 6 × 5 mm (LED), yanda USB kablosu.</li>
      <li><span class="kutucuk"></span>Butonları, LED'leri kapağa tak, bu şemaya göre kablola.</li>
      <li><span class="kutucuk"></span>Kartı kutunun dibine köpük bantla yapıştır, anteni tak, kapağı kapat.</li>
      <li><span class="kutucuk"></span>Adaptörü tak → LED'ler sırayla yanarsa hazır.</li>
    </ol>
  </div>
  <div>
    <h3>Işıklar ne anlama gelir?</h3>
    <table>
      <tr><td>Oda LED'i yanıyor</td><td>O oda seçili</td></tr>
      <tr><td>Seçili LED'ler yanıp sönüyor</td><td>Komut gönderiliyor</td></tr>
      <tr><td>Seçili LED'ler 2 kez yavaş</td><td>Tamam, robot yola çıktı</td></tr>
      <tr><td>Tüm LED'ler 6 kez hızlı</td><td>Hata (Wi-Fi ya da robot)</td></tr>
      <tr><td>Tüm LED'ler 2 kez kısa</td><td>Önce oda seç</td></tr>
      <tr><td>Bir oda LED'i 3 kez hızlı</td><td>O oda bu robotta yok</td></tr>
      <tr><td>Kartın mavi LED'i yanıp sönüyor</td><td>Wi-Fi bağlantısı yok</td></tr>
    </table>
  </div>
</div>
<div class="notlar">
  <h3>Kendi notların <span style="font-weight:normal;color:#555">(kurulum.py'nin verdiği bilgiler)</span></h3>
  <div class="satirlar">
    <div>Robot IP: <span class="cizgi"></span></div>
    <div>Local key: <span class="cizgi"></span></div>
    <div>Wi-Fi adı: <span class="cizgi"></span></div>
    <div>Robot adı: <span class="cizgi"></span></div>
    {segmentler}
  </div>
</div>
</body></html>"""


def main():
    hedef = Path(__file__).with_name("baglanti_semasi.html")
    segmentler = "".join(f'<div>{ad} segment no: <span class="cizgi"></span></div>' for ad, _, _ in ODALAR)
    hedef.write_text(SAYFA.format(sema=sema(), tablo=pin_tablosu(), segmentler=segmentler), encoding="utf-8")
    print(hedef)


if __name__ == "__main__":
    main()
