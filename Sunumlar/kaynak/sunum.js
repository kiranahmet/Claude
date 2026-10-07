// Makale sunumu: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106.
// Sunum hazırlama rehberine göre: Calibri, başlık 36 pt, metin ≥20 pt, 666 kuralı,
// ekranda ≤4 renk, kırmızı/sarı yok, slayt numarası, iki yana yaslı metin, görsel altında kaynak.
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { NOTLAR, KAYNAK_KISA } = require("./icerik");
const SKILL = "/root/.claude/skills/synced/744bbc3f-b46b-4387-b30a-3a856ab4973d_778289e2-a3d0-405f-b72a-f505718ee7db/pptx";
const { applyTheme } = require(SKILL + "/scripts/apply_theme.js");

const IMG = path.resolve(__dirname, "img");
const OUT = path.resolve(__dirname, "../Makale_Sunumu_Sigara_Birakma.pptx");

// Renkler: koyu petrol (baskın), deniz yeşili (vurgu), açık ton, gri. Kırmızı ve sarı yok.
const HEX = { koyu: "0F4C5C", vurgu: "2A9D8F", acik: "E6F0F1", gri: "7A8C94", beyaz: "FFFFFF", cizgi: "C9DCDF" };
const THEME = {
  name: "Sigara Birakma Sunumu",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "123A45", lt1: "FFFFFF", dk2: HEX.koyu, lt2: HEX.acik,
    accent1: HEX.koyu, accent2: HEX.vurgu, accent3: HEX.gri, accent4: "5C8A93",
    accent5: "B9D9D5", accent6: "3D6B78", hlink: HEX.vurgu, folHlink: HEX.gri
  }
};

async function ikon(ad, renk = "#FFFFFF", boyut = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[ad], { color: renk, size: String(boyut) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pres.title = "Sigara bırakma polikliniği: makale sunumu";
  pres.subject = "Makale sunumu";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  const numara = { x: 12.25, y: 6.98, w: 0.6, h: 0.32, fontSize: 14, color: HEX.gri, align: "right" };
  const numaraAcik = { x: 12.25, y: 6.98, w: 0.6, h: 0.32, fontSize: 14, color: HEX.acik, align: "right" };

  pres.defineSlideMaster({
    title: "KAPAK",
    background: { color: HEX.koyu },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.4, w: 11.7, h: 3.05, fontSize: 36, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.85, w: 11.7, h: 1.7, fontSize: 20, color: C.background2, align: "left", valign: "top", margin: 0 }, text: "" } }
    ],
    slideNumber: numaraAcik
  });
  pres.defineSlideMaster({
    title: "ICERIK",
    background: { color: HEX.beyaz },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 11.6, h: 0.95, fontSize: 36, bold: true, color: C.accent1, align: "left", valign: "middle", margin: 0 }, text: "" } }
    ],
    slideNumber: numara
  });
  pres.defineSlideMaster({
    title: "KAPANIS",
    background: { color: HEX.koyu },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.0, w: 7.6, h: 2.2, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } }
    ],
    slideNumber: numaraAcik
  });

  // İkonlar
  const I = {};
  for (const ad of ["FaBullseye", "FaBalanceScale", "FaSearch", "FaHospital", "FaUsers", "FaPills", "FaComments",
    "FaHome", "FaUserMd", "FaClipboardList", "FaCheck", "FaLightbulb", "FaExchangeAlt", "FaCalendarAlt",
    "FaFileMedical", "FaSmokingBan", "FaQuestion", "FaLeaf", "FaHandsHelping", "FaBookMedical", "FaUserFriends"]) {
    I[ad] = await ikon(ad);
  }
  const Ikoyu = {};
  for (const ad of ["FaSmokingBan", "FaArrowDown", "FaArrowRight"]) Ikoyu[ad] = await ikon(ad, "#" + HEX.koyu);
  const Ivurgu = { FaArrowDown: await ikon("FaArrowDown", "#" + HEX.vurgu) };

  let no = 0;
  const yeni = (master, bolum) => { no += 1; const s = pres.addSlide({ masterName: master, sectionTitle: bolum }); s.addNotes(NOTLAR[no].metin.join("\n\n")); return s; };
  const kaynak = (s, metin = KAYNAK_KISA) => s.addText(metin, { x: 0.6, y: 6.98, w: 11.4, h: 0.32, fontSize: 12, italic: true, color: C.accent3, margin: 0, isTextBox: true, objectName: "Kaynak" });
  const daire = (s, x, y, d, ikonAd, renk = C.accent2) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: renk }, line: { color: renk }, objectName: "Ikon zemini" });
    const p = d * 0.26;
    s.addImage({ data: I[ikonAd], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: ikonAd, objectName: "Ikon" });
  };
  const kart = (s, x, y, w, h, renk = C.background2) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: renk }, line: { color: renk }, objectName: "Kart" });
  const madde = (dizi, ops = {}) => dizi.map((t, i) => {
    const o = { bullet: { indent: 22 }, breakLine: i < dizi.length - 1, paraSpaceAfter: 10, ...ops };
    return typeof t === "string" ? { text: t, options: o } : { text: t.text, options: { ...o, ...t.options } };
  });
  const grafikOrtak = (ek = {}) => ({
    showLegend: false, showTitle: false, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelColor: HEX.koyu, catAxisLabelFontSize: 18, catAxisLabelFontFace: "+mn-lt",
    catAxisLineShow: false,
    showValue: true, dataLabelColor: HEX.koyu, dataLabelFontSize: 18, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true,
    dataLabelPosition: "outEnd", barGapWidthPct: 55, ...ek
  });

  // ---------------- 1. Kapak ----------------
  pres.addSection({ title: "Giriş" });
  let s = yeni("KAPAK", "Giriş");
  s.addText("Makale Sunumu", { x: 0.8, y: 0.75, w: 6, h: 0.5, fontSize: 22, bold: true, color: C.accent5, margin: 0, isTextBox: true, charSpacing: 1 });
  s.addText("Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler", { placeholder: "title" });
  s.addText([
    { text: "Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 10 } },
    { text: "Sunan: Dr. [Ad Soyad]", options: { bold: true } }
  ], { placeholder: "body" });

  // ---------------- 2. İçerik ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("İçerik", { placeholder: "title" });
  const icerik = ["Künye ve giriş", "Gereç ve yöntem", "Bulgular", "Tartışma ve kısıtlılıklar", "Eleştirel değerlendirme", "Olgu ve sonuç"];
  icerik.forEach((t, i) => {
    const kol = i % 2, sat = Math.floor(i / 2);
    const x = 0.6 + kol * 6.15, y = 1.6 + sat * 1.7;
    kart(s, x, y, 5.95, 1.4);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.27, w: 0.86, h: 0.86, fill: { color: i % 2 ? C.accent2 : C.accent1 }, line: { color: i % 2 ? C.accent2 : C.accent1 }, objectName: "Sıra" });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.27, w: 0.86, h: 0.86, fontSize: 28, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 1.45, y, w: 4.3, h: 1.4, fontSize: 26, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });

  // ---------------- 3. Hedefler ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("Hedefler", { placeholder: "title" });
  [["FaBalanceScale", "Tedavilerin etkinliğini karşılaştırmak", "Gerçek yaşam verisiyle"],
   ["FaUsers", "Başarıyı etkileyen faktörleri tanımak", "Hasta ve çevre özellikleri"],
   ["FaSearch", "Makaleyi eleştirel değerlendirmek", "Yöntem ve raporlama açısından"]].forEach(([ik, b, a], i) => {
    const y = 1.65 + i * 1.7;
    daire(s, 0.8, y, 1.2, ik, i === 1 ? C.accent1 : C.accent2);
    s.addText(b, { x: 2.35, y: y + 0.05, w: 9.6, h: 0.6, fontSize: 28, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(a, { x: 2.35, y: y + 0.65, w: 9.6, h: 0.5, fontSize: 22, color: C.accent3, margin: 0, isTextBox: true });
  });

  // ---------------- 4. Künye ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("Makale künyesi", { placeholder: "title" });
  // sayfa1.png oranı: 529.4 x 622.3 pt
  const ih = 5.35, iw = ih * 529.4 / 622.3;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.5, w: iw, h: ih, fill: { color: C.background1 }, line: { color: HEX.cizgi, width: 1 }, shadow: { type: "outer", color: "000000", opacity: 0.18, blur: 6, offset: 2, angle: 90 }, objectName: "Görsel çerçeve" });
  s.addImage({ path: IMG + "/sayfa1.png", x: 0.6, y: 1.5, w: iw, h: ih, altText: "Makalenin ilk sayfası", objectName: "Makale ilk sayfa" });
  const kx = 0.6 + iw + 0.6, kw = 12.73 - kx;
  const satirlar = [["Dergi", "Turk J Fam Pract"], ["Künye", "2026;30(2):97-106"], ["Tür", "Özgün araştırma makalesi"], ["Tasarım", "Retrospektif, kesitsel"], ["Merkez", "Samsun EAH Sigara Bırakma Polikliniği"], ["DOI", "10.54308/TJFP.2026.912"]];
  satirlar.forEach(([e, d], i) => {
    const y = 1.55 + i * 0.86;
    s.addText(e, { x: kx, y, w: 1.65, h: 0.7, fontSize: 22, bold: true, color: C.accent2, valign: "middle", margin: 0, isTextBox: true });
    s.addText(d, { x: kx + 1.7, y, w: kw - 1.7, h: 0.7, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true, fit: "shrink" });
  });
  kaynak(s, "Görsel: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106. (CC BY)");

  // ---------------- 5. Sorunun büyüklüğü ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("Sorunun büyüklüğü", { placeholder: "title" });
  [["%44,1", "Erkeklerde sigara içme sıklığı", "FaUserFriends"], ["%19,2", "Kadınlarda sigara içme sıklığı", "FaUserFriends"],
   [">500", "Sigara bırakma polikliniği", "FaHospital"], ["%20–50", "Polikliniklerde bırakma oranı", "FaSmokingBan"]].forEach(([b, a, ik], i) => {
    const x = 0.6 + i * 3.08;
    kart(s, x, 1.65, 2.88, 4.6, i < 2 ? C.background2 : C.background2);
    daire(s, x + 0.94, 1.95, 1.0, ik, i < 2 ? C.accent1 : C.accent2);
    s.addText(b, { x: x + 0.1, y: 3.15, w: 2.68, h: 1.2, fontSize: 40, bold: true, color: i < 2 ? C.accent1 : C.accent2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.25, y: 4.45, w: 2.38, h: 1.5, fontSize: 20, color: C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  kaynak(s, "Kaynak: 2, 3, 4 (Küresel Yetişkin Tütün Araştırması Türkiye 2016 verisi)");

  // ---------------- 6. Tedavi seçenekleri ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("Tedavi seçenekleri", { placeholder: "title" });
  [["FaComments", "Davranışsal", ["Motivasyonel görüşme", "Davranış değişikliği modelleri", "Transteorik model"], C.accent1],
   ["FaPills", "Farmakolojik", ["NRT (nikotin replasman)", "Bupropion", "Vareniklin", "Sitizin (yeni seçenek)"], C.accent2]].forEach(([ik, b, m, r], i) => {
    const x = 0.6 + i * 6.15;
    kart(s, x, 1.55, 5.95, 4.15);
    daire(s, x + 0.35, 1.8, 1.0, ik, r);
    s.addText(b, { x: x + 1.6, y: 1.8, w: 4.1, h: 1.0, fontSize: 30, bold: true, color: r, valign: "middle", margin: 0, isTextBox: true });
    s.addText(madde(m), { x: x + 0.4, y: 3.0, w: 5.3, h: 2.55, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  });
  s.addText("Farmakoterapi davranışsal destekle birlikte önerilmektedir.", { x: 0.6, y: 5.95, w: 12.1, h: 0.6, fontSize: 22, italic: true, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  kaynak(s, "Kaynak: 1, 5");

  // ---------------- 7. Amaç ----------------
  s = yeni("ICERIK", "Giriş");
  s.addText("Çalışmanın amacı", { placeholder: "title" });
  kart(s, 0.6, 1.65, 12.1, 4.6, C.accent1);
  daire(s, 1.1, 2.15, 1.4, "FaBullseye", C.accent2);
  s.addText([
    { text: "Kombine tedavi ve yakın takibin bırakma başarısına etkisini değerlendirmek", options: { bullet: { indent: 22 }, breakLine: true, paraSpaceAfter: 18 } },
    { text: "Bırakmayı etkileyen hasta özelliklerini belirlemek", options: { bullet: { indent: 22 } } }
  ], { x: 3.0, y: 2.1, w: 9.2, h: 3.7, fontSize: 28, color: C.background1, valign: "middle", align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // ---------------- 8. Tasarım ve örneklem ----------------
  pres.addSection({ title: "Gereç ve yöntem" });
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Tasarım ve örneklem", { placeholder: "title" });
  // Akış şeması
  const kutu = (x, y, w, h, b, a, dolgu, yazi) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: dolgu }, line: { color: dolgu }, objectName: "Akış kutusu" });
    s.addText([{ text: b, options: { fontSize: 36, bold: true, breakLine: true } }, { text: a, options: { fontSize: 20 } }], { x, y, w, h, color: yazi, align: "center", valign: "middle", margin: 4, isTextBox: true });
  };
  kutu(0.6, 1.55, 4.2, 1.45, "432", "hasta dosyası (≥18 yaş)", C.background2, C.accent1);
  s.addImage({ data: Ivurgu.FaArrowDown, x: 2.4, y: 3.12, w: 0.6, h: 0.6, altText: "ok" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 3.07, w: 2.3, h: 0.75, rectRadius: 0.1, fill: { color: C.background1 }, line: { color: C.accent3, width: 1.25, dashType: "dash" }, objectName: "Dışlanan" });
  s.addText("33 dosya eksik", { x: 5.1, y: 3.07, w: 2.3, h: 0.75, fontSize: 20, color: C.accent3, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.LINE, { x: 2.7, y: 3.45, w: 2.4, h: 0, line: { color: C.accent3, width: 1.25, dashType: "dash" }, objectName: "Bağlantı" });
  kutu(0.6, 3.85, 4.2, 1.45, "399", "hasta analize alındı", C.accent1, C.background1);
  // Sağ: özellikler
  [["FaCalendarAlt", "01.08.2020 – 31.08.2024"], ["FaFileMedical", "Hastane otomasyon sistemi"], ["FaClipboardList", "Retrospektif, kesitsel tasarım"], ["FaCheck", "En az bir yıllık takip"]].forEach(([ik, t], i) => {
    const y = 1.6 + i * 1.12;
    daire(s, 7.8, y, 0.8, ik, i % 2 ? C.accent1 : C.accent2);
    s.addText(t, { x: 8.85, y, w: 3.9, h: 0.8, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Tüm kayıtlar alındığı için örneklem hesabı yapılmamıştır.", { x: 0.6, y: 5.85, w: 12.1, h: 0.55, fontSize: 20, italic: true, color: C.accent3, margin: 0, isTextBox: true });
  kaynak(s);

  // ---------------- 9. Veri ve FNBT ----------------
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Veri toplama ve bağımlılık ölçümü", { placeholder: "title" });
  s.addText("Hasta dosyalarından elde edilen veriler", { x: 0.6, y: 1.45, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  ["Yaş, cinsiyet", "Meslek", "Alkol kullanımı", "Kronik hastalık", "Paket-yıl", "Uygulanan tedavi"].forEach((t, i) => {
    const x = 0.6 + i * 2.03;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.05, w: 1.9, h: 0.75, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Veri etiketi" });
    s.addText(t, { x, y: 2.05, w: 1.9, h: 0.75, fontSize: 18, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Fagerström Nikotin Bağımlılık Testi (FNBT)", { x: 0.6, y: 3.2, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  // Ölçek: 0-10 puan, 3 segment
  const sx = 0.6, sw = 12.1, birim = sw / 11; // 11 puan dilimi (0..10)
  [[0, 3, "Düşük", "0–2", C.accent5, C.accent1], [3, 5, "Orta", "3–7", C.accent2, C.background1], [8, 3, "Yüksek", "8–10", C.accent1, C.background1]].forEach(([b, n, ad, ar, dolgu, yazi]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: sx + b * birim, y: 3.85, w: n * birim, h: 1.1, fill: { color: dolgu }, line: { color: C.background1, width: 2 }, objectName: "Ölçek dilimi" });
    s.addText([{ text: ad, options: { bold: true, breakLine: true } }, { text: ar + " puan", options: { fontSize: 18 } }], { x: sx + b * birim, y: 3.85, w: n * birim, h: 1.1, fontSize: 24, color: yazi, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("6 soru, 0–10 puan  •  Türkçe geçerlik: Cronbach α = 0,56", { x: 0.6, y: 5.25, w: 12.1, h: 0.55, fontSize: 20, color: C.accent3, margin: 0, isTextBox: true });
  kaynak(s, "Kaynak: 1, 6, 7");

  // ---------------- 10. Tedavi yaklaşımı ----------------
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Tedavi yaklaşımı", { placeholder: "title" });
  [["FaComments", "Davranışsal", "Yalnızca danışmanlık", C.accent3],
   ["FaPills", "Monoterapi", "Vareniklin, bupropion, sitizin veya NRT", C.accent2],
   ["FaExchangeAlt", "Kombine", "Bupropion, vareniklin veya sitizin + NRT; üçlü", C.accent1]].forEach(([ik, b, a, r], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 1.55, 3.9, 3.35);
    daire(s, x + 1.35, 1.8, 1.2, ik, r);
    s.addText(b, { x: x + 0.2, y: 3.1, w: 3.5, h: 0.6, fontSize: 28, bold: true, color: r, align: "center", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.3, y: 3.7, w: 3.3, h: 1.1, fontSize: 20, color: C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText(madde([
    "Bireyselleştirme: FNBT, komorbidite, kontrendikasyon, uyum",
    "NRT ve sitizin dönemsel olarak ücretsiz sağlanmıştır"
  ]), { x: 0.6, y: 5.15, w: 12.1, h: 1.35, fontSize: 22, color: C.accent1, align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // ---------------- 11. İstatistik ----------------
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("İstatistiksel analiz", { placeholder: "title" });
  const bas = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 } } });
  const sat = [
    ["Normallik", "Histogram, Kolmogorov–Smirnov"],
    ["Kategorik değişkenler", "Ki-kare testi"],
    ["İki grup (sürekli)", "Mann–Whitney U testi"],
    ["İkiden fazla grup", "Kruskal–Wallis; post-hoc Duncan"],
    ["Bağımsız belirleyiciler", "İkili lojistik regresyon"],
    ["Anlamlılık", "p<0,05; Bonferroni ile p<0,003"]
  ];
  const tabloSatir = [[bas("Amaç"), bas("Yöntem")]].concat(sat.map(([a, b], i) => [
    { text: a, options: { bold: true, color: C.accent1, fill: { color: i % 2 ? C.background1 : C.background2 } } },
    { text: b, options: { color: C.accent1, fill: { color: i % 2 ? C.background1 : C.background2 }, bold: i === 5 } }
  ]));
  s.addTable(tabloSatir, { x: 0.6, y: 1.5, w: 12.1, colW: [4.4, 7.7], rowH: 0.66, fontSize: 22, valign: "middle", margin: [0.05, 0.15, 0.05, 0.15], border: { type: "solid", pt: 1, color: HEX.cizgi }, objectName: "İstatistik tablosu" });
  kaynak(s);

  // ---------------- 12. Genel özellikler ----------------
  pres.addSection({ title: "Bulgular" });
  s = yeni("ICERIK", "Bulgular");
  s.addText("Katılımcıların genel özellikleri", { placeholder: "title" });
  [["399", "hasta"], ["44,7 ± 12,1", "yaş ortalaması (yıl)"], ["%63,7", "erkek"],
   ["5,66 ± 2,43", "FNBT puanı"], ["27,4 ± 16,6", "paket-yıl"], ["2,21 ± 1,28", "görüşme sayısı"]].forEach(([b, a], i) => {
    const kol = i % 3, satr = Math.floor(i / 3);
    const x = 0.6 + kol * 4.1, y = 1.55 + satr * 2.45;
    kart(s, x, y, 3.9, 2.2, satr === 0 ? C.background2 : C.background2);
    s.addText(b, { x, y: y + 0.25, w: 3.9, h: 1.1, fontSize: 36, bold: true, color: kol === 1 ? C.accent2 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x, y: y + 1.35, w: 3.9, h: 0.6, fontSize: 22, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s, KAYNAK_KISA + " Ortalama ± standart sapma.");

  // ---------------- 13. Bağımlılık ve deneme ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("Hastaların çoğunda orta düzey bağımlılık", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [{ name: "FNBT düzeyi", labels: ["Düşük (0–2)", "Orta (3–7)", "Yüksek (8–10)"], values: [13.19, 61.34, 25.46] }],
    { x: 0.6, y: 1.5, w: 6.6, h: 4.6, barDir: "col", chartColors: [HEX.vurgu], dataLabelFormatCode: '"%"0.0', ...grafikOrtak(), valAxisMaxVal: 75, valAxisMinVal: 0, objectName: "FNBT dağılımı" });
  s.addText("Yüzdeler makalede 432 hasta üzerinden verilmiştir.", { x: 0.6, y: 6.15, w: 6.6, h: 0.45, fontSize: 16, italic: true, color: C.accent3, margin: 0, isTextBox: true });
  [["%75,7", "daha önce bırakmayı denemiş"], ["%49,9", "denemede profesyonel destek almış"], ["%7,2", "sigara dışı tütün ürünü kullanıyor"]].forEach(([b, a], i) => {
    const y = 1.6 + i * 1.55;
    kart(s, 7.6, y, 5.1, 1.35);
    s.addText(b, { x: 7.75, y, w: 1.95, h: 1.35, fontSize: 36, bold: true, color: i === 0 ? C.accent2 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: 9.75, y, w: 2.8, h: 1.35, fontSize: 20, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // ---------------- 14. Tablo 2 ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("Evde sigara içilmesi başarıyı azaltmaktadır", { placeholder: "title" });
  s.addText("Sigarayı bırakma oranı", { x: 0.6, y: 1.5, w: 6.6, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  s.addChart(pres.charts.BAR, [{ name: "Bırakma oranı", labels: ["Hanede sigara içen yok", "Hanede sigara içen var"], values: [39.84, 25.32] }],
    { x: 0.6, y: 2.0, w: 6.6, h: 3.9, barDir: "col", chartColors: [HEX.koyu], dataLabelFormatCode: '"%"0.0', ...grafikOrtak({ dataLabelFontSize: 24 }), valAxisMaxVal: 50, valAxisMinVal: 0, objectName: "Hane grafiği" });
  s.addText("p = 0,003", { x: 0.6, y: 5.95, w: 6.6, h: 0.5, fontSize: 22, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true });
  kart(s, 7.6, 1.5, 5.1, 4.95);
  s.addText("Anlamlı fark bulunmayanlar", { x: 7.9, y: 1.7, w: 4.6, h: 0.55, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  s.addText(madde(["Cinsiyet ve yaş", "Medeni ve eğitim durumu", "Yerleşim yeri", "Çalışma durumu", "Alkol kullanımı"]),
    { x: 7.9, y: 2.4, w: 4.6, h: 3.8, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  kaynak(s, KAYNAK_KISA + " Tablo 2.");

  // ---------------- 15. Tablo 3 ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("En sık kombine tedavi uygulanmıştır", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [{ name: "Hasta sayısı", labels: ["Kombine tedavi", "Bupropion", "NRT", "Sitizin", "Vareniklin", "İlaçsız (davranışsal)"], values: [141, 109, 80, 34, 18, 17] }],
    { x: 0.6, y: 1.45, w: 7.6, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [HEX.vurgu], dataLabelFormatCode: "0", ...grafikOrtak(), valAxisMaxVal: 165, valAxisMinVal: 0, objectName: "Tedavi dağılımı" });
  kart(s, 8.6, 1.6, 4.1, 4.9, C.accent1);
  s.addText([{ text: "125 / 141", options: { fontSize: 44, bold: true, breakLine: true } }, { text: "kombine tedavi hastası bupropion + NRT almıştır", options: { fontSize: 22 } }],
    { x: 8.85, y: 1.85, w: 3.6, h: 2.6, color: C.background1, valign: "top", margin: 0, isTextBox: true });
  s.addText("Vareniklin, piyasadan çekildiği için az kullanılmıştır.", { x: 8.85, y: 4.6, w: 3.6, h: 1.7, fontSize: 20, italic: true, color: C.background2, valign: "top", margin: 0, isTextBox: true });
  kaynak(s, KAYNAK_KISA + " Tablo 3.");

  // ---------------- 16. Tablo 5 ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("En düşük başarı bupropion monoterapisinde", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [{ name: "Bırakma oranı", labels: ["Vareniklin", "Kombine tedavi", "NRT", "Sitizin", "İlaçsız", "Bupropion"], values: [44.45, 43.98, 37.5, 35.3, 35.3, 16.52] }],
    { x: 0.6, y: 1.45, w: 7.6, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [HEX.koyu], dataLabelFormatCode: '"%"0.0', ...grafikOrtak(), valAxisMaxVal: 55, valAxisMinVal: 0, objectName: "Tedaviye göre bırakma" });
  kart(s, 8.6, 1.6, 4.1, 2.25);
  s.addText([{ text: "%34,1", options: { fontSize: 44, bold: true, color: C.accent2, breakLine: true } }, { text: "genel bırakma oranı (136/399)", options: { fontSize: 20, color: C.accent1 } }],
    { x: 8.8, y: 1.7, w: 3.7, h: 2.05, align: "center", valign: "middle", margin: 0, isTextBox: true });
  kart(s, 8.6, 4.1, 4.1, 2.4);
  s.addText([{ text: "p < 0,001", options: { fontSize: 36, bold: true, color: C.accent1, breakLine: true } }, { text: "altı grup arasında (ki-kare)", options: { fontSize: 20, color: C.accent1 } }],
    { x: 8.8, y: 4.2, w: 3.7, h: 2.2, align: "center", valign: "middle", margin: 0, isTextBox: true });
  kaynak(s, KAYNAK_KISA + " Tablo 5.");

  // ---------------- 17. Tablo 4 ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("Başarı görüşme sayısıyla artmaktadır", { placeholder: "title" });
  // Başlık satırı
  s.addText("Başarısız", { x: 5.1, y: 1.5, w: 2.6, h: 0.55, fontSize: 22, bold: true, color: C.accent3, align: "center", margin: 0, isTextBox: true });
  s.addText("Başarılı", { x: 7.9, y: 1.5, w: 2.6, h: 0.55, fontSize: 22, bold: true, color: C.accent2, align: "center", margin: 0, isTextBox: true });
  s.addText("p", { x: 10.7, y: 1.5, w: 2.0, h: 0.55, fontSize: 22, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true });
  [["Görüşme sayısı", "1,96", "2,83", "<0,001", true], ["FNBT puanı", "5,85", "5,26", "0,024", true], ["Paket-yıl", "28,12", "26,66", "0,550", false]].forEach(([ad, a, b, p, anl], i) => {
    const y = 2.2 + i * 1.45;
    kart(s, 0.6, y, 12.1, 1.25, i === 0 ? C.background2 : C.background2);
    s.addText(ad, { x: 0.9, y, w: 4.1, h: 1.25, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: 5.1, y, w: 2.6, h: 1.25, fontSize: 36, color: C.accent3, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(b, { x: 7.9, y, w: 2.6, h: 1.25, fontSize: 36, bold: true, color: C.accent2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(p, { x: 10.7, y, w: 2.0, h: 1.25, fontSize: 26, bold: anl, color: anl ? C.accent1 : C.accent3, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Ortalama değerler; Mann–Whitney U testi. Tabloda p değerleri “24” ve “550” olarak basılmıştır.", { x: 0.6, y: 6.4, w: 12.1, h: 0.45, fontSize: 16, italic: true, color: C.accent3, margin: 0, isTextBox: true });
  kaynak(s, KAYNAK_KISA + " Tablo 4.");

  // ---------------- 18. Tablo 6 (özgün görsel) ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("Bağımsız belirleyiciler: lojistik regresyon", { placeholder: "title" });
  // tablo6.png oranı: 509.4 x 318.4 pt
  const t6h = 5.25, t6w = t6h * 509.4 / 318.4;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.45, w: t6w, h: t6h, fill: { color: C.background1 }, line: { color: HEX.cizgi, width: 1 }, objectName: "Görsel çerçeve" });
  s.addImage({ path: IMG + "/tablo6.png", x: 0.6, y: 1.45, w: t6w, h: t6h, altText: "Makalenin Tablo 6'sı: lojistik regresyon sonuçları", objectName: "Tablo 6" });
  const px = 0.6 + t6w + 0.35, pw = 12.73 - px;
  kart(s, px, 1.45, pw, 5.25, C.accent1);
  s.addText([
    { text: "Bonferroni eşiği", options: { fontSize: 20, breakLine: true } },
    { text: "p < 0,003", options: { fontSize: 32, bold: true, breakLine: true } },
    { text: " ", options: { fontSize: 10, breakLine: true } },
    { text: "Eşiği geçen:", options: { fontSize: 20, bold: true, breakLine: true } },
    { text: "NRT, kombine tedavi", options: { fontSize: 20, breakLine: true } },
    { text: " ", options: { fontSize: 10, breakLine: true } },
    { text: "Sınırda:", options: { fontSize: 20, bold: true, breakLine: true } },
    { text: "hanede sigara içen olmaması", options: { fontSize: 20 } }
  ], { x: px + 0.25, y: 1.65, w: pw - 0.5, h: 4.85, color: C.background1, valign: "top", margin: 0, isTextBox: true });
  kaynak(s, "Görsel: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106, Tablo 6. Referans: bupropion monoterapisi.");

  // ---------------- 19. OR ≠ RR ----------------
  s = yeni("ICERIK", "Bulgular");
  s.addText("Odds oranı, risk oranı değildir", { placeholder: "title" });
  s.addText("Kombine tedavi ve bupropion monoterapisi", { x: 0.6, y: 1.45, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  s.addChart(pres.charts.BAR, [{ name: "Bırakma oranı", labels: ["Bupropion", "Kombine tedavi"], values: [16.52, 43.98] }],
    { x: 0.6, y: 2.0, w: 5.2, h: 4.4, barDir: "col", chartColors: [HEX.vurgu], dataLabelFormatCode: '"%"0.0', ...grafikOrtak({ dataLabelFontSize: 24 }), valAxisMaxVal: 55, valAxisMinVal: 0, objectName: "Bırakma oranları" });
  kart(s, 6.3, 2.0, 3.05, 3.4);
  s.addText([{ text: "Risk oranı", options: { fontSize: 22, bold: true, breakLine: true } }, { text: "2,7", options: { fontSize: 60, bold: true, color: C.accent2, breakLine: true } }, { text: "%44,0 ÷ %16,5", options: { fontSize: 18 } }],
    { x: 6.3, y: 2.0, w: 3.05, h: 3.4, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  kart(s, 9.65, 2.0, 3.05, 3.4, C.accent1);
  s.addText([{ text: "Odds oranı", options: { fontSize: 22, bold: true, breakLine: true } }, { text: "4,0", options: { fontSize: 60, bold: true, breakLine: true } }, { text: "0,78 ÷ 0,20", options: { fontSize: 18 } }],
    { x: 9.65, y: 2.0, w: 3.05, h: 3.4, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText("Sık görülen sonuçlarda odds oranı etkiyi büyük göstermektedir.", { x: 6.3, y: 5.65, w: 6.4, h: 0.8, fontSize: 20, italic: true, bold: true, color: C.accent1, valign: "top", margin: 0, isTextBox: true });
  kaynak(s, "Hesaplama makalenin Tablo 5 verilerinden yapılmıştır. " + KAYNAK_KISA);

  // ---------------- 20. Tartışma ----------------
  pres.addSection({ title: "Tartışma" });
  s = yeni("ICERIK", "Tartışma");
  s.addText("Tartışma: literatürle uyum", { placeholder: "title" });
  [["FaPills", "Vareniklin", "Bupropiona üstün; meta-analiz ve EAGLES ile uyumlu", "8, 9"],
   ["FaLeaf", "Sitizin", "Plaseboya üstün; NRT ve vareniklinle benzer", "10, 11"],
   ["FaExchangeAlt", "Kombine tedavi", "Kılavuz önerileriyle uyumlu", "12"],
   ["FaHandsHelping", "Hane ve eş desteği", "Cochrane derlemesiyle uyumlu", "13"]].forEach(([ik, b, a, k], i) => {
    const y = 1.5 + i * 1.32;
    daire(s, 0.6, y + 0.08, 0.95, ik, i % 2 ? C.accent1 : C.accent2);
    s.addText(b, { x: 1.85, y, w: 3.5, h: 1.1, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    s.addText([{ text: a }, { text: "  [" + k + "]", options: { color: C.accent3, fontSize: 18 } }], { x: 5.4, y, w: 7.3, h: 1.1, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s, "Kaynak: 8–13");

  // ---------------- 21. Kısıtlılıklar ----------------
  s = yeni("ICERIK", "Tartışma");
  s.addText("Yazarların bildirdiği kısıtlılıklar", { placeholder: "title" });
  [["FaUserMd", "Asistan rotasyonu", "Takip sürekliliği ve öz bildirim etkilenmiş olabilir"],
   ["FaComments", "Telefonla tamamlanan veri", "Eksik veriler hasta beyanına dayanmaktadır"],
   ["FaPills", "Vareniklinin piyasadan çekilmesi", "İlaç seçimi dönem içinde değişmiştir"]].forEach(([ik, b, a], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 1.55, 3.9, 4.9);
    daire(s, x + 1.35, 1.85, 1.2, ik, i === 1 ? C.accent1 : C.accent2);
    s.addText(b, { x: x + 0.25, y: 3.25, w: 3.4, h: 1.1, fontSize: 24, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.3, y: 4.4, w: 3.3, h: 1.8, fontSize: 20, color: C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // ---------------- 22. Eleştirel: yöntem ----------------
  pres.addSection({ title: "Eleştirel değerlendirme" });
  s = yeni("ICERIK", "Eleştirel değerlendirme");
  s.addText("Eleştirel değerlendirme: yöntem", { placeholder: "title" });
  [["Güçlü yönler", ["Gerçek yaşam verisi", "Beş tedavi seçeneği bir arada", "Sitizin ile güncel veri", "Bir yıllık takip"], C.accent2, "FaCheck"],
   ["Geliştirilebilir yönler", ["Randomizasyon yok: seçim yanlılığı", "Bırakma biyokimyasal doğrulanmamış", "İlaç ücretinin etkisi incelenmemiş", "Tasarım retrospektif kohorta daha yakın"], C.accent1, "FaLightbulb"]].forEach(([b, m, r, ik], i) => {
    const x = 0.6 + i * 6.15;
    kart(s, x, 1.5, 5.95, 5.0);
    daire(s, x + 0.3, 1.72, 0.9, ik, r);
    s.addText(b, { x: x + 1.4, y: 1.72, w: 4.4, h: 0.9, fontSize: 28, bold: true, color: r, valign: "middle", margin: 0, isTextBox: true });
    s.addText(madde(m, { paraSpaceAfter: 14 }), { x: x + 0.4, y: 2.9, w: 5.3, h: 3.45, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // ---------------- 23. Eleştirel: raporlama ----------------
  s = yeni("ICERIK", "Eleştirel değerlendirme");
  s.addText("Eleştirel değerlendirme: raporlama", { placeholder: "title" });
  daire(s, 0.6, 1.65, 1.5, "FaSearch", C.accent2);
  s.addText(madde([
    "Bonferroni eşiği yorumda uygulanmamış",
    "Kruskal–Wallis sonrası Duncan testi",
    "Paydalar tutarsız: 432 ve 399",
    "Özet ile tablolar arasında farklılıklar",
    "Dışlama ölçütü bulgularla çelişkili",
    "Tablo 4 ve 6'da basım hataları"
  ], { paraSpaceAfter: 12 }), { x: 2.6, y: 1.55, w: 10.1, h: 5.0, fontSize: 24, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // ---------------- 24. Sonuç ----------------
  pres.addSection({ title: "Sonuç" });
  s = yeni("ICERIK", "Sonuç");
  s.addText("Yazarların sonucu", { placeholder: "title" });
  [["Üçte bir", "hasta sigarayı bırakmıştır"], ["Kombine", "tedavide bırakma oranı daha yüksektir"], ["Uyum", "arttıkça başarı artmaktadır"]].forEach(([b, a], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 1.65, 3.9, 3.6, i === 1 ? C.accent1 : C.background2);
    s.addText(b, { x, y: 2.0, w: 3.9, h: 1.2, fontSize: 44, bold: true, color: i === 1 ? C.background1 : C.accent2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.3, y: 3.3, w: 3.3, h: 1.7, fontSize: 22, color: i === 1 ? C.background1 : C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText("Öneri: Tedavi seanslarında motivasyonu artırmaya yönelik çabalar yoğunlaştırılmalıdır.", { x: 0.6, y: 5.6, w: 12.1, h: 0.9, fontSize: 22, italic: true, color: C.accent1, valign: "middle", align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // ---------------- 25. Olgu ----------------
  s = yeni("ICERIK", "Sonuç");
  s.addText("Olgu: Siz ne yapardınız?", { placeholder: "title" });
  kart(s, 0.6, 1.5, 6.3, 5.0);
  daire(s, 0.9, 1.75, 0.9, "FaUserMd", C.accent2);
  s.addText("52 yaşında erkek hasta", { x: 2.0, y: 1.75, w: 4.7, h: 0.9, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  s.addText(madde(["Günde 25 sigara, 30 paket-yıl", "FNBT: 8 (yüksek bağımlılık)", "Bupropion ile başarısız deneme", "Eşi de sigara içiyor"], { paraSpaceAfter: 14 }),
    { x: 1.0, y: 2.95, w: 5.6, h: 3.3, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  kart(s, 7.2, 1.5, 5.5, 5.0, C.accent1);
  daire(s, 7.5, 1.75, 0.9, "FaQuestion", C.accent2);
  s.addText("Tartışalım", { x: 8.6, y: 1.75, w: 3.9, h: 0.9, fontSize: 26, bold: true, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  s.addText(madde(["Hangi tedaviyi seçerdiniz?", "Takibi nasıl planlardınız?", "Eşi sürece nasıl katılmalı?"], { paraSpaceAfter: 18 }),
    { x: 7.6, y: 2.95, w: 4.8, h: 3.3, fontSize: 22, color: C.background1, valign: "top", align: "justify", margin: 0, isTextBox: true });

  // ---------------- 26. Özet ----------------
  s = yeni("ICERIK", "Sonuç");
  s.addText("Akılda kalacak mesajlar", { placeholder: "title" });
  ["Bupropion tek başına en zayıf seçenektir", "Kombine tedavi ve NRT en güvenilir sonucu vermiştir", "Hanede sigara içen sorgulanmalıdır", "Sık takip başarıyla ilişkilidir", "Sonuçlar dikkatli yorumlanmalıdır"].forEach((t, i) => {
    const y = 1.5 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.1, w: 0.7, h: 0.7, fill: { color: i === 4 ? C.accent1 : C.accent2 }, line: { color: i === 4 ? C.accent1 : C.accent2 }, objectName: "Onay zemini" });
    s.addImage({ data: I.FaCheck, x: 0.78, y: y + 0.28, w: 0.34, h: 0.34, altText: "onay" });
    s.addText(t, { x: 1.6, y, w: 11.1, h: 0.9, fontSize: 26, color: C.accent1, bold: i === 4, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // ---------------- 27. Kaynaklar ----------------
  s = yeni("ICERIK", "Sonuç");
  s.addText("Kaynaklar", { placeholder: "title" });
  const KAYNAKLAR = [
    "Cenberlitaş E, Gökçe A, Öztürk O. Demographic and clinical characteristics of patients applying to a smoking cessation clinic affiliated with a university hospital and factors affecting their smoking cessation status. Turk J Fam Pract. 2026;30(2):97-106.",
    "Summers AD, Sirin H, Palipudi K, Erguder T, Ciobanu A, Ahluwalia IB. Changes in prevalence and predictors of tobacco smoking and interest in smoking cessation in Turkey: evidence from the Global Adult Tobacco Survey, 2008-2016. Tob Prev Cessat. 2022;8:35.",
    "Sigarayı bırakma polikliniklerinden 2,5 milyon kişi hizmet aldı [İnternet]. Anadolu Ajansı. Erişim: 25.09.2025. https://www.aa.com.tr/tr/saglik/sigarayi-birakma-polikliniklerinden-2-5-milyon-kisi-hizmet-aldi/1533870",
    "Fidanci I, Ozturk O, Unal M. Transtheoretic Model in smoking cessation. J Exp Clin Med. 2017;34(1):9-13.",
    "McDonough M. Update on medicines for smoking cessation. Aust Prescr. 2015;38(4):106-11.",
    "Heatherton TF, Kozlowski LT, Frecker RC, Fagerström KO. The Fagerström test for nicotine dependence: a revision of the Fagerström Tolerance Questionnaire. Br J Addict. 1991;86(9):1119-27.",
    "Uysal M, Kadakal F, Karşıdağ Ç, Bayram N, Uysal O, Yilmaz V. Fagerström test for nicotine dependence: reliability in a Turkish sample and factor analysis. Tuberk Toraks. 2004;52(2):175-82.",
    "Cahill K, Stevens S, Perera R, Lancaster T. Pharmacological interventions for smoking cessation: an overview and network meta-analysis. Cochrane Database Syst Rev. 2013;(5):CD009329.",
    "Anthenelli RM, Benowitz NL, West R, et al. Neuropsychiatric safety and efficacy of varenicline, bupropion, and nicotine patch in smokers with and without psychiatric disorders (EAGLES). Lancet. 2016;387(10037):2507-20.",
    "Walker N, Howe C, Glover M, et al. Cytisine versus nicotine for smoking cessation. N Engl J Med. 2014;371(25):2353-62.",
    "Courtney RJ, McRobbie H, Tutka P, et al. Effect of cytisine vs varenicline on smoking cessation: a randomized clinical trial. JAMA. 2021;326(1):56-64.",
    "Koegelenberg CFN, Noor F, Bateman ED, et al. Efficacy of varenicline combined with nicotine replacement therapy vs varenicline alone for smoking cessation: a randomized clinical trial. JAMA. 2014;312(2):155-61.",
    "Park EW, Schultz JK, Tudiver F, Campbell T, Becker L. Enhancing partner support to improve smoking cessation. Cochrane Database Syst Rev. 2004;(3):CD002928."
  ];
  const ref = (dizi, bas) => dizi.map((t, i) => ({ text: t, options: { bullet: { type: "number", startAt: bas }, breakLine: i < dizi.length - 1, paraSpaceAfter: 5 } }));
  s.addText(ref(KAYNAKLAR.slice(0, 7), 1), { x: 0.6, y: 1.4, w: 5.95, h: 5.45, fontSize: 12, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true, objectName: "Kaynaklar 1-7" });
  s.addText(ref(KAYNAKLAR.slice(7), 8), { x: 6.85, y: 1.4, w: 5.85, h: 5.45, fontSize: 12, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true, objectName: "Kaynaklar 8-13" });

  // ---------------- 28. Kapanış ----------------
  s = yeni("KAPANIS", "Sonuç");
  s.addText("İlginiz ve katkılarınız için teşekkür ederim", { placeholder: "title" });
  s.addText([{ text: "Sorular ve tartışma", options: { bold: true, fontSize: 26, breakLine: true } }, { text: " ", options: { fontSize: 12, breakLine: true } }, { text: "Dr. [Ad Soyad]", options: { fontSize: 22, breakLine: true } }, { text: "[e-posta adresi]", options: { fontSize: 22 } }],
    { x: 0.8, y: 3.7, w: 7.4, h: 2.6, color: C.background2, valign: "top", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.OVAL, { x: 8.95, y: 1.45, w: 3.6, h: 3.6, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Görsel zemini" });
  s.addImage({ data: Ikoyu.FaSmokingBan, x: 9.75, y: 2.25, w: 2.0, h: 2.0, altText: "Sigara içilmez simgesi", objectName: "Dumansız simge" });
  s.addText("Dumansız bir gelecek için", { x: 8.45, y: 5.3, w: 4.6, h: 0.6, fontSize: 22, italic: true, color: C.background2, align: "center", margin: 0, isTextBox: true });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("yazıldı:", OUT, "slayt:", no);
})().catch(e => { console.error(e); process.exit(1); });
