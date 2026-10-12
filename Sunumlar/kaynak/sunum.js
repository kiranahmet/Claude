// Makale sunumu: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106.
// Makaleyi aktaran sunum; bulgular makalenin özgün tablolarıyla verilir (CC BY, kaynak gösterilerek).
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

const IMG = process.env.SUNUM_IMG || path.resolve(__dirname, "img");
const OUT = path.resolve(__dirname, "../Makale_Sunumu_Sigara_Birakma.pptx");

const HEX = { koyu: "0F4C5C", vurgu: "2A9D8F", acik: "E6F0F1", gri: "7A8C94", beyaz: "FFFFFF", cizgi: "C9DCDF" };
const THEME = {
  name: "Sigara Birakma Sunumu", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: "123A45", lt1: "FFFFFF", dk2: HEX.koyu, lt2: HEX.acik, accent1: HEX.koyu, accent2: HEX.vurgu, accent3: HEX.gri,
    accent4: "5C8A93", accent5: "B9D9D5", accent6: "3D6B78", hlink: HEX.vurgu, folHlink: HEX.gri }
};
// Tablo görsellerinin en/boy oranları (kırpılan PNG'lerden)
const ORAN = { sayfa1: 529.4 / 622.3, tablo1: 1.47, tablo2a: 1744 / 959, tablo2b: 1744 / 773, tablo3: 2.387, tablo4: 4.088, tablo5: 3.448, tablo6: 1.603 };

async function ikon(ad, renk = "#FFFFFF", boyut = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[ad], { color: renk, size: String(boyut) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Sigara bırakma polikliniği: makale sunumu";
  pres.subject = "Makale sunumu";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const numara = (renk) => ({ x: 12.25, y: 6.98, w: 0.6, h: 0.32, fontSize: 14, color: renk, align: "right" });

  pres.defineSlideMaster({ title: "KAPAK", background: { color: HEX.koyu }, slideNumber: numara(HEX.acik), objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.4, w: 11.7, h: 3.05, fontSize: 36, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.85, w: 11.7, h: 1.7, fontSize: 20, color: C.background2, align: "left", valign: "top", margin: 0 }, text: "" } }] });
  pres.defineSlideMaster({ title: "ICERIK", background: { color: HEX.beyaz }, slideNumber: numara(HEX.gri), objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 11.6, h: 0.95, fontSize: 36, bold: true, color: C.accent1, align: "left", valign: "middle", margin: 0 }, text: "" } }] });
  pres.defineSlideMaster({ title: "KAPANIS", background: { color: HEX.koyu }, slideNumber: numara(HEX.acik), objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.0, w: 7.6, h: 2.2, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } }] });

  const I = {};
  for (const ad of ["FaBalanceScale", "FaUsers", "FaBullseye", "FaHospital", "FaPills", "FaComments", "FaHome", "FaUserMd",
    "FaClipboardList", "FaCheck", "FaLightbulb", "FaExchangeAlt", "FaCalendarAlt", "FaFileMedical", "FaSmokingBan",
    "FaQuestion", "FaLeaf", "FaUserFriends", "FaBookMedical", "FaExclamationCircle", "FaStar"]) I[ad] = await ikon(ad);
  const ikonKoyu = await ikon("FaSmokingBan", "#" + HEX.koyu);
  const okVurgu = await ikon("FaArrowDown", "#" + HEX.vurgu);

  let no = 0;
  const yeni = (master, bolum) => { no += 1; const s = pres.addSlide({ masterName: master, sectionTitle: bolum }); s.addNotes(NOTLAR[no].metin.join("\n\n")); return s; };
  const kaynak = (s, metin = KAYNAK_KISA) => s.addText(metin, { x: 0.6, y: 6.98, w: 11.4, h: 0.32, fontSize: 12, italic: true, color: C.accent3, margin: 0, isTextBox: true, objectName: "Kaynak" });
  const daire = (s, x, y, d, ad, renk = C.accent2) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: renk }, line: { color: renk }, objectName: "Ikon zemini" });
    const p = d * 0.26; s.addImage({ data: I[ad], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: ad, objectName: "Ikon" });
  };
  const kart = (s, x, y, w, h, renk = C.background2) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: renk }, line: { color: renk }, objectName: "Kart" });
  const madde = (dizi, ops = {}) => dizi.map((t, i) => ({ text: t, options: { bullet: { indent: 22 }, breakLine: i < dizi.length - 1, paraSpaceAfter: 10, ...ops } }));
  const gorsel = (s, ad, x, y, w, alt) => {
    const h = w / ORAN[ad];
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.background1 }, line: { color: HEX.cizgi, width: 1 }, objectName: "Görsel çerçeve" });
    s.addImage({ path: `${IMG}/${ad}.png`, x, y, w, h, altText: alt, objectName: alt });
    return h;
  };
  const gorselKaynak = (s, tablo) => kaynak(s, `Görsel: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106, ${tablo}.`);
  // Sağ panel: başlık + madde/istatistik satırları
  const panel = (s, x, y, w, h, satirlar, koyu = true) => {
    kart(s, x, y, w, h, koyu ? C.accent1 : C.background2);
    const renk = koyu ? C.background1 : C.accent1;
    const runs = [];
    satirlar.forEach((r, i) => {
      const son = i === satirlar.length - 1;
      if (r.buyuk) runs.push({ text: r.buyuk, options: { fontSize: 30, bold: true, color: koyu ? C.background1 : C.accent2, breakLine: true } });
      runs.push({ text: r.metin, options: { fontSize: r.kucuk ? 18 : 20, bold: !!r.kalin, breakLine: !son, paraSpaceAfter: son ? 0 : 12 } });
    });
    s.addText(runs, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4, color: renk, valign: "top", margin: 0, isTextBox: true });
  };

  // 1 Kapak
  pres.addSection({ title: "Giriş" });
  let s = yeni("KAPAK", "Giriş");
  s.addText("Makale Sunumu", { x: 0.8, y: 0.75, w: 6, h: 0.5, fontSize: 22, bold: true, color: C.accent5, margin: 0, isTextBox: true, charSpacing: 1 });
  s.addText("Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler", { placeholder: "title" });
  s.addText([{ text: "Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 10 } }, { text: "Sunan: Dr. [Ad Soyad]", options: { bold: true } }], { placeholder: "body" });

  // 2 İçerik
  s = yeni("ICERIK", "Giriş");
  s.addText("İçerik", { placeholder: "title" });
  ["Künye ve giriş", "Gereç ve yöntem", "Bulgular", "Tartışma", "Sonuç ve öneriler", "Olgu ve özet"].forEach((t, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 1.7, r = i % 2 ? C.accent2 : C.accent1;
    kart(s, x, y, 5.95, 1.4);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.27, w: 0.86, h: 0.86, fill: { color: r }, line: { color: r }, objectName: "Sıra" });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.27, w: 0.86, h: 0.86, fontSize: 28, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 1.45, y, w: 4.3, h: 1.4, fontSize: 26, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });

  // 3 Hedefler
  s = yeni("ICERIK", "Giriş");
  s.addText("Hedefler", { placeholder: "title" });
  [["FaBalanceScale", "Tedavilerin etkinliğini karşılaştırmak", "Makalenin bulgularıyla"],
   ["FaUsers", "Başarıyı etkileyen faktörleri tanımak", "Hasta ve çevre özellikleri"],
   ["FaUserMd", "Bulguları klinik pratiğe aktarmak", "Olgu üzerinden tartışma"]].forEach(([ik, b, a], i) => {
    const y = 1.65 + i * 1.7;
    daire(s, 0.8, y, 1.2, ik, i === 1 ? C.accent1 : C.accent2);
    s.addText(b, { x: 2.35, y: y + 0.05, w: 9.6, h: 0.6, fontSize: 28, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(a, { x: 2.35, y: y + 0.65, w: 9.6, h: 0.5, fontSize: 22, color: C.accent3, margin: 0, isTextBox: true });
  });

  // 4 Künye
  s = yeni("ICERIK", "Giriş");
  s.addText("Makale künyesi", { placeholder: "title" });
  const iw = 5.35 * ORAN.sayfa1;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.5, w: iw, h: 5.35, fill: { color: C.background1 }, line: { color: HEX.cizgi, width: 1 }, shadow: { type: "outer", color: "000000", opacity: 0.18, blur: 6, offset: 2, angle: 90 }, objectName: "Görsel çerçeve" });
  s.addImage({ path: IMG + "/sayfa1.png", x: 0.6, y: 1.5, w: iw, h: 5.35, altText: "Makalenin ilk sayfası", objectName: "Makale ilk sayfa" });
  const kx = 0.6 + iw + 0.6, kw = 12.73 - kx;
  [["Dergi", "Turk J Fam Pract"], ["Künye", "2026;30(2):97-106"], ["Tür", "Özgün araştırma makalesi"], ["Tasarım", "Retrospektif, kesitsel"], ["Merkez", "Samsun EAH Sigara Bırakma Polikliniği"], ["DOI", "10.54308/TJFP.2026.912"]].forEach(([e, d], i) => {
    const y = 1.55 + i * 0.86;
    s.addText(e, { x: kx, y, w: 1.65, h: 0.7, fontSize: 22, bold: true, color: C.accent2, valign: "middle", margin: 0, isTextBox: true });
    s.addText(d, { x: kx + 1.7, y, w: kw - 1.7, h: 0.7, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true, fit: "shrink" });
  });
  kaynak(s, "Görsel: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106. (CC BY)");

  // 5 Sorunun büyüklüğü
  s = yeni("ICERIK", "Giriş");
  s.addText("Sorunun büyüklüğü", { placeholder: "title" });
  [["%44,1", "Erkeklerde sigara içme sıklığı", "FaUserFriends"], ["%19,2", "Kadınlarda sigara içme sıklığı", "FaUserFriends"],
   [">500", "Sigara bırakma polikliniği", "FaHospital"], ["%20–50", "Polikliniklerde bırakma oranı", "FaSmokingBan"]].forEach(([b, a, ik], i) => {
    const x = 0.6 + i * 3.08, r = i < 2 ? C.accent1 : C.accent2;
    kart(s, x, 1.65, 2.88, 4.6);
    daire(s, x + 0.94, 1.95, 1.0, ik, r);
    s.addText(b, { x: x + 0.1, y: 3.15, w: 2.68, h: 1.2, fontSize: 40, bold: true, color: r, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.25, y: 4.45, w: 2.38, h: 1.5, fontSize: 20, color: C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  kaynak(s, "Kaynak: 2, 3, 4 (Küresel Yetişkin Tütün Araştırması Türkiye 2016 verisi)");

  // 6 Tedavi seçenekleri
  s = yeni("ICERIK", "Giriş");
  s.addText("Tedavi seçenekleri", { placeholder: "title" });
  [["FaComments", "Davranışsal", ["Motivasyonel görüşme", "Davranış değişikliği modelleri", "Transteorik model"], C.accent1],
   ["FaPills", "Farmakolojik", ["NRT (nikotin replasman)", "Bupropion", "Vareniklin", "Sitizin (yeni seçenek)"], C.accent2]].forEach(([ik, b, m, r], i) => {
    const x = 0.6 + i * 6.15;
    kart(s, x, 1.55, 5.95, 4.15); daire(s, x + 0.35, 1.8, 1.0, ik, r);
    s.addText(b, { x: x + 1.6, y: 1.8, w: 4.1, h: 1.0, fontSize: 30, bold: true, color: r, valign: "middle", margin: 0, isTextBox: true });
    s.addText(madde(m), { x: x + 0.4, y: 3.0, w: 5.3, h: 2.55, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  });
  s.addText("Farmakoterapi davranışsal destekle birlikte önerilmektedir.", { x: 0.6, y: 5.95, w: 12.1, h: 0.6, fontSize: 22, italic: true, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  kaynak(s, "Kaynak: 1, 5");

  // 7 Amaç
  s = yeni("ICERIK", "Giriş");
  s.addText("Çalışmanın amacı", { placeholder: "title" });
  kart(s, 0.6, 1.65, 12.1, 4.6, C.accent1); daire(s, 1.1, 2.15, 1.4, "FaBullseye", C.accent2);
  s.addText(madde(["Kombine tedavi ve yakın takibin bırakma başarısına etkisini değerlendirmek", "Bırakmayı etkileyen hasta özelliklerini belirlemek"], { paraSpaceAfter: 18 }),
    { x: 3.0, y: 2.1, w: 9.2, h: 3.7, fontSize: 28, color: C.background1, valign: "middle", align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // 8 Tasarım ve örneklem
  pres.addSection({ title: "Gereç ve yöntem" });
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Tasarım ve örneklem", { placeholder: "title" });
  const kutu = (x, y, w, h, b, a, dolgu, yazi) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: dolgu }, line: { color: dolgu }, objectName: "Akış kutusu" });
    s.addText([{ text: b, options: { fontSize: 36, bold: true, breakLine: true } }, { text: a, options: { fontSize: 20 } }], { x, y, w, h, color: yazi, align: "center", valign: "middle", margin: 4, isTextBox: true });
  };
  kutu(0.6, 1.55, 4.2, 1.45, "432", "hasta dosyası (≥18 yaş)", C.background2, C.accent1);
  s.addImage({ data: okVurgu, x: 2.4, y: 3.12, w: 0.6, h: 0.6, altText: "ok" });
  kutu(0.6, 3.85, 4.2, 1.45, "399", "hastanın verisi eksiksiz", C.accent1, C.background1);
  [["FaCalendarAlt", "01.08.2020 – 31.08.2024"], ["FaFileMedical", "Hastane otomasyon sistemi"], ["FaClipboardList", "Retrospektif, kesitsel tasarım"], ["FaCheck", "En az bir yıllık takip"]].forEach(([ik, t], i) => {
    const y = 1.6 + i * 1.12;
    daire(s, 6.2, y, 0.8, ik, i % 2 ? C.accent1 : C.accent2);
    s.addText(t, { x: 7.25, y, w: 5.4, h: 0.8, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Tüm kayıtlar alındığı için örneklem hesabı yapılmamıştır.", { x: 0.6, y: 5.85, w: 12.1, h: 0.55, fontSize: 20, italic: true, color: C.accent3, margin: 0, isTextBox: true });
  kaynak(s);

  // 9 Veri ve FNBT
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Veri toplama ve bağımlılık ölçümü", { placeholder: "title" });
  s.addText("Hasta dosyalarından elde edilen veriler", { x: 0.6, y: 1.45, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  ["Yaş, cinsiyet", "Meslek", "Alkol kullanımı", "Kronik hastalık", "Paket-yıl", "Uygulanan tedavi"].forEach((t, i) => {
    const x = 0.6 + i * 2.03;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.05, w: 1.9, h: 0.75, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Veri etiketi" });
    s.addText(t, { x, y: 2.05, w: 1.9, h: 0.75, fontSize: 18, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Fagerström Nikotin Bağımlılık Testi (FNBT)", { x: 0.6, y: 3.2, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  const birim = 12.1 / 11;
  [[0, 3, "Düşük", "0–2", C.accent5, C.accent1], [3, 5, "Orta", "3–7", C.accent2, C.background1], [8, 3, "Yüksek", "8–10", C.accent1, C.background1]].forEach(([b, n, ad, ar, dolgu, yazi]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + b * birim, y: 3.85, w: n * birim, h: 1.1, fill: { color: dolgu }, line: { color: C.background1, width: 2 }, objectName: "Ölçek dilimi" });
    s.addText([{ text: ad, options: { bold: true, breakLine: true } }, { text: ar + " puan", options: { fontSize: 18 } }], { x: 0.6 + b * birim, y: 3.85, w: n * birim, h: 1.1, fontSize: 24, color: yazi, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("6 soru, 0–10 puan  •  Türkçe geçerlik ve güvenilirlik: Uysal ve ark., 2004", { x: 0.6, y: 5.25, w: 12.1, h: 0.55, fontSize: 20, color: C.accent3, margin: 0, isTextBox: true });
  kaynak(s, "Kaynak: 1, 6, 7");

  // 10 Tedavi yaklaşımı
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("Tedavi yaklaşımı", { placeholder: "title" });
  [["FaComments", "Davranışsal", "Yalnızca danışmanlık", C.accent3], ["FaPills", "Monoterapi", "Vareniklin, bupropion, sitizin veya NRT", C.accent2],
   ["FaExchangeAlt", "Kombine", "Bupropion, vareniklin veya sitizin + NRT; üçlü", C.accent1]].forEach(([ik, b, a, r], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 1.55, 3.9, 3.35); daire(s, x + 1.35, 1.8, 1.2, ik, r);
    s.addText(b, { x: x + 0.2, y: 3.1, w: 3.5, h: 0.6, fontSize: 28, bold: true, color: r, align: "center", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.3, y: 3.7, w: 3.3, h: 1.1, fontSize: 20, color: C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText(madde(["Bireyselleştirme: FNBT, komorbidite, kontrendikasyon, uyum", "NRT ve sitizin dönemsel olarak ücretsiz sağlanmıştır"]),
    { x: 0.6, y: 5.15, w: 12.1, h: 1.35, fontSize: 22, color: C.accent1, align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // 11 İstatistik
  s = yeni("ICERIK", "Gereç ve yöntem");
  s.addText("İstatistiksel analiz", { placeholder: "title" });
  const bas = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 } } });
  const satir = [["Normallik", "Histogram, Kolmogorov–Smirnov"], ["Kategorik değişkenler", "Ki-kare testi"], ["İki grup (sürekli)", "Mann–Whitney U testi"],
    ["İkiden fazla grup", "Kruskal–Wallis; post-hoc Duncan"], ["Tedavinin etkisi", "İkili lojistik regresyon"], ["Anlamlılık", "p<0,05; Bonferroni düzeltmesi"]];
  s.addTable([[bas("Amaç"), bas("Yöntem")]].concat(satir.map(([a, b], i) => [
    { text: a, options: { bold: true, color: C.accent1, fill: { color: i % 2 ? C.background1 : C.background2 } } },
    { text: b, options: { color: C.accent1, fill: { color: i % 2 ? C.background1 : C.background2 } } }])),
    { x: 0.6, y: 1.5, w: 12.1, colW: [4.4, 7.7], rowH: 0.66, fontSize: 22, valign: "middle", margin: [0.05, 0.15, 0.05, 0.15], border: { type: "solid", pt: 1, color: HEX.cizgi }, objectName: "İstatistik tablosu" });
  kaynak(s);

  // 12 Genel özellikler
  pres.addSection({ title: "Bulgular" });
  s = yeni("ICERIK", "Bulgular");
  s.addText("Katılımcıların genel özellikleri", { placeholder: "title" });
  [["399", "hasta"], ["44,7 ± 12,1", "yaş ortalaması (yıl)"], ["%63,7", "erkek"], ["5,66 ± 2,43", "FNBT puanı"], ["27,4 ± 16,6", "paket-yıl"], ["%34,1", "sigarayı bırakan"]].forEach(([b, a], i) => {
    const kol = i % 3, y = 1.55 + Math.floor(i / 3) * 2.45, x = 0.6 + kol * 4.1;
    kart(s, x, y, 3.9, 2.2, i === 5 ? C.accent1 : C.background2);
    s.addText(b, { x, y: y + 0.25, w: 3.9, h: 1.1, fontSize: 36, bold: true, color: i === 5 ? C.background1 : (kol === 1 ? C.accent2 : C.accent1), align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x, y: y + 1.35, w: 3.9, h: 0.6, fontSize: 22, color: i === 5 ? C.background1 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s, KAYNAK_KISA + " Ortalama ± standart sapma.");

  // 13 Bağımlılık ve deneme öyküsü
  s = yeni("ICERIK", "Bulgular");
  s.addText("Bağımlılık düzeyi ve deneme öyküsü", { placeholder: "title" });
  s.addText("FNBT'ye göre bağımlılık düzeyi", { x: 0.6, y: 1.45, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  [["%13,2", "düşük (0–2)", C.accent5, C.accent1], ["%61,3", "orta (3–7)", C.accent2, C.background1], ["%25,5", "yüksek (8–10)", C.accent1, C.background1]].forEach(([b, a, dolgu, yazi], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 2.0, 3.9, 1.9, dolgu);
    s.addText([{ text: b, options: { fontSize: 40, bold: true, breakLine: true } }, { text: a, options: { fontSize: 22 } }], { x, y: 2.0, w: 3.9, h: 1.9, color: yazi, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Önceki deneyimler", { x: 0.6, y: 4.15, w: 12, h: 0.5, fontSize: 22, bold: true, color: C.accent2, margin: 0, isTextBox: true });
  [["%75,7", "daha önce bırakmayı denemiş"], ["%49,9", "denemede profesyonel destek almış"], ["%7,2", "sigara dışı tütün ürünü kullanıyor"]].forEach(([b, a], i) => {
    const x = 0.6 + i * 4.1;
    kart(s, x, 4.7, 3.9, 1.85);
    s.addText(b, { x: x + 0.15, y: 4.7, w: 1.55, h: 1.85, fontSize: 32, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 1.75, y: 4.7, w: 2.0, h: 1.85, fontSize: 18, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // 14 Tablo 1
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 1: Sosyodemografik özellikler", { placeholder: "title" });
  const t1w = 5.35 * ORAN.tablo1;
  gorsel(s, "tablo1", 0.6, 1.45, t1w, "Tablo 1: Katılımcıların sosyodemografik özellikleri");
  panel(s, 0.6 + t1w + 0.35, 1.45, 12.73 - (0.6 + t1w + 0.35), 5.35, [
    { buyuk: "%63,7", metin: "erkek" }, { buyuk: "%82,0", metin: "evli" }, { buyuk: "%43,4", metin: "yükseköğretim mezunu" }, { buyuk: "%39,6", metin: "hanesinde sigara içen var" }]);
  gorselKaynak(s, "Tablo 1");

  // 15-16 Tablo 2 (iki bölüm)
  const t2w = 9.1, pX = 0.6 + t2w + 0.35, pW = 12.73 - pX;
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 2: Sosyodemografik özellikler ve bırakma", { placeholder: "title" });
  let h2 = gorsel(s, "tablo2a", 0.6, 1.45, t2w, "Tablo 2, birinci bölüm");
  panel(s, pX, 1.45, pW, h2, [{ metin: "Anlamlı fark yok", kalin: true }, { metin: "Cinsiyet, yaş grubu, medeni durum ve eğitim durumu" }]);
  gorselKaynak(s, "Tablo 2");
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 2 (devam)", { placeholder: "title" });
  h2 = gorsel(s, "tablo2b", 0.6, 1.45, t2w, "Tablo 2, ikinci bölüm");
  panel(s, pX, 1.45, pW, h2, [{ metin: "Tek anlamlı fark:", kalin: true }, { metin: "hanede sigara içen varlığı" }, { buyuk: "p = 0,003", metin: "Bırakma: %39,8 ve %25,3", kucuk: true }]);
  gorselKaynak(s, "Tablo 2");

  // 17 Tablo 3
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 3: Uygulanan tedaviler", { placeholder: "title" });
  const h3 = gorsel(s, "tablo3", 0.6, 1.45, t2w, "Tablo 3: Katılımcıların kullandığı tedavi seçenekleri");
  panel(s, pX, 1.45, pW, h3, [{ buyuk: "%35,3", metin: "kombine tedavi" }, { buyuk: "125 / 141", metin: "bupropion + NRT", kucuk: true }]);
  gorselKaynak(s, "Tablo 3");

  // 18 Tablo 4
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 4: Görüşme sayısı, FNBT ve paket-yıl", { placeholder: "title" });
  const h4 = gorsel(s, "tablo4", 0.6, 1.45, 12.13, "Tablo 4: Sigara ve tedavi parametrelerinin bırakma durumu ile karşılaştırılması");
  [["Görüşme sayısı", "p < 0,001", "Başarılı 2,83; başarısız 1,96"], ["FNBT puanı", "p = 0,024", "Başarılı 5,26; başarısız 5,85"], ["Paket-yıl", "Fark yok", "İki grup benzer"]].forEach(([b, p, a], i) => {
    const x = 0.6 + i * 4.1, y = 1.45 + h4 + 0.35;
    kart(s, x, y, 3.9, 6.7 - y, i === 0 ? C.accent1 : C.background2);
    const yz = i === 0 ? C.background1 : C.accent1;
    s.addText([{ text: b, options: { fontSize: 20, bold: true, breakLine: true } }, { text: p, options: { fontSize: 30, bold: true, color: i === 0 ? C.background1 : C.accent2, breakLine: true } }, { text: a, options: { fontSize: 18 } }],
      { x: x + 0.2, y, w: 3.5, h: 6.7 - y, color: yz, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  gorselKaynak(s, "Tablo 4");

  // 19 Tablo 5
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 5: Tedavi yöntemine göre bırakma", { placeholder: "title" });
  const h5 = gorsel(s, "tablo5", 0.6, 1.45, 12.13, "Tablo 5: Tedavi yöntemlerinin bırakma durumu ile karşılaştırılması");
  [["En yüksek", "Vareniklin %44,5; kombine %44,0"], ["En düşük", "Bupropion %16,5"], ["Gruplar arası", "p < 0,001"]].forEach(([b, a], i) => {
    const x = 0.6 + i * 4.1, y = 1.45 + h5 + 0.3;
    kart(s, x, y, 3.9, 6.7 - y, i === 1 ? C.accent1 : C.background2);
    s.addText([{ text: b, options: { fontSize: 20, bold: true, breakLine: true } }, { text: a, options: { fontSize: 22 } }],
      { x: x + 0.2, y, w: 3.5, h: 6.7 - y, color: i === 1 ? C.background1 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  gorselKaynak(s, "Tablo 5");

  // 20 Tablo 6
  s = yeni("ICERIK", "Bulgular");
  s.addText("Tablo 6: Lojistik regresyon", { placeholder: "title" });
  const t6w = 5.35 * ORAN.tablo6;
  gorsel(s, "tablo6", 0.6, 1.45, t6w, "Tablo 6: Lojistik regresyon sonuçları");
  panel(s, 0.6 + t6w + 0.35, 1.45, 12.73 - (0.6 + t6w + 0.35), 5.35, [
    { metin: "Referans: bupropion", kalin: true, kucuk: true }, { buyuk: "4,0 kat", metin: "vareniklin, kombine", kucuk: true },
    { buyuk: "2,0 kat", metin: "hanede sigara içen yok", kucuk: true }, { buyuk: "1,6 kat", metin: "yakınma yok", kucuk: true }]);
  gorselKaynak(s, "Tablo 6");

  // 21 Tartışma: tedaviler
  pres.addSection({ title: "Tartışma" });
  s = yeni("ICERIK", "Tartışma");
  s.addText("Tartışma: tedaviler ve literatür", { placeholder: "title" });
  [["FaPills", "Vareniklin", "Bupropiona üstün; meta-analiz ve EAGLES ile uyumlu", "8, 9"], ["FaLeaf", "Sitizin", "Plaseboya üstün; NRT ve vareniklinle benzer", "10, 11"],
   ["FaExchangeAlt", "Kombine tedavi", "Kılavuz önerileriyle uyumlu", "12"], ["FaBookMedical", "Benli ve ark.", "Vareniklin ilk 6 ayda daha etkili", "13"]].forEach(([ik, b, a, k], i) => {
    const y = 1.5 + i * 1.32;
    daire(s, 0.6, y + 0.08, 0.95, ik, i % 2 ? C.accent1 : C.accent2);
    s.addText(b, { x: 1.85, y, w: 3.5, h: 1.1, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    s.addText([{ text: a }, { text: "  [" + k + "]", options: { color: C.accent3, fontSize: 18 } }], { x: 5.4, y, w: 7.3, h: 1.1, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s, "Kaynak: 1, 8–13");

  // 22 Tartışma: faktörler
  s = yeni("ICERIK", "Tartışma");
  s.addText("Tartışma: başarıyı etkileyen faktörler", { placeholder: "title" });
  [["FaComments", "Davranışsal destek", "Görüşme sayısı arttıkça başarı artmaktadır", ""], ["FaHome", "Hane ortamı", "Evde sigara içilmemesi olasılığı ikiye katlamaktadır", "14"],
   ["FaClipboardList", "Bağımlılık düzeyi", "Yüksek FNBT puanı düşük başarıyla ilişkilidir", "15"], ["FaLightbulb", "İçsel motivasyon", "Yakınması olmayanlarda başarı daha yüksektir", "16"]].forEach(([ik, b, a, k], i) => {
    const y = 1.5 + i * 1.32;
    daire(s, 0.6, y + 0.08, 0.95, ik, i % 2 ? C.accent1 : C.accent2);
    s.addText(b, { x: 1.85, y, w: 3.5, h: 1.1, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    const runs = [{ text: a }]; if (k) runs.push({ text: "  [" + k + "]", options: { color: C.accent3, fontSize: 18 } });
    s.addText(runs, { x: 5.4, y, w: 7.3, h: 1.1, fontSize: 22, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s, "Kaynak: 1, 14–16");

  // 23 Kısıtlılıklar ve güçlü yönler (yazarların ifadesiyle)
  s = yeni("ICERIK", "Tartışma");
  s.addText("Kısıtlılıklar ve güçlü yönler", { placeholder: "title" });
  [["Kısıtlılıklar", ["Asistan rotasyonu", "Telefonla tamamlanan veriler", "Vareniklinin piyasadan çekilmesi"], C.accent1, "FaExclamationCircle"],
   ["Güçlü yönler", ["Sitizin ile ilk erişilebilir tez çalışması", "Birçok tedavi seçeneğini kapsaması"], C.accent2, "FaStar"]].forEach(([b, m, r, ik], i) => {
    const x = 0.6 + i * 6.15;
    kart(s, x, 1.5, 5.95, 5.0); daire(s, x + 0.3, 1.72, 0.9, ik, r);
    s.addText(b, { x: x + 1.4, y: 1.72, w: 4.4, h: 0.9, fontSize: 28, bold: true, color: r, valign: "middle", margin: 0, isTextBox: true });
    s.addText(madde(m, { paraSpaceAfter: 14 }), { x: x + 0.4, y: 2.9, w: 5.3, h: 3.45, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // 24 Sonuç
  pres.addSection({ title: "Sonuç" });
  s = yeni("ICERIK", "Sonuç");
  s.addText("Sonuç ve öneriler", { placeholder: "title" });
  [["Üçte bir", "hasta sigarayı bırakmıştır"], ["Kombine", "tedavide bırakma oranı daha yüksektir"], ["Uyum", "arttıkça başarı artmaktadır"]].forEach(([b, a], i) => {
    const x = 0.6 + i * 4.1, k = i === 1;
    kart(s, x, 1.65, 3.9, 3.6, k ? C.accent1 : C.background2);
    s.addText(b, { x, y: 2.0, w: 3.9, h: 1.2, fontSize: 44, bold: true, color: k ? C.background1 : C.accent2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.3, y: 3.3, w: 3.3, h: 1.7, fontSize: 22, color: k ? C.background1 : C.accent1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText("Öneri: Tedavi seanslarında motivasyonu artırmaya yönelik çabalar yoğunlaştırılmalıdır.", { x: 0.6, y: 5.6, w: 12.1, h: 0.9, fontSize: 22, italic: true, color: C.accent1, valign: "middle", align: "justify", margin: 0, isTextBox: true });
  kaynak(s);

  // 25 Olgu
  s = yeni("ICERIK", "Sonuç");
  s.addText("Olgu: Siz ne yapardınız?", { placeholder: "title" });
  kart(s, 0.6, 1.5, 6.3, 5.0); daire(s, 0.9, 1.75, 0.9, "FaUserMd", C.accent2);
  s.addText("52 yaşında erkek hasta", { x: 2.0, y: 1.75, w: 4.7, h: 0.9, fontSize: 26, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  s.addText(madde(["Günde 25 sigara, 30 paket-yıl", "FNBT: 8 (yüksek bağımlılık)", "Bupropion ile başarısız deneme", "Eşi de sigara içiyor"], { paraSpaceAfter: 14 }),
    { x: 1.0, y: 2.95, w: 5.6, h: 3.3, fontSize: 22, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true });
  kart(s, 7.2, 1.5, 5.5, 5.0, C.accent1); daire(s, 7.5, 1.75, 0.9, "FaQuestion", C.accent2);
  s.addText("Tartışalım", { x: 8.6, y: 1.75, w: 3.9, h: 0.9, fontSize: 26, bold: true, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  s.addText(madde(["Hangi tedaviyi seçerdiniz?", "Takibi nasıl planlardınız?", "Eşi sürece nasıl katılmalı?"], { paraSpaceAfter: 18 }),
    { x: 7.6, y: 2.95, w: 4.8, h: 3.3, fontSize: 22, color: C.background1, valign: "top", align: "justify", margin: 0, isTextBox: true });

  // 26 Özet
  s = yeni("ICERIK", "Sonuç");
  s.addText("Akılda kalacak mesajlar", { placeholder: "title" });
  ["Hastaların üçte biri sigarayı bırakmıştır", "Kombine tedavide başarı daha yüksektir", "En düşük başarı bupropion monoterapisindedir", "Hanede sigara içen sorgulanmalıdır", "Sık takip başarıyla ilişkilidir"].forEach((t, i) => {
    const y = 1.5 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.1, w: 0.7, h: 0.7, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "Onay zemini" });
    s.addImage({ data: I.FaCheck, x: 0.78, y: y + 0.28, w: 0.34, h: 0.34, altText: "onay" });
    s.addText(t, { x: 1.6, y, w: 11.1, h: 0.9, fontSize: 26, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
  });
  kaynak(s);

  // 27 Kaynaklar
  s = yeni("ICERIK", "Sonuç");
  s.addText("Kaynaklar", { placeholder: "title" });
  const K = [
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
    "Benli AR, Erturhan S, Oruc MA, Kalpakci P, Sunay D, Demirel Y. A comparison of the efficacy of varenicline and bupropion and an evaluation of the effect of the medications in the context of the smoking cessation programme. Tob Induc Dis. 2017;15:10.",
    "Park EW, Schultz JK, Tudiver F, Campbell T, Becker L. Enhancing partner support to improve smoking cessation. Cochrane Database Syst Rev. 2004;(3):CD002928.",
    "Davis JM, Masclans L, Rose JE. Adaptive smoking cessation using precessation varenicline or nicotine patch: a randomized clinical trial. JAMA Netw Open. 2023;6(9):e2332214.",
    "Curry S, Wagner EH, Grothaus LC. Intrinsic and extrinsic motivation for smoking cessation. J Consult Clin Psychol. 1990;58(3):310-6."
  ];
  const ref = (dizi, bas) => dizi.map((t, i) => ({ text: t, options: { bullet: { type: "number", startAt: bas }, breakLine: i < dizi.length - 1, paraSpaceAfter: 4 } }));
  s.addText(ref(K.slice(0, 8), 1), { x: 0.6, y: 1.35, w: 5.95, h: 5.55, fontSize: 11, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true, objectName: "Kaynaklar 1-8" });
  s.addText(ref(K.slice(8), 9), { x: 6.85, y: 1.35, w: 5.85, h: 5.55, fontSize: 11, color: C.accent1, valign: "top", align: "justify", margin: 0, isTextBox: true, objectName: "Kaynaklar 9-16" });

  // 28 Kapanış
  s = yeni("KAPANIS", "Sonuç");
  s.addText("İlginiz ve katkılarınız için teşekkür ederim", { placeholder: "title" });
  s.addText([{ text: "Sorular ve tartışma", options: { bold: true, fontSize: 26, breakLine: true } }, { text: " ", options: { fontSize: 12, breakLine: true } },
    { text: "Dr. [Ad Soyad]", options: { fontSize: 22, breakLine: true } }, { text: "[e-posta adresi]", options: { fontSize: 22 } }],
    { x: 0.8, y: 3.7, w: 7.4, h: 2.6, color: C.background2, valign: "top", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.OVAL, { x: 8.95, y: 1.45, w: 3.6, h: 3.6, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Görsel zemini" });
  s.addImage({ data: ikonKoyu, x: 9.75, y: 2.25, w: 2.0, h: 2.0, altText: "Sigara içilmez simgesi", objectName: "Dumansız simge" });
  s.addText("Dumansız bir gelecek için", { x: 8.45, y: 5.3, w: 4.6, h: 0.6, fontSize: 22, italic: true, color: C.background2, align: "center", margin: 0, isTextBox: true });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("yazıldı:", OUT, "slayt:", no);
})().catch(e => { console.error(e); process.exit(1); });
