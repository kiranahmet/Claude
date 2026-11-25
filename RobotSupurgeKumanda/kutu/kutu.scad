// Robot Süpürge Kumandası — 3D baskı kutusu (OpenSCAD)
//
// İki parça: GÖVDE (alt kutu) + KAPAK (butonların takıldığı ön panel).
// Kapak 4 adet M3 vidayla (ya da 3 mm sunta vidası) gövdeye vidalanır.
//
// Ölçüleri değiştirmek için: OpenSCAD'de aç → Pencere → Özelleştirici
// (Window → Customizer). "parca" ile hangi parçayı göreceğini seç,
// F6 ile oluştur, F7 ile STL olarak kaydet.
//
// Baskı önerisi: PLA/PETG, 0.2 mm katman, %20 doluluk, destek GEREKMEZ.
//   Gövde: tabanı tablaya gelecek şekilde (olduğu gibi).
//   Kapak: yazılı yüzü tablaya gelecek şekilde (kapak.stl zaten öyle çevrili).

/* [Parça] */
parca = "montaj"; // [montaj, patlatilmis, govde, kapak, kapak_baski]

/* [Kutu ölçüleri (mm)] */
genislik = 112;   // X: yatay
boy      = 140;   // Y: dikey
derinlik = 52;    // gövde yüksekliği (kapak hariç)
duvar    = 2.2;
taban    = 2.4;
kapak    = 2.6;   // kapak plakası kalınlığı (panel butonları için ≤ 4 mm olmalı)
kose_r   = 7;
bosluk   = 0.3;   // parça oturma toleransı

/* [Butonlar ve LED'ler] */
buton_delik   = 12.2;  // 12 mm panel butonu
kontrol_delik = 12.2;  // Başlat ve Eve Dön butonları
led_delik     = 5.2;   // 5 mm LED (sıkı geçme)
buton_govde   = 25;    // butonun kapak altında kalan boyu (kablo uçları dahil)
kolon         = 33;    // oda butonları arası yatay mesafe
satir1_y      = 36;
satir2_y      = -2;
satir3_y      = -42;   // Başlat / Eve Dön satırı
kontrol_x     = 25;
led_mesafe    = 11;    // LED, butonun ne kadar üstünde

/* [Yazılar] */
font          = "Liberation Sans:style=Bold";
yazi          = 4.4;
yazi_kucuk    = 3.2;
yazi_derinlik = 0.8;
baslik        = "ROBOT SÜPÜRGE";
pin_yazilari  = true;  // kapağın içine bağlantı pin numaralarını yaz

/* [ESP32 kartı] */
kart_en   = 28.5;  // 30 pinli DevKit: 28.5 / 38 pinli: 28
kart_boy  = 52;    // 30 pinli DevKit: 51.5 / 38 pinli: 55
kart_ayak = 16;    // kartın tabandan yüksekliği (altına jumper kablo sığsın)
usb_en    = 13;
usb_yuk   = 9;

/* [Pil (isteğe bağlı)] */
pil_yuvasi = true;  // 18650 pil yuvası için kızak
pil_boy    = 78;
pil_en     = 21.5;
pil_yuk    = 20;
pil_y      = 40;
sarj_portu = true;  // TP4056 şarj modülü için ikinci USB deliği
sarj_x     = 30;

/* [Duvar askısı] */
duvar_askisi = true;  // arkaya 2 adet anahtar deliği (vida başı ≤ 8 mm)
aski_x       = 32;
aski_y       = 12;

/* [Gizli] */
$fn = 64;
W = genislik; H = boy;
ic_w = W - 2 * duvar;
ic_h = H - 2 * duvar;
vida_x = W / 2 - kose_r;
vida_y = H / 2 - kose_r;
kart_y0 = -H / 2 + duvar + 1.5;  // kartın USB ucu alt duvara bakar

etiketler = [["MUTFAK", ""], ["OTURMA", "ODASI"], ["SALON", ""],
             ["KORİDOR", ""], ["ÇOCUK", "ODASI"], ["YATAK", "ODASI"]];
// config.h ile aynı pinler (kapak içine yazılır)
buton_pinleri = [32, 33, 25, 26, 27, 14];
led_pinleri   = [23, 22, 21, 19, 18, 17];

function oda_xy(i) = [(i % 3 - 1) * kolon, i < 3 ? satir1_y : satir2_y];

// ------------------------------------------------------------------ kontroller

echo(str("Buton alti yuksekligi: ", derinlik - buton_govde, " mm"));
if (pil_yuvasi && taban + pil_yuk > derinlik - buton_govde)
  echo("UYARI: pil yuvasi butonlara degiyor, 'derinlik' degerini artir!");
if (taban + kart_ayak + 1.6 + 4 > derinlik - 2)
  echo("UYARI: ESP32 karti kapaga degiyor, 'derinlik' degerini artir!");

// -------------------------------------------------------------------- yardımcı

module yuvarlak(w, h, z, r) {
  linear_extrude(z) offset(r = r) square([w - 2 * r, h - 2 * r], center = true);
}

module kose_vidalari() {
  for (sx = [-1, 1], sy = [-1, 1]) translate([sx * vida_x, sy * vida_y, 0]) children();
}

module yazi_yaz(t, boyut) {
  text(t, size = boyut, font = font, halign = "center", valign = "center");
}

// ----------------------------------------------------------------------- gövde

module esp32_ayaklari() {
  // Kartın 4 köşesine oturduğu ayaklar (pin sıralarının dışında kalır)
  for (sx = [-1, 1], uc = [0, 1]) {
    kx = sx * kart_en / 2;
    ky = kart_y0 + uc * kart_boy;
    // 6.2 mm'lik blok, kart köşesinden 1.5 mm dışarı taşar (kenar tutucu)
    x0 = sx > 0 ? kx + 1.5 - 6.2 : kx - 1.5;
    y0 = uc > 0 ? ky + 1.5 - 6.2 : ky - 1.5;
    difference() {
      translate([x0, y0, taban - 0.01]) cube([6.2, 6.2, kart_ayak + 2.5]);
      // kartın oturduğu cep
      translate([-kart_en / 2 - bosluk, kart_y0 - bosluk, taban + kart_ayak])
        cube([kart_en + 2 * bosluk, kart_boy + 2 * bosluk, 10]);
    }
  }
}

module pil_kizagi() {
  ray_y = pil_en / 2 + 0.4 + 1;
  ray_x = pil_boy / 2 + 0.4 + 1;
  for (s = [-1, 1]) {
    translate([-ray_x - 1, pil_y + s * ray_y - 1, taban - 0.01]) cube([2 * ray_x + 2, 2, 6]);
    translate([s * ray_x - 1, pil_y - ray_y, taban - 0.01]) cube([2, 2 * ray_y, 6]);
  }
}

module aski_dolgusu() {
  for (s = [-1, 1]) translate([s * aski_x, aski_y + 4.5, 0]) cylinder(r = 9, h = taban + 3);
}

module aski_deligi() {
  for (s = [-1, 1]) translate([s * aski_x, aski_y, 0]) {
    translate([0, 0, -1]) cylinder(d = 8.5, h = 1.6 + 1);               // vida başı girişi
    hull() for (y = [0, 9]) translate([0, y, -1]) cylinder(d = 4.2, h = 10);  // kayma yarığı
    hull() for (y = [0, 9]) translate([0, y, 1.6]) cylinder(d = 8.5, h = 3);  // baş kanalı
  }
}

module govde() {
  difference() {
    union() {
      difference() {
        yuvarlak(W, H, derinlik, kose_r);
        translate([0, 0, taban]) yuvarlak(ic_w, ic_h, derinlik, kose_r - duvar);
      }
      kose_vidalari() cylinder(r = 4.5, h = derinlik);
      esp32_ayaklari();
      if (pil_yuvasi) pil_kizagi();
      if (duvar_askisi) aski_dolgusu();
    }
    // vida pilot delikleri (M3 sunta vidası / M3 vida)
    kose_vidalari() translate([0, 0, derinlik - 14]) cylinder(d = 2.6, h = 15);
    // ESP32 USB deliği (alt duvar)
    usb_z = taban + kart_ayak + 1.6 + 1.5;
    translate([-usb_en / 2, -H / 2 - 1, usb_z - usb_yuk / 2]) cube([usb_en, duvar + 2, usb_yuk]);
    // TP4056 şarj deliği
    if (sarj_portu)
      translate([sarj_x - 6, -H / 2 - 1, taban + 1]) cube([12, duvar + 2, 7]);
    if (duvar_askisi) aski_deligi();
  }
}

// ----------------------------------------------------------------------- kapak

module kapak_delikleri() {
  for (i = [0 : 5]) {
    translate(oda_xy(i)) cylinder(d = buton_delik, h = 20, center = true);
    translate(oda_xy(i) + [0, led_mesafe]) cylinder(d = led_delik, h = 20, center = true);
  }
  for (s = [-1, 1]) translate([s * kontrol_x, satir3_y]) cylinder(d = kontrol_delik, h = 20, center = true);
  // vida delikleri + havşa
  kose_vidalari() {
    cylinder(d = 3.4, h = 20, center = true);
    translate([0, 0, kapak - 1.6]) cylinder(d1 = 3.4, d2 = 6.6, h = 1.61);
  }
}

module ust_yazilar() {
  translate([0, 0, kapak - yazi_derinlik]) linear_extrude(yazi_derinlik + 1) {
    translate([0, H / 2 - 11]) yazi_yaz(baslik, 5);
    for (i = [0 : 5]) {
      p = oda_xy(i);
      translate(p + [0, -11.5]) yazi_yaz(etiketler[i][0], yazi);
      if (etiketler[i][1] != "") translate(p + [0, -16.8]) yazi_yaz(etiketler[i][1], yazi_kucuk);
    }
    translate([-kontrol_x, satir3_y - 13.5]) yazi_yaz("BAŞLAT", yazi);
    translate([kontrol_x, satir3_y - 13.5]) yazi_yaz("EVE DÖN", yazi);
    // Başlat'ın etrafında halka
    translate([-kontrol_x, satir3_y]) difference() { circle(r = 10.6); circle(r = 9.6); }
  }
}

module alt_pin_yazilari() {
  // Kapağın iç yüzüne, alttan bakınca okunacak şekilde (aynalı)
  translate([0, 0, -0.01]) linear_extrude(0.5) mirror([1, 0, 0]) {
    for (i = [0 : 5]) {
      p = oda_xy(i);
      translate([-p[0] - 11, p[1]]) yazi_yaz(str(buton_pinleri[i]), 3);
      translate([-p[0] - 7, p[1] + led_mesafe]) yazi_yaz(str(led_pinleri[i]), 2.6);
    }
    translate([kontrol_x - 11, satir3_y]) yazi_yaz("13", 3);
    translate([-kontrol_x - 11, satir3_y]) yazi_yaz("4", 3);
    translate([0, satir3_y - 12]) yazi_yaz("3V3 ortak", 3);
  }
}

module kapak_parca() {
  dudak_w = ic_w - 2 * bosluk;
  dudak_h = ic_h - 2 * bosluk;
  difference() {
    union() {
      yuvarlak(W, H, kapak, kose_r);
      // gövdeye geçen iç dudak
      translate([0, 0, -3]) difference() {
        yuvarlak(dudak_w, dudak_h, 3.01, max(1, kose_r - duvar - bosluk));
        translate([0, 0, -1]) yuvarlak(dudak_w - 3.2, dudak_h - 3.2, 5, max(0.5, kose_r - duvar - 1.9));
        kose_vidalari() translate([0, 0, -1]) cylinder(r = 4.5 + 0.6, h = 6);
      }
    }
    kapak_delikleri();
    ust_yazilar();
    if (pin_yazilari) alt_pin_yazilari();
  }
}

// ---------------------------------------------------------------------- çıktı

if (parca == "govde") govde();
else if (parca == "kapak") kapak_parca();
else if (parca == "kapak_baski") translate([0, 0, kapak]) rotate([180, 0, 0]) kapak_parca();
else if (parca == "patlatilmis") {
  color("WhiteSmoke") govde();
  color("SteelBlue") translate([0, 0, derinlik + 45]) kapak_parca();
} else {
  color("WhiteSmoke") govde();
  color("SteelBlue") translate([0, 0, derinlik]) kapak_parca();
}
