// Konuşma notları: slayt slayt konuşma metni + süre planı + olası sorular (Word, A4)
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, Footer, PageNumber, PageBreak } = require("docx");
const { NOTLAR, SORULAR } = require("./icerik");

const OUT = path.resolve(__dirname, "../Konusma_Notlari_Sigara_Birakma.docx");
const KOYU = "0F4C5C", VURGU = "2A9D8F", GRI = "5F7178";

const p = (text, o = {}) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 140, line: 300 }, ...o.para, children: [new TextRun({ text, ...o.run })] });
const yonerge = (text) => p(text, { run: { italics: true, color: GRI } });
const baslik = (text, level = HeadingLevel.HEADING_1) => new Paragraph({ heading: level, spacing: { before: 280, after: 140 }, children: [new TextRun({ text })] });
const madde = (text) => new Paragraph({ bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 80, line: 290 }, children: [new TextRun(text)] });

// Süre tablosu
let toplam = 0;
const sureSatir = Object.entries(NOTLAR).map(([no, n]) => {
  toplam += n.sure;
  return [no, n.baslik, n.sure, toplam];
});
const fmt = (dk) => { const m = Math.floor(dk), s = Math.round((dk - m) * 60); return m === 0 ? `${s} sn` : (s ? `${m} dk ${s} sn` : `${m} dk`); };
const kenar = { style: BorderStyle.SINGLE, size: 4, color: "C9DCDF" };
const hucre = (t, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.bas ? { type: ShadingType.CLEAR, fill: KOYU, color: "auto" } : undefined,
  borders: { top: kenar, bottom: kenar, left: kenar, right: kenar },
  margins: { top: 40, bottom: 40, left: 100, right: 100 },
  children: [new Paragraph({ alignment: o.orta ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(t), bold: !!o.bas, color: o.bas ? "FFFFFF" : undefined, size: 20 })] })]
});
const W = [900, 5200, 1450, 1450];
const sureTablo = new Table({
  width: { size: 9000, type: WidthType.DXA },
  columnWidths: W,
  rows: [new TableRow({ tableHeader: true, children: ["Slayt", "Konu", "Süre", "Kümülatif"].map((t, i) => hucre(t, { w: W[i], bas: true, orta: i !== 1 })) })]
    .concat(sureSatir.map(([no, b, s, k]) => new TableRow({ children: [hucre(no, { w: W[0], orta: true }), hucre(b, { w: W[1] }), hucre(fmt(s), { w: W[2], orta: true }), hucre(fmt(k), { w: W[3], orta: true })] })))
});

const govde = [];
govde.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 80 }, children: [new TextRun({ text: "Konuşma Notları", bold: true, size: 44, color: KOYU })] }));
govde.push(new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: "Makale sunumu: Sigara bırakma polikliniğine başvuran hastaların özellikleri ve bırakma başarısını etkileyen faktörler", size: 26, color: VURGU })] }));
govde.push(p("Sunulan makale: Cenberlitaş E, Gökçe A, Öztürk O. Demographic and clinical characteristics of patients applying to a smoking cessation clinic affiliated with a university hospital and factors affecting their smoking cessation status. Turk J Fam Pract. 2026;30(2):97-106. doi:10.54308/TJFP.2026.912", { run: { size: 20, color: GRI } }));

govde.push(baslik("Genel bilgiler"));
govde.push(madde("Sunum 28 slayttan oluşmaktadır. Konuşma süresi yaklaşık 32 dakikadır; ardından 10 dakikalık tartışma planlanmıştır."));
govde.push(madde("Slayt başına ortalama 1 dakika hedeflenmiştir. Olgu slaytına (25) yaklaşık 3 dakika ayrılmıştır."));
govde.push(madde("Notlar okunmak için değil, hatırlatıcı olarak hazırlanmıştır. Slaytı okumak yerine anlatmaya, dinleyicilerle göz teması kurmaya ve dinleyicilere arkanızı dönmemeye özen gösterin."));
govde.push(madde("Köşeli parantez içindeki [Ad Soyad], [kaçıncı yıl] ve [e-posta adresi] alanlarını sunumdan önce doldurun. Bu alanlar 1. ve 28. slaytta da yer almaktadır."));
govde.push(madde("Makalenin üçüncü yazarı Prof. Dr. Onur Öztürk, Amasya Üniversitesi Aile Hekimliği Ana Bilim Dalı'ndandır. Hoca dinleyiciler arasında olabilir. Eleştirel değerlendirme slaytlarındaki (22–23) noktaları yapıcı ve soru biçiminde dile getirmeniz önerilir."));
govde.push(madde("Sunumdan önce dosyayı en az iki farklı ortama (USB bellek ve e-posta gibi) kaydedin ve sunum yapılacak bilgisayarda deneme yapın."));

govde.push(baslik("Süre planı"));
govde.push(sureTablo);
govde.push(new Paragraph({ children: [new PageBreak()] }));

govde.push(baslik("Slayt slayt konuşma metni"));
for (const [no, n] of Object.entries(NOTLAR)) {
  govde.push(baslik(`Slayt ${no}: ${n.baslik}  (≈ ${fmt(n.sure)})`, HeadingLevel.HEADING_2));
  for (const m of n.metin) govde.push(m.startsWith("[") ? yonerge(m) : p(m));
}

govde.push(new Paragraph({ children: [new PageBreak()] }));
govde.push(baslik("Olası sorular ve yanıtlar"));
govde.push(p("Tartışma bölümünde hocalardan ve asistanlardan gelebilecek sorular için hazırlık notlarıdır.", { run: { italics: true, color: GRI } }));
SORULAR.forEach((q, i) => {
  govde.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: `${i + 1}. ${q.s}`, bold: true, color: KOYU })] }));
  govde.push(p(q.c));
});

const doc = new Document({
  creator: "Makale sunumu",
  title: "Konuşma Notları",
  styles: {
    default: { document: { run: { font: "Calibri", size: 23 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: KOYU, font: "Calibri" }, paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: VURGU, font: "Calibri" }, paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 1 } }
    ]
  },
  numbering: { config: [] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1300, left: 1300, right: 1300 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRI })] })] }) },
    children: govde
  }]
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log("yazıldı:", OUT, "toplam süre:", fmt(toplam)); });
