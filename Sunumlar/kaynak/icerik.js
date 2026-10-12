// Sunum içeriği: slayt başlıkları, konuşma notları ve süreler.
// Sunum makaleyi aktarır; eleştirel değerlendirme içermez.

const KAYNAK_KISA = "Kaynak: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106.";

const NOTLAR = {
  1: { baslik: "Başlık", sure: 1, metin: [
    "Günaydın hocalarım, değerli arkadaşlarım. Ben [Ad Soyad], [kaçıncı yıl] asistanıyım.",
    "Bugün sizlere Turkish Journal of Family Practice dergisinin 2026 yılı 30. cilt 2. sayısında yayımlanan, Cenberlitaş, Gökçe ve Öztürk'ün “Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler” başlıklı özgün araştırma makalesini sunacağım.",
    "Konu birinci basamakta neredeyse her gün karşılaştığımız bir sorun olduğu için bu makaleyi seçtim."
  ]},
  2: { baslik: "İçerik", sure: 0.5, metin: [
    "Sunum 28 slayttan oluşmakta ve yaklaşık yarım saat sürecektir. Sonunda kısa bir tartışma bölümü planladım.",
    "Makalenin künyesi ve giriş bölümüyle başlayıp gereç ve yöntemi aktaracağım. Bulgular bölümünde makaledeki altı tabloyu özgün halleriyle göstereceğim. Ardından yazarların tartışma ve sonuçlarını aktaracak, kısa bir olgu üzerinden görüşlerinizi alacağım."
  ]},
  3: { baslik: "Hedefler", sure: 0.5, metin: [
    "Bu sunumun sonunda sigara bırakma tedavilerinin etkinliğini makalenin bulgularıyla karşılaştırmayı, bırakma başarısını etkileyen faktörleri tanımayı ve bu bulguları bir olgu üzerinden klinik pratiğimize aktarmayı hedefliyorum."
  ]},
  4: { baslik: "Makale künyesi", sure: 1, metin: [
    "Solda makalenin ilk sayfasını görüyorsunuz. Makale Türkiye Aile Hekimleri Uzmanlık Derneği'nin yayın organı olan Turkish Journal of Family Practice'te 2026 yılında yayımlanmıştır. Açık erişimlidir ve CC BY lisansıyla yayımlanmıştır.",
    "Çalışma retrospektif, kesitsel bir araştırmadır. Veriler Samsun Eğitim ve Araştırma Hastanesi Sigara Bırakma Polikliniği'nden elde edilmiştir."
  ]},
  5: { baslik: "Sorunun büyüklüğü", sure: 1, metin: [
    "Yazarlar giriş bölümünde tütün bağımlılığının önlenebilir ölüm nedenlerinin başında geldiğini vurgulamaktadır. Küresel Yetişkin Tütün Araştırması 2016 verilerine göre Türkiye'de sigara içme sıklığı erkeklerde yüzde 44,1, kadınlarda yüzde 19,2'dir.",
    "Ülkemizde 500'ün üzerinde sigara bırakma polikliniği bulunmakta, bu polikliniklere 2,5 milyondan fazla kişi başvurmuş bulunmaktadır. Polikliniklerde bırakma oranları yüzde 20 ile 50 arasında değişmektedir."
  ]},
  6: { baslik: "Tedavi seçenekleri", sure: 1, metin: [
    "Sigara bırakma tedavisi davranışsal yaklaşımlar ve farmakoterapiden oluşmaktadır. Davranışsal tarafta motivasyonel görüşme ve Transteorik Model gibi davranış değişikliği modelleri kullanılmaktadır.",
    "Farmakoterapi nikotin replasman tedavisi, bupropion ve vareniklinden oluşmaktadır. Sitizin son yıllarda ek bir seçenek olarak kullanıma girmiştir. Farmakoterapinin davranışsal destekle birlikte verilmesi ve gerektiğinde kombinasyonların düşünülmesi önerilmektedir."
  ]},
  7: { baslik: "Amaç", sure: 0.5, metin: [
    "Yazarların amacı, kombine tedavinin ve yakın takibin sigara bırakma başarısı üzerindeki etkisini değerlendirmek ve bırakmayı etkileyen hasta özelliklerini belirlemektir."
  ]},
  8: { baslik: "Tasarım ve örneklem", sure: 1, metin: [
    "Çalışma 1 Ağustos 2020 ile 31 Ağustos 2024 arasını kapsamaktadır. Polikliniğe başvuran, 18 yaş ve üzeri, sigara içen 432 hastanın dosyası taranmıştır.",
    "Verilerine eksiksiz ulaşılan 399 hasta analize alınmıştır. Tüm kayıtlar kullanıldığından örneklem büyüklüğü hesaplanmamıştır. Yıllık kontrolüne gelmeyen hastaların takip bilgileri asistan hekimlerin yaptığı uzaktan görüşmelerle tamamlanmıştır."
  ]},
  9: { baslik: "Veri toplama ve FNBT", sure: 1, metin: [
    "Hasta dosyalarından yaş, cinsiyet, meslek, alkol kullanımı, kronik hastalık, sigara öyküsü ve uygulanan tedaviler kaydedilmiştir.",
    "Nikotin bağımlılığı ilk vizitte Fagerström Nikotin Bağımlılık Testi ile değerlendirilmiştir. 0–2 puan düşük, 3–7 puan orta, 8–10 puan yüksek bağımlılık olarak sınıflanmıştır. Testin Türkçe geçerlik ve güvenilirlik çalışması 2004 yılında Uysal ve arkadaşları tarafından yapılmıştır."
  ]},
  10: { baslik: "Tedavi yaklaşımı", sure: 1, metin: [
    "Tedavi FNBT puanı, kronik hastalıklar, kullanılan ilaçlar, kontrendikasyonlar ve hasta uyumuna göre bireyselleştirilmiştir.",
    "Hastalara yalnızca davranışsal tedavi, monoterapi ya da kombine tedavi uygulanmıştır. Kombine tedavi seçenekleri bupropion ile NRT, vareniklin ile NRT, sitizin ile NRT ve üçlü tedavidir. Sağlık Bakanlığı politikaları doğrultusunda NRT ve sitizin belirli dönemlerde ücretsiz sağlanmıştır."
  ]},
  11: { baslik: "İstatistiksel analiz", sure: 1, metin: [
    "Analizler SPSS 25 ile yapılmıştır. Normallik histogram ve Kolmogorov–Smirnov testiyle değerlendirilmiştir.",
    "Kategorik değişkenler ki-kare testiyle, iki grup karşılaştırmaları Mann–Whitney U, ikiden fazla grup karşılaştırmaları Kruskal–Wallis testiyle yapılmıştır. Post-hoc karşılaştırmalarda Duncan testi kullanılmıştır.",
    "Tedavi yöntemlerinin bırakma üzerindeki etkisi ikili lojistik regresyonla değerlendirilmiş ve Bonferroni düzeltmesi uygulanmıştır."
  ]},
  12: { baslik: "Katılımcıların genel özellikleri", sure: 1, metin: [
    "Bulgulara geçiyorum. Analize 399 hasta alınmıştır. Yaş ortalaması 44,7 yıldır ve hastaların yüzde 63,7'si erkektir.",
    "Ortalama FNBT puanı 5,66, ortalama tüketim 27,4 paket-yıl, hasta başına ortalama görüşme sayısı 2,21'dir. Hastaların yüzde 34,1'i, yani yaklaşık üçte biri sigarayı bırakmıştır."
  ]},
  13: { baslik: "Bağımlılık düzeyi ve deneme öyküsü", sure: 1, metin: [
    "FNBT puanlarına göre hastaların yüzde 13,2'si düşük, yüzde 61,3'ü orta, yüzde 25,5'i yüksek bağımlılık düzeyindedir.",
    "Hastaların yüzde 75,7'si daha önce sigarayı bırakmayı denemiş ve bunların yaklaşık yarısı bu denemede profesyonel destek almıştır. Yüzde 7,2'si sigara dışında elektronik sigara, nargile veya puro gibi tütün ürünleri kullanmaktadır."
  ]},
  14: { baslik: "Tablo 1: Sosyodemografik özellikler", sure: 1, metin: [
    "Tablo 1'de katılımcıların sosyodemografik özellikleri yer almaktadır. Hastaların çoğu 26–44 yaş grubundadır, yüzde 82'si evlidir ve yüzde 43'ü yükseköğretim mezunudur.",
    "Hastaların yüzde 86'sı il merkezinde yaşamaktadır. Yüzde 39,6'sının hanesinde sigara içen başka biri bulunmaktadır."
  ]},
  15: { baslik: "Tablo 2: Sosyodemografik özellikler ve bırakma (1)", sure: 1, metin: [
    "Tablo 2'de sosyodemografik özelliklere göre bırakma durumu karşılaştırılmıştır. Tablonun ilk bölümünde cinsiyet, yaş grubu, medeni durum ve eğitim durumu yer almaktadır.",
    "Bu değişkenlerin hiçbirinde başarılı ve başarısız gruplar arasında anlamlı fark bulunmamıştır."
  ]},
  16: { baslik: "Tablo 2: Sosyodemografik özellikler ve bırakma (2)", sure: 1, metin: [
    "Tablonun ikinci bölümünde yerleşim yeri, çalışma durumu, hanede başka sigara içen varlığı ve alkol kullanımı yer almaktadır.",
    "Anlamlı fark yalnızca hanede başka sigara içen varlığında bulunmuştur. Hanesinde sigara içen olmayanların yüzde 39,8'i, olanların yüzde 25,3'ü sigarayı bırakmıştır; p değeri 0,003'tür."
  ]},
  17: { baslik: "Tablo 3: Tedavi seçenekleri", sure: 1, metin: [
    "Tablo 3'te uygulanan tedaviler görülmektedir. En sık uygulanan yöntem 141 hasta ile kombine tedavidir. Bunu 109 hasta ile bupropion ve 80 hasta ile NRT monoterapisi izlemektedir.",
    "Kombine tedavi alan hastaların 125'i bupropion ile NRT almıştır. Vareniklin 18, sitizin 34 hastada tek başına kullanılmış; 17 hastaya yalnızca farmakolojik olmayan tedavi uygulanmıştır."
  ]},
  18: { baslik: "Tablo 4: Görüşme sayısı, FNBT ve paket-yıl", sure: 1, metin: [
    "Tablo 4'te sürekli değişkenler bırakma durumuna göre karşılaştırılmıştır. Sigarayı bırakanlar ortalama 2,83 kez, bırakamayanlar 1,96 kez görüşmeye gelmiştir; fark anlamlıdır, p<0,001.",
    "Bırakanların FNBT puanı daha düşüktür: 5,26'ya karşı 5,85; p değeri 0,024'tür. Paket-yıl açısından iki grup arasında anlamlı fark bulunmamıştır."
  ]},
  19: { baslik: "Tablo 5: Tedaviye göre bırakma", sure: 1.5, metin: [
    "Tablo 5'te tedavi yöntemlerine göre bırakma oranları yer almaktadır. En yüksek oranlar vareniklin grubunda yüzde 44,5 ve kombine tedavi grubunda yüzde 44,0 olarak bulunmuştur.",
    "NRT grubunda oran yüzde 37,5, sitizin ve yalnızca davranışsal tedavi gruplarında yüzde 35,3'tür. En düşük oran yüzde 16,5 ile bupropion monoterapisindedir. Gruplar arasındaki fark anlamlıdır, p<0,001."
  ]},
  20: { baslik: "Tablo 6: Lojistik regresyon", sure: 1.5, metin: [
    "Tablo 6'da lojistik regresyon sonuçları görülmektedir. Referans grup bupropion monoterapisidir ve Exp(B) sütunu odds oranını vermektedir.",
    "Bupropiona göre bırakma olasılığı vareniklinde 4,0, kombine tedavide 4,0, NRT'de 3,0, sitizinde 2,8 kat yüksektir. Farmakolojik tedavi almayanlarda görülen 2,8 katlık fark anlamlı değildir.",
    "Hanede sigara içen olmaması bırakma olasılığını yaklaşık iki katına, sigaraya bağlı yakınma olmaması 1,6 katına çıkarmaktadır. Yazarlar ayrıca FNBT puanının bırakma başarısının negatif bir öngörücüsü olduğunu bildirmektedir."
  ]},
  21: { baslik: "Tartışma: tedaviler", sure: 1.5, metin: [
    "Yazarlar bulgularını literatürle karşılaştırmıştır. Vareniklinin bupropiona üstünlüğü büyük meta-analizler ve EAGLES çalışmasıyla uyumludur. Bu üstünlük, vareniklinin α4β2 nikotinik reseptördeki parsiyel agonist etkisiyle açıklanmaktadır.",
    "Sitizin vareniklinle benzer mekanizmaya sahip, maliyet-etkin bir seçenektir; plaseboya üstün ve NRT ile benzer etkinlikte bulunmuştur. Kombine tedavinin üstünlüğü, monoterapi yetersiz kaldığında kombinasyon öneren kılavuzlarla uyumludur.",
    "Benli ve arkadaşlarının çalışmasında da vareniklin ilk altı ayda bupropiondan daha yüksek bırakma oranı sağlamıştır."
  ]},
  22: { baslik: "Tartışma: başarıyı etkileyen faktörler", sure: 1.5, metin: [
    "Yazarlar davranışsal desteğin önemini vurgulamaktadır: Daha fazla görüşmeye gelen hastalarda bırakma oranı daha yüksektir.",
    "Hanede sigara içen olmaması bırakma olasılığını neredeyse iki katına çıkarmaktadır. Literatürde eşin veya aile bireylerinin sigara içmesi hem tetikleyici hem de motivasyon engeli olarak tanımlanmaktadır.",
    "Yüksek FNBT puanı düşük başarıyla ilişkilidir. Yakınması olmayan hastalarda başarının daha yüksek olması ise uzun vadeli sağlığı korumaya yönelik içsel motivasyonla açıklanmaktadır."
  ]},
  23: { baslik: "Kısıtlılıklar ve güçlü yönler", sure: 1, metin: [
    "Yazarlar kısıtlılık olarak asistan rotasyonlarının takip sürekliliğini etkileyebileceğini, eksik verilerin telefonla ve hasta beyanıyla tamamlandığını ve vareniklinin piyasadan çekilmesinin ilaç seçimini etkilediğini belirtmektedir.",
    "Güçlü yön olarak bu çalışmanın, bildikleri kadarıyla sitizin ile sigara bırakma tedavisini ele alan erişilebilir ilk tez çalışması olduğunu ve birçok tedavi seçeneğini bir arada değerlendirdiğini vurgulamaktadırlar."
  ]},
  24: { baslik: "Sonuç ve öneriler", sure: 0.5, metin: [
    "Yazarların sonucuna göre hastaların yaklaşık üçte biri sigarayı bırakmıştır. Kombine tedavi alanlarda bırakma oranı diğer seçeneklere göre daha yüksektir ve tedaviye uyum arttıkça başarı da artmaktadır.",
    "Yazarlar tedavi seanslarında hastaların bırakma motivasyonunu artırmaya yönelik çabaların yoğunlaştırılmasını önermektedir."
  ]},
  25: { baslik: "Olgu: Siz ne yapardınız?", sure: 3, metin: [
    "Bulguları pratiğe aktarmak için kısa bir olgu üzerinden görüşlerinizi almak istiyorum.",
    "52 yaşında erkek hasta; günde 25 sigara içiyor, 30 paket-yıl öyküsü var, FNBT puanı 8. Daha önce bupropion ile denemiş ve başaramamış. Eşi de sigara içiyor.",
    "Bu hastada hangi tedaviyi seçerdiniz? Takibi nasıl planlardınız? Eşini sürece nasıl dahil ederdiniz?",
    "[Burada 2–3 dakika görüş alın. Makalenin bulgularına göre tartışmayı şu noktalara yönlendirebilirsiniz: Kombine tedavi veya vareniklin/sitizin temelli tedavi, sık kontrol görüşmeleri ve eşe de bırakma danışmanlığı önerilmesi.]"
  ]},
  26: { baslik: "Akılda kalacak mesajlar", sure: 1, metin: [
    "Sunumu beş mesajla özetlemek istiyorum.",
    "Hastaların yaklaşık üçte biri sigarayı bırakmıştır. Kombine tedavide başarı daha yüksektir. Bupropion monoterapisi en düşük başarının görüldüğü seçenektir. Hanesinde sigara içen olup olmadığı sorgulanmalıdır. Sık takip başarıyla ilişkilidir."
  ]},
  27: { baslik: "Kaynaklar", sure: 0.25, metin: [
    "Kaynaklar Vancouver stiline uygun olarak, kullanım sırasıyla listelenmiştir. Birinci kaynak sunulan makalenin kendisidir; diğerleri makalenin atıf yaptığı çalışmalardır."
  ]},
  28: { baslik: "Kapanış", sure: 0.25, metin: [
    "İlginiz ve katkılarınız için teşekkür ederim. Sorularınızı ve görüşlerinizi almaktan memnuniyet duyarım."
  ]}
};

const SORULAR = [
  { s: "Lojistik regresyon neden kullanılmış?",
    c: "Sonuç değişkeni ikilidir (bıraktı/bırakamadı). Lojistik regresyon, birden fazla faktörü aynı anda modele koyarak her birinin bırakma olasılığı üzerindeki bağımsız etkisini tahmin eder." },
  { s: "Tablo 6'daki Exp(B) ne anlama geliyor?",
    c: "Exp(B) odds oranıdır. Referans gruba göre bırakma odds'unun kaç kat olduğunu gösterir. Örneğin kombine tedavide 3,97 değeri, bupropion monoterapisine göre bırakma odds'unun yaklaşık dört kat yüksek olduğu anlamına gelir. 1'in üzerindeki değerler bırakma lehinedir." },
  { s: "Bonferroni düzeltmesi nedir?",
    c: "Çok sayıda karşılaştırma yapıldığında tesadüfen anlamlı sonuç bulma olasılığı artar. Bonferroni düzeltmesi, anlamlılık eşiğini karşılaştırma sayısına bölerek bu olasılığı azaltır. Yazarlar düzeltilmiş eşiği p<0,003 olarak belirtmiştir." },
  { s: "FNBT nasıl puanlanıyor?",
    c: "Altı sorudan oluşur ve 0–10 arasında puanlanır. İlk sigara zamanı ve günlük sigara sayısı 0–3, diğer dört soru 0–1 puan alır. Makalede 0–2 düşük, 3–7 orta, 8–10 yüksek bağımlılık olarak sınıflanmıştır." },
  { s: "Cronbach alfa nedir?",
    c: "Bir ölçeğin iç tutarlılığını, yani soruların aynı kavramı ne ölçüde birlikte ölçtüğünü gösterir. Değer 0 ile 1 arasındadır. FNBT'nin Türkçe çalışmasında 0,56 olarak bildirilmiştir." },
  { s: "Retrospektif, kesitsel çalışma ne demektir?",
    c: "Retrospektif, verilerin geçmişte tutulmuş kayıtlardan geriye dönük olarak toplandığını; kesitsel, değişkenlerin belirli bir zaman noktasında değerlendirildiğini ifade eder. Bu çalışmada 2020–2024 yılları arasındaki poliklinik kayıtları incelenmiştir." },
  { s: "Sitizin hakkında ne biliyoruz?",
    c: "Sitizin, vareniklin gibi α4β2 nikotinik asetilkolin reseptörünün parsiyel agonistidir. Doğu ve Orta Avrupa'da uzun süredir kullanılmaktadır. Klinik çalışmalarda plaseboya üstün, NRT ve vareniklinle benzer etkinlikte bulunmuştur. Makaleye göre ülkemizde belirli dönemlerde ücretsiz sağlanmıştır." }
];

module.exports = { NOTLAR, SORULAR, KAYNAK_KISA };
