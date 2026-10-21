# Son sunuma (26 slayt) göre konuşma notları: eski Word dosyasının stillerini kullanır.
import copy, sys
import docx
from docx.shared import Pt, RGBColor

SABLON, CIKIS = sys.argv[1], sys.argv[2]
GRI = RGBColor(0x5F, 0x71, 0x78)

S = [  # (başlık, saniye, [paragraflar])
 ("Başlık", 45, [
  "Değerli hocalarım, asistan arkadaşlarım. Ben Asistan Dr. Ahmet Kıran.",
  "Bugün sizlere Uzm. Dr. Emre Cenberlitaş ve hocalarımızdan Aksanur ve Onur hocamızın “Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler” başlıklı makalesini sunacağım."]),
 ("Makalenin ilk sayfası (künye sözlü)", 45, [
  "Makalenin ilk sayfasını görüyorsunuz. Makale, Turkish Journal of Family Practice'in 2026 yılı 30. cilt 2. sayısında, 97–106. sayfalar arasında yayımlanmıştır.",
  "Çalışma retrospektif, kesitsel bir araştırmadır. Veriler Samsun Eğitim ve Araştırma Hastanesi Sigara Bırakma Polikliniği'nden elde edilmiştir."]),
 ("İçerik", 30, [
  "Sunum 26 slayttan oluşmakta ve yaklaşık yirmi dakika sürecektir.",
  "Giriş bölümüyle başlayıp gereç ve yöntemi aktaracağım. Bulgular bölümünde makaledeki tabloları özgün halleriyle göstereceğim. Ardından tartışma ve sonuçları aktaracağım."]),
 ("Sorunun büyüklüğü", 60, [
  "Tütün bağımlılığı önlenebilir ölüm nedenlerinin başında gelmektedir. Küresel Yetişkin Tütün Araştırması 2016 verilerine göre Türkiye'de sigara içme sıklığı erkeklerde yüzde 44,1, kadınlarda yüzde 19,2'dir.",
  "Ülkemizde 500'ün üzerinde sigara bırakma polikliniği bulunmakta, bu polikliniklere 2,5 milyondan fazla kişi başvurmuş bulunmaktadır. Polikliniklerde bırakma oranları yüzde 20 ile 50 arasında değişmektedir."]),
 ("Tedavi seçenekleri", 60, [
  "Sigara bırakma tedavisi Onur hocamızın da dersinde anlattığı gibi davranışsal yaklaşımlar ve farmakoterapiden oluşmaktadır. Davranışsal tarafta Sağlık İnanç Modeli, Sağlık Kontrol Odağı, Yeniliklerin Yayılımı Modeli, Pender'in Sağlığı Geliştirme Modeli ve Transteorik Model gibi davranış değişikliği modelleri kullanılmaktadır.",
  "Farmakoterapi nikotin yerine koyma tedavisi, bupropion ve vareniklinden oluşmaktadır. Sitizin de yine Onur hocamızın bahsettiği gibi son yıllarda ek bir seçenek olarak kullanıma girmiştir. Farmakoterapinin davranışsal destekle birlikte verilmesi ve gerektiğinde kombinasyonların düşünülmesi önerilmektedir."]),
 ("Çalışmanın amacı", 30, [
  "Çalışmanın amacı, kombine tedavinin ve yakın takibin sigara bırakma başarısı üzerindeki etkisini değerlendirmek ve bırakmayı etkileyen hasta özelliklerini belirlemektir."]),
 ("Tasarım ve örneklem", 60, [
  "Çalışma 1 Ağustos 2020 ile 31 Ağustos 2024 arasını kapsamaktadır. Polikliniğe başvuran, 18 yaş ve üzeri, sigara içen 432 hastanın dosyası taranmıştır.",
  "Verilerine eksiksiz ulaşılan 399 hasta analize alınmıştır. Tüm kayıtlar kullanıldığından örneklem büyüklüğü hesaplanmamıştır. Yıllık kontrolüne gelmeyen hastaların takip bilgileri asistan hekimlerin yaptığı uzaktan görüşmelerle tamamlanmıştır."]),
 ("Veri toplama ve bağımlılık ölçümü", 60, [
  "Hasta dosyalarından yaş, cinsiyet, meslek, alkol kullanımı, kronik hastalık, sigara öyküsü ve uygulanan tedaviler kaydedilmiştir.",
  "Nikotin bağımlılığı ilk vizitte Fagerström Nikotin Bağımlılık Testi ile değerlendirilmiştir. 0–2 puan düşük, 3–7 puan orta, 8–10 puan yüksek bağımlılık olarak sınıflanmıştır. Testin Türkçe geçerlik ve güvenilirlik çalışmasının 2004 yılında Uysal ve arkadaşları tarafından yapıldığı da makalede belirtilmiştir."]),
 ("Tedavi yaklaşımı", 60, [
  "Tedavi FNBT (Fagerström Nikotin Bağımlılık Testi) puanı, kronik hastalıklar, kullanılan ilaçlar, kontrendikasyonlar ve hasta uyumuna göre bireyselleştirilmiştir.",
  "Hastalara yalnızca davranışsal tedavi, monoterapi ya da kombine tedavi uygulanmıştır. Kombine tedavi seçenekleri bupropion ile NRT, vareniklin ile NRT, sitizin ile NRT ve üçlü tedavidir. Sağlık Bakanlığı politikaları doğrultusunda NRT ve sitizin belirli dönemlerde ücretsiz sağlanmıştır."]),
 ("İstatistiksel analiz", 45, [
  "Bu slaytı geçelim. Analizler SPSS 25 ile yapılmıştır. Normallik histogram ve Kolmogorov–Smirnov testiyle değerlendirilmiştir.",
  "Kategorik değişkenler ki-kare testiyle, iki grup karşılaştırmaları Mann–Whitney U, ikiden fazla grup karşılaştırmaları Kruskal–Wallis testiyle yapılmıştır. Post-hoc karşılaştırmalarda Duncan testi kullanılmıştır.",
  "Tedavi yöntemlerinin bırakma üzerindeki etkisi ikili lojistik regresyonla değerlendirilmiş ve Bonferroni düzeltmesi uygulanmıştır."]),
 ("Katılımcıların genel özellikleri", 45, [
  "Bulgulara geçiyorum. Analize 399 hasta alınmıştır. Yaş ortalaması 44,69 yıldır ve hastaların yüzde 63,66'sı erkektir.",
  "Ortalama FNBT (Fagerström Nikotin Bağımlılık Testi) puanı 5,66, ortalama tüketim 27,38 paket-yıl, hasta başına ortalama görüşme sayısı 2,21'dir. Hastaların yüzde 34,09'u, yani yaklaşık üçte biri sigarayı bırakmıştır."]),
 ("Bağımlılık düzeyi ve deneme öyküsü", 45, [
  "FNBT (Fagerström Nikotin Bağımlılık Testi) puanlarına göre hastaların yüzde 13,19'u düşük, yüzde 61,34'ü orta, yüzde 25,46'sı yüksek bağımlılık düzeyindedir.",
  "Hastaların yüzde 75,69'u daha önce sigarayı bırakmayı denemiş ve bunların yaklaşık yarısı bu denemede profesyonel destek almıştır. Yüzde 7,19'u sigara dışında elektronik sigara, nargile veya puro gibi tütün ürünleri kullanmaktadır."]),
 ("Sosyodemografik özellikler (Tablo 1)", 45, [
  "Tabloda katılımcıların sosyodemografik özellikleri yer almaktadır. En kalabalık yaş grubu yüzde 45,61 ile 26–44 yaş grubudur. Hastaların yüzde 81,96'sı evlidir ve yüzde 43,36'sı yükseköğretim mezunudur.",
  "Hastaların yüzde 85,96'sı il merkezinde yaşamaktadır. Yüzde 39,6'sının hanesinde sigara içen başka biri bulunmaktadır."]),
 ("Sosyodemografik özelliklere göre bırakma (Tablo 2, birinci bölüm)", 45, [
  "Bu tabloda sosyodemografik özelliklere göre bırakma durumu karşılaştırılmıştır. Tablo uzun olduğu için iki slayta bölünmüştür; ikinci bölümü bir sonraki slayttadır. Tablonun ilk bölümünde cinsiyet, yaş grubu, medeni durum ve eğitim durumu yer almaktadır.",
  "Bu değişkenlerin hiçbirinde başarılı ve başarısız gruplar arasında anlamlı fark bulunmamıştır."]),
 ("Sosyodemografik özelliklere göre bırakma (Tablo 2, devam)", 45, [
  "Tablonun ikinci bölümünde yerleşim yeri, çalışma durumu, hanede başka sigara içen varlığı ve alkol kullanımı yer almaktadır.",
  "Anlamlı fark yalnızca hanede başka sigara içen varlığında bulunmuştur. Hanesinde sigara içen biri olmayanların yüzde 39,8'i, olanların yüzde 25,3'ü sigarayı bırakmıştır; p değeri 0,003'tür."]),
 ("Kullanılan tedavi seçenekleri (Tablo 3)", 45, [
  "Tabloda uygulanan tedaviler görülmektedir. En sık uygulanan yöntem 141 hasta ile kombine tedavidir. Bunu 109 hasta ile bupropion ve 80 hasta ile NRT monoterapisi izlemektedir.",
  "Kombine tedavi alan hastaların 125'i bupropion ile NRT almıştır. Vareniklin 18, sitizin 34 hastada tek başına kullanılmış; 17 hastaya yalnızca non-farmakolojik (davranışsal) tedavi uygulanmıştır."]),
 ("Görüşme sayısı, FNBT ve paket-yıl (Tablo 4)", 45, [
  "Burada da sigara içme ve tedaviye ilişkin bazı parametreler sigara bırakma durumu ile karşılaştırılmıştır. Sigarayı bırakanlar ortalama 2,83 kez, bırakamayanlar 1,96 kez görüşmeye gelmiştir; fark anlamlıdır, p<0,001.",
  "Bırakanların FNBT (Fagerström Nikotin Bağımlılık Testi) puanı daha düşüktür: 5,26'ya karşı 5,85; p değeri 0,024'tür.",
  "Paket-yıl açısından iki grup arasında anlamlı fark bulunmamıştır."]),
 ("Tedavi yöntemine göre bırakma (Tablo 5)", 60, [
  "Bu tabloda tedavi yöntemlerine göre bırakma oranları yer almaktadır. Makalede en yüksek bırakma oranının yüzde 43,98 ile kombine tedavi grubunda olduğu ve kombine tedavinin diğer tüm seçeneklerden anlamlı derecede üstün olduğu bildirilmektedir.",
  "NRT grubunda oran yüzde 37,5, sitizin ve yalnızca davranışsal tedavi gruplarında yüzde 35,3'tür. En düşük oran yüzde 16,52 ile bupropion monoterapisindedir. Gruplar arasındaki fark anlamlıdır, p<0,001."]),
 ("Lojistik regresyon (Tablo 6)", 75, [
  "Burada lojistik regresyon sonuçları görülmektedir. Referans grup bupropion monoterapisidir ve Exp(B) sütunu odds oranını vermektedir.",
  "Bupropiona göre bırakma olasılığı vareniklinde 4,0, kombine tedavide 4,0, NRT'de 3,0, sitizinde 2,8 kat yüksektir. Farmakolojik tedavi almayanlarda görülen 2,8 katlık fark anlamlı değildir.",
  "Hanede sigara içen olmaması bırakma olasılığını yaklaşık iki katına, sigaraya bağlı yakınma olmaması 1,6 katına çıkarmaktadır."]),
 ("Tartışma: tedaviler ve literatür", 60, [
  "Makalede bulgular literatürle karşılaştırılmaktadır. Vareniklinin bupropiona üstünlüğü büyük ölçekli meta-analizler ve randomize kontrollü çalışmalarla uyumludur. Bu üstünlüğün, vareniklinin α4β2 nikotinik reseptördeki parsiyel agonist etkisiyle ilişkili olduğu düşünülmektedir.",
  "Sitizin vareniklinle benzer mekanizmaya sahip, maliyet-etkin bir seçenektir; plaseboya üstün ve NRT ile benzer etkinlikte bulunmuştur.",
  "Kombine tedavinin üstünlüğü, monoterapi yetersiz kaldığında kombinasyon öneren kılavuzlarla uyumludur.",
  "Benli ve arkadaşlarının çalışmasında da vareniklin ilk altı ayda bupropiondan daha yüksek bırakma oranı sağlamıştır."]),
 ("Tartışma: başarıyı etkileyen faktörler", 75, [
  "Makalede davranışsal desteğin önemi vurgulanmaktadır: Daha fazla görüşmeye gelen hastalarda bırakma oranı daha yüksektir.",
  "Hanede sigara içen olmaması bırakma olasılığını neredeyse iki katına çıkarmaktadır. Literatürde eşin veya aile bireylerinin sigara içmesi hem tetikleyici hem de motivasyon engeli olarak tanımlanmaktadır.",
  "Hastaların ortalama FNBT (Fagerström Nikotin Bağımlılık Testi) puanı, tedavi arayan sigara içicilerinde bildirilen yaklaşık 5 puanla uyumludur ve yüksek puan düşük başarıyla ilişkilidir.",
  "Yakınması olmayan hastalarda başarının daha yüksek olması, bu bireylerin anlık tepkisel korkudan ziyade uzun vadeli sağlığı koruma amacıyla içsel bir bırakma motivasyonuna sahip olabilmeleriyle açıklanmaktadır. İkinci bir olasılık olarak, kronik hastalığı veya semptomu olan bireylerin sigarayı bir baş etme aracı olarak kullanıyor olabileceği ve bunun bırakmayı zorlaştırabileceği belirtilmektedir."]),
 ("Kısıtlılıklar ve güçlü yönler", 45, [
  "Makalede kısıtlılık olarak asistan rotasyonlarının takip sürekliliğini etkileyebileceği, eksik verilerin telefonla ve hasta beyanıyla tamamlandığı ve vareniklinin piyasadan çekilmesinin ilaç seçimini etkilediği belirtilmektedir.",
  "Güçlü yön olarak, bu çalışmanın bilinen kadarıyla sitizin ile sigara bırakma tedavisini ele alan erişilebilir ilk tez çalışması olduğu ve birçok tedavi seçeneğini bir arada değerlendirdiği vurgulanmaktadır."]),
 ("Sonuç ve öneriler", 30, [
  "Çalışmanın sonucuna göre hastaların yaklaşık üçte biri sigarayı bırakmıştır. Kombine tedavi alanlarda bırakma oranı diğer seçeneklere göre daha yüksektir ve tedaviye uyum arttıkça başarı da artmaktadır.",
  "Makalede tedavi seanslarında hastaların bırakma motivasyonunu artırmaya yönelik çabaların yoğunlaştırılması önerilmektedir."]),
 ("Akılda kalacak mesajlar", 45, [
  "Sunumu beş mesajla özetlemek istiyorum.",
  "Hastaların yaklaşık üçte biri sigarayı bırakmıştır. Kombine tedavide başarı daha yüksektir. Bupropion monoterapisi en düşük başarının görüldüğü seçenektir. Hanede sigara içen olması başarıyı azaltmaktadır. Sık takip başarıyla ilişkilidir."]),
 ("Kaynaklar", 15, [
  "Kaynaklar kullanım sırasına göre listelenmiştir. Birinci kaynak sunulan makalenin kendisidir; diğerleri makalenin atıf yaptığı çalışmalardır."]),
 ("Kapanış", 15, [
  "İlginiz ve katkılarınız için teşekkür ederim. Sorularınızı ve görüşlerinizi almaktan memnuniyet duyarım."]),
]
assert len(S) == 26

SORULAR = [
 ("Lojistik regresyon neden kullanılmış?",
  "Sonuç değişkeni ikilidir (bıraktı/bırakamadı). Lojistik regresyon, birden fazla faktörü aynı anda modele koyarak her birinin bırakma olasılığı üzerindeki bağımsız etkisini tahmin eder."),
 ("Tablo 6'daki Exp(B) ne anlama geliyor?",
  "Exp(B) odds oranıdır. Referans gruba göre bırakma odds'unun kaç kat olduğunu gösterir. Örneğin kombine tedavide 3,968 değeri, bupropion monoterapisine göre bırakma odds'unun yaklaşık dört kat yüksek olduğu anlamına gelir. 1'in üzerindeki değerler bırakma lehinedir."),
 ("Tablo 6'daki B katsayısı nedir?",
  "B, lojistik regresyondaki ham katsayıdır ve logaritmik ölçektedir. Pozitif değer bırakma lehine, negatif değer aleyhine etkiyi gösterir. Exp(B), yani e üzeri B, bu katsayının odds oranına çevrilmiş halidir."),
 ("Wald χ² nedir, nasıl okunur?",
  "“Vald ki-kare” diye okunur. Her bir değişkenin katsayısının sıfırdan anlamlı derecede farklı olup olmadığını test eder; B'nin standart hatasına bölünüp karesi alınarak hesaplanır. Değer büyüdükçe p değeri küçülür."),
 ("Bonferroni düzeltmesi nedir?",
  "Çok sayıda karşılaştırma yapıldığında tesadüfen anlamlı sonuç bulma olasılığı artar. Bonferroni düzeltmesi, anlamlılık eşiğini karşılaştırma sayısına bölerek bu olasılığı azaltır. Makalede düzeltilmiş anlamlılık düzeyi p<0,003 olarak belirtilmiştir."),
 ("Neden Mann–Whitney U ve Kruskal–Wallis testleri kullanılmış?",
  "Makalede normal dağılım göstermeyen sürekli değişkenler için bu testlerin kullanıldığı belirtilmektedir. Bunlar parametrik olmayan testlerdir; iki grup için Mann–Whitney U, ikiden fazla grup için Kruskal–Wallis kullanılır."),
 ("FNBT nasıl puanlanıyor?",
  "Altı sorudan oluşur ve 0–10 arasında puanlanır. İlk sigara zamanı ve günlük sigara sayısı 0–3, diğer dört soru 0–1 puan alır. Makalede 0–2 düşük, 3–7 orta, 8–10 yüksek bağımlılık olarak sınıflanmıştır."),
 ("Cronbach alfa nedir?",
  "Bir ölçeğin iç tutarlılığını, yani soruların aynı kavramı ne ölçüde birlikte ölçtüğünü gösterir. Değer 0 ile 1 arasındadır. FNBT'nin Türkçe çalışmasında 0,56 olarak bildirilmiştir."),
 ("Retrospektif, kesitsel çalışma ne demektir?",
  "Retrospektif, verilerin geçmişte tutulmuş kayıtlardan geriye dönük olarak toplandığını; kesitsel, değişkenlerin belirli bir zaman noktasında değerlendirildiğini ifade eder. Bu çalışmada 2020–2024 yılları arasındaki poliklinik kayıtları incelenmiştir."),
 ("Neden örneklem hesabı yapılmamış?",
  "Çalışma döneminde polikliniğe başvuran tüm hastaların kayıtları alındığı için ayrıca bir örneklem büyüklüğü hesaplanmasına gerek duyulmamıştır."),
 ("Sitizin hakkında ne biliyoruz?",
  "Sitizin, vareniklin gibi α4β2 nikotinik asetilkolin reseptörünün parsiyel agonistidir. Klinik çalışmalarda plaseboya üstün, NRT ile benzer etkinlikte bulunmuştur. Makaleye göre ülkemizde belirli dönemlerde ücretsiz sağlanmıştır."),
]

def fmt(sn):
    m, s = divmod(sn, 60)
    return f"{s} sn" if m == 0 else (f"{m} dk {s} sn" if s else f"{m} dk")

d = docx.Document(SABLON)
body = d.element.body
for el in list(body):
    if not el.tag.endswith("}sectPr"):
        body.remove(el)

def par(text, style=None, size=None, bold=False, color=None, italic=False):
    p = d.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    if size: r.font.size = Pt(size)
    r.bold = bold or None
    r.italic = italic or None
    if color: r.font.color.rgb = color
    return p

toplam = sum(s for _, s, _ in S)
par("Konuşma Notları", size=22, bold=True, color=RGBColor(0x0F, 0x4C, 0x5C))
par("Makale sunumu: Sigara bırakma polikliniğine başvuran hastaların özellikleri ve bırakma başarısını etkileyen faktörler", size=13, color=RGBColor(0x2A, 0x9D, 0x8F))
par("Sunulan makale: Cenberlitaş E, Gökçe A, Öztürk O. Demographic and clinical characteristics of patients applying to a smoking cessation clinic affiliated with a university hospital and factors affecting their smoking cessation status. Turk J Fam Pract. 2026;30(2):97-106. doi:10.54308/TJFP.2026.912", size=10, color=GRI)

par("Genel bilgiler", style="Heading 1")
for t in [f"Sunum 26 slayttan oluşmaktadır. Konuşma süresi yaklaşık {round(toplam / 60)} dakikadır.",
          "Künye 2. slaytta, makalenin ilk sayfası gösterilirken sözlü olarak aktarılır.",
          "Telaffuz: Fagerström “Fa-ger-ström”, NRT “en-er-te”, Wald χ² “Vald ki-kare” diye okunur."]:
    par("• " + t, style="List Paragraph")

par("Slayt slayt konuşma metni", style="Heading 1")
for i, (b, sn, metin) in enumerate(S, 1):
    par(f"Slayt {i}: {b}  (≈ {fmt(sn)})", style="Heading 2")
    for m in metin:
        par(m)

par("Olası sorular ve yanıtlar", style="Heading 1")
par("Tartışma bölümünde hocalardan ve asistanlardan gelebilecek sorular için hazırlık notlarıdır.", italic=True, color=GRI)
for i, (q, c) in enumerate(SORULAR, 1):
    par(f"{i}. {q}", bold=True, color=RGBColor(0x0F, 0x4C, 0x5C))
    par(c)

d.save(CIKIS)
print("toplam:", fmt(toplam), "kelime:", sum(len(m.split()) for _, _, ms in S for m in ms))
