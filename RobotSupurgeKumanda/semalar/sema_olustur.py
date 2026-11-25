"""Bağlantı şemalarını tek A4 sayfaya (üstte adaptörlü, altta pilli) çizer.

Çıktı: baglanti_semalari.html (tarayıcıdan yazdırılabilir).
PDF için: tarayıcıda aç → Yazdır → "PDF olarak kaydet" (A4, kenar boşluğu: yok/varsayılan).
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

KIRMIZI = "#c62828"   # + besleme
SIYAH = "#222"        # GND
MAVI = "#1565c0"      # sinyal
MOR = "#6a1b9a"       # isteğe bağlı pil ölçümü
GRI = "#555"

W, H = 190, 128           # şema alanı (mm)
KART = (78, 8, 114, 98)   # ESP32 kartı x1 y1 x2 y2
BUS_3V3, BUS_GND = 8, 178
SATIR_UST = 13            # 3V3 / GND pini
def oda_y(i): return 22 + i * 10
Y_BASLAT, Y_EVE = 82, 92


class Svg:
    def __init__(self):
        self.p = []

    def add(self, s):
        self.p.append(s)

    def cizgi(self, pts, renk=MAVI, kalin=0.45, kesik=False):
        d = " ".join(f"{x},{y}" for x, y in pts)
        da = ' stroke-dasharray="1.6,1"' if kesik else ""
        self.add(f'<polyline points="{d}" fill="none" stroke="{renk}" stroke-width="{kalin}"'
                 f' stroke-linejoin="round"{da}/>')

    def nokta(self, x, y, renk=SIYAH):
        self.add(f'<circle cx="{x}" cy="{y}" r="0.9" fill="{renk}"/>')

    def yazi(self, x, y, t, boy=2.8, hiza="start", renk="#111", kalin=False, don=0):
        fw = ' font-weight="700"' if kalin else ""
        tr = f' transform="rotate({don} {x} {y})"' if don else ""
        self.add(f'<text x="{x}" y="{y}" font-size="{boy}" text-anchor="{hiza}" fill="{renk}"{fw}{tr}>{t}</text>')

    def kutu(self, x1, y1, x2, y2, dolgu="#fff", cizgi=SIYAH, r=1.5, kalin=0.45, kesik=False):
        da = ' stroke-dasharray="1.6,1"' if kesik else ""
        self.add(f'<rect x="{x1}" y="{y1}" width="{x2 - x1}" height="{y2 - y1}" rx="{r}" fill="{dolgu}"'
                 f' stroke="{cizgi}" stroke-width="{kalin}"{da}/>')

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm"'
                f' font-family="DejaVu Sans, Arial, sans-serif">' + "".join(self.p) + "</svg>")


# --------------------------------------------------------------- semboller

def buton(s, x, y):
    """Normalde açık buton: x..x+14."""
    s.add(f'<circle cx="{x}" cy="{y}" r="0.9" fill="#fff" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.add(f'<circle cx="{x + 14}" cy="{y}" r="0.9" fill="#fff" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.cizgi([(x + 1, y - 2.6), (x + 13, y - 2.6)], SIYAH, 0.5)
    s.cizgi([(x + 7, y - 2.6), (x + 7, y - 5)], SIYAH, 0.5)
    s.cizgi([(x + 5, y - 5), (x + 9, y - 5)], SIYAH, 0.5)


def direnc(s, x1, y, x2, etiket, renk=SIYAH):
    s.kutu(x1, y - 1.4, x2, y + 1.4, "#fff", renk, 0.3, 0.4)
    s.yazi((x1 + x2) / 2, y - 2.2, etiket, 2.2, "middle", renk)


def direnc_dikey(s, x, y1, y2, etiket, renk=SIYAH):
    s.kutu(x - 1.4, y1, x + 1.4, y2, "#fff", renk, 0.3, 0.4)
    s.yazi(x + 2.4, (y1 + y2) / 2 + 0.8, etiket, 2.2, "start", renk)


def led(s, x, y, isaret=False):
    """Anot solda (x), katot sağda (x+6)."""
    s.add(f'<polygon points="{x},{y - 2.6} {x},{y + 2.6} {x + 5},{y}" fill="#ffe082" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.cizgi([(x + 5, y - 2.6), (x + 5, y + 2.6)], SIYAH, 0.5)
    for dx in (1.5, 3.5):
        s.cizgi([(x + dx, y - 3), (x + dx + 2, y - 5)], "#e65100", 0.35)
        s.add(f'<polygon points="{x + dx + 2.3},{y - 5.4} {x + dx + 1},{y - 4.9} {x + dx + 2},{y - 4}" fill="#e65100"/>')
    if isaret:
        s.yazi(x - 0.5, y + 4.6, "+ uzun", 1.9, "end", GRI)
        s.yazi(x + 6, y + 4.6, "− kısa", 1.9, "start", GRI)


def pin(s, x, y, etiket, sag=False):
    s.kutu(x - 1, y - 1, x + 1, y + 1, "#c9a227", "#8d6e00", 0.2, 0.25)
    if sag:
        s.yazi(x - 2, y + 1, etiket, 2.4, "end", "#111", True)
    else:
        s.yazi(x + 2, y + 1, etiket, 2.4, "start", "#111", True)


# ------------------------------------------------------------- ortak kısım

def ortak(s, pilli):
    x1, y1, x2, y2 = KART
    # anten
    s.cizgi([(96, y1), (96, 2.5)], SIYAH, 0.5)
    s.add(f'<polygon points="93.5,2.5 98.5,2.5 96,5" fill="none" stroke="{SIYAH}" stroke-width="0.4"/>')
    s.yazi(99.5, 4, "Harici anten (32U kartta mutlaka takılı olmalı)", 2.2, "start", GRI)
    # kart
    s.kutu(x1, y1, x2, y2, "#e8eef6", "#37474f", 2, 0.6)
    # kartın ortası pin etiketleriyle dolu: adı dikey yaz
    s.yazi(97.6, 55, "ESP32  WROOM-32U", 4.2, "middle", "#37474f", True, -90)

    gnd_son = 123 if pilli else Y_EVE + 0
    # 3V3 ortak hattı ve butonlar
    s.cizgi([(x1, SATIR_UST), (BUS_3V3, SATIR_UST), (BUS_3V3, Y_EVE)], KIRMIZI, 0.6)
    pin(s, x1, SATIR_UST, "3V3")
    s.yazi(BUS_3V3 - 3, 55, "3V3 ortak hat (bütün butonlar)", 2.4, "middle", KIRMIZI, True, -90)
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
    s.cizgi([(x2, SATIR_UST), (BUS_GND, SATIR_UST), (BUS_GND, gnd_son)], SIYAH, 0.6)
    pin(s, x2, SATIR_UST, "GND", sag=True)
    s.yazi(BUS_GND + 4, 55, "GND ortak hat (bütün LED'ler)", 2.4, "middle", SIYAH, True, 90)
    for i, (ad, _, l) in enumerate(ODALAR):
        y = oda_y(i)
        pin(s, x2, y, f"GPIO{l}", sag=True)
        s.cizgi([(x2, y), (124, y)], MAVI)
        direnc(s, 124, y, 136, "330 Ω")
        s.cizgi([(136, y), (146, y)], MAVI)
        led(s, 146, y, isaret=(i == 0))
        s.cizgi([(151, y), (BUS_GND, y)], SIYAH)
        s.nokta(BUS_GND, y)
        s.yazi(155, y - 1.4, ad, 2.4, "start", "#111")
    # açıklama (sol üst boşluk)
    s.yazi(BUS_3V3, 5.2, "Buton: bir ucu 3V3 hattına, diğer ucu GPIO'ya. Direnç gerekmez.", 2.2, "start", GRI)
    s.yazi(BUS_3V3, 8.4, "Pin numaraları kartın üstünde yazar (D32, G32 ya da 32).", 2.2, "start", GRI)


def notlar(s, x, y, satirlar, baslik=None, renk="#111", cerceve="#90a4ae", dolgu="#f5f7f9", gen=60):
    yuk = 4 + 3.6 * len(satirlar) + (4 if baslik else 0)
    s.kutu(x, y, x + gen, y + yuk, dolgu, cerceve, 1.2, 0.35)
    yy = y + 4
    if baslik:
        s.yazi(x + 2, yy, baslik, 2.6, "start", renk, True)
        yy += 4
    for t in satirlar:
        s.yazi(x + 2, yy, t, 2.3, "start", renk)
        yy += 3.6


# --------------------------------------------------------------- şemalar

def adaptorlu():
    s = Svg()
    ortak(s, pilli=False)
    # USB soketi ve adaptör
    s.kutu(91, 98, 101, 102, "#455a64", "#263238", 0.5, 0.3)
    s.yazi(96, 101, "USB", 1.8, "middle", "#fff", True)
    s.cizgi([(96, 102), (96, 109)], SIYAH, 1.2)
    s.yazi(98, 106.5, "USB kablosu", 2.2, "start", GRI)
    s.kutu(76, 109, 116, 123, "#fffde7", "#f9a825", 2, 0.5)
    s.yazi(96, 114.5, "USB şarj adaptörü", 3, "middle", "#111", True)
    s.yazi(96, 119.5, "5V, en az 1A (telefon şarj aleti)", 2.2, "middle", "#333")
    notlar(s, 4, 105, ["• Pil, TP4056, MT3608 gerekmez", "• config.h → #define ADAPTOR_MODU 1",
                       "• Kutu: govde_adaptor.stl + kapak.stl"], "Bu düzende", gen=64)
    notlar(s, 124, 105, ["• Kutu hiç uyumaz, Wi-Fi hep açık", "• Başlat'a basınca robot anında çıkar",
                         "• LED: GPIO → 330 Ω → LED(+) → GND"], "Özellikler", gen=62)
    return s.svg()


def pilli():
    s = Svg()
    ortak(s, pilli=True)
    x1, y1, x2, y2 = KART
    # 5V pini kartın altında
    pin(s, 108, y2, "")
    s.yazi(108, y2 - 2, "5V/VIN", 2.2, "middle", "#111", True)
    # güç zinciri
    py1, py2 = 109, 123
    s.kutu(4, 104, 28, 127, "#e3f2fd", "#1565c0", 2, 0.5)
    s.yazi(16, 113.5, "18650", 3, "middle", "#111", True)
    s.yazi(16, 118, "pil", 2.4, "middle", "#333")
    s.yazi(26.5, py1 + 0.9, "+", 2.6, "end", KIRMIZI, True)
    s.yazi(26.5, py2 + 0.9, "−", 2.6, "end", SIYAH, True)

    s.kutu(38, 104, 64, 127, "#e8f5e9", "#2e7d32", 2, 0.5)
    s.yazi(51, 114, "TP4056", 3, "middle", "#111", True)
    s.yazi(51, 118.2, "şarj modülü", 2.1, "middle", "#333")
    s.yazi(51, 125.5, "USB: şarj girişi", 1.9, "middle", GRI)
    for t, y, hiza, xx in (("B+", py1, "start", 39), ("B−", py2, "start", 39),
                           ("OUT+", py1, "end", 63), ("OUT−", py2, "end", 63)):
        s.yazi(xx, y + 0.8, t, 2, hiza, "#111")

    s.kutu(76, 104, 104, 127, "#fff3e0", "#e65100", 2, 0.5)
    s.yazi(90, 112.5, "MT3608", 3, "middle", "#111", True)
    s.yazi(90, 116.6, "yükseltici", 2.1, "middle", "#333")
    s.yazi(90, 120.6, "çıkış 5.0V!", 2.3, "middle", KIRMIZI, True)
    for t, y, hiza, xx in (("IN+", py1, "start", 77), ("IN−", py2, "start", 77),
                           ("OUT+", py1, "end", 103), ("OUT−", py2, "end", 103)):
        s.yazi(xx, y + 0.8, t, 2, hiza, "#111")

    s.cizgi([(28, py1), (38, py1)], KIRMIZI, 0.6)
    s.cizgi([(28, py2), (38, py2)], SIYAH, 0.6)
    s.cizgi([(64, py1), (76, py1)], KIRMIZI, 0.6)
    s.cizgi([(64, py2), (76, py2)], SIYAH, 0.6)
    s.cizgi([(104, py1), (108, py1), (108, y2 + 1)], KIRMIZI, 0.6)
    s.cizgi([(104, py2), (BUS_GND, py2)], SIYAH, 0.6)
    s.nokta(BUS_GND, py2)

    # isteğe bağlı pil uyarısı bölücüsü
    pin(s, x2, Y_BASLAT, "GPIO35", sag=True)
    s.cizgi([(x2, Y_BASLAT), (124, Y_BASLAT)], MOR, 0.45, True)
    s.nokta(124, Y_BASLAT, MOR)
    direnc(s, 136, Y_BASLAT, 148, "100 kΩ", MOR)
    s.cizgi([(124, Y_BASLAT), (136, Y_BASLAT)], MOR, 0.45, True)
    s.cizgi([(148, Y_BASLAT), (BUS_GND, Y_BASLAT)], MOR, 0.45, True)
    s.nokta(BUS_GND, Y_BASLAT)
    s.cizgi([(124, Y_BASLAT), (124, 85)], MOR, 0.45, True)
    direnc_dikey(s, 124, 85, 93, "100 kΩ", MOR)
    s.cizgi([(124, 93), (124, 96.5)], MOR, 0.45, True)
    s.yazi(124, 99, "→ 18650 (+)", 2.2, "middle", MOR, True)
    s.yazi(140, 88.5, "İsteğe bağlı: pil uyarısı", 2.1, "start", MOR, True)
    s.yazi(140, 91.6, "config.h → PIL_PIN 35", 2.1, "start", MOR)
    s.cizgi([(33, py1), (33, 101.5)], MOR, 0.45, True)
    s.nokta(33, py1, MOR)
    s.yazi(33, 100.5, "→ bölücüye", 2.1, "middle", MOR, True)

    notlar(s, 116, 103, ["1) ESP32'yi bağlamadan ÖNCE MT3608", "    çıkışını ölç, trimpotla 5.0V yap.",
                         "2) Programlarken pili çıkar."], "DİKKAT", KIRMIZI, KIRMIZI, "#ffebee", gen=58)
    s.yazi(116, 126.5, "config.h → ADAPTOR_MODU 0   •   Kutu: govde_pilli.stl", 2.1, "start", GRI)
    return s.svg()


SAYFA = """<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>Bağlantı Şemaları</title>
<style>
  @page {{ size: A4; margin: 7mm 8mm; }}
  html, body {{ margin: 0; background: #fff; }}
  body {{ font-family: "DejaVu Sans", Arial, sans-serif; color: #111; }}
  section {{ height: 140mm; display: flex; flex-direction: column; align-items: center; }}
  section + section {{ border-top: 0.3mm dashed #999; padding-top: 2mm; }}
  h2 {{ font-size: 12.5pt; margin: 0 0 1mm; width: 190mm; }}
  h2 small {{ font-weight: normal; font-size: 9pt; color: #555; }}
  @media screen {{ body {{ width: 210mm; margin: 0 auto; padding: 7mm 0; }} }}
</style></head><body>
<section>
  <h2>1) Adaptörlü — prizden, USB şarj aleti ile <small>(en kolayı, pil derdi yok)</small></h2>
  {adaptor}
</section>
<section>
  <h2>2) Pilli — 18650 + TP4056 + MT3608 <small>(haftada bir şarj)</small></h2>
  {pil}
</section>
</body></html>"""


def main():
    hedef = Path(__file__).with_name("baglanti_semalari.html")
    hedef.write_text(SAYFA.format(adaptor=adaptorlu(), pil=pilli()), encoding="utf-8")
    print(hedef)


if __name__ == "__main__":
    main()
