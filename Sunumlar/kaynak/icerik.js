// Sunum içeriği: slayt başlıkları, konuşma notları ve süreler.
// Hem PowerPoint not bölmesi hem de ayrı Word konuşma metni bu dosyadan beslenir.

const KAYNAK_KISA = "Kaynak: Cenberlitaş E, Gökçe A, Öztürk O. Turk J Fam Pract. 2026;30(2):97-106.";

const NOTLAR = {
  1: {
    baslik: "Başlık",
    sure: 1,
    metin: [
      "Günaydın hocalarım, değerli arkadaşlarım. Ben [Ad Soyad], [kaçıncı yıl] asistanıyım.",
      "Bugün sizlere, Turkish Journal of Family Practice dergisinin 2026 yılı 30. cilt 2. sayısında yayımlanan, Cenberlitaş, Gökçe ve Öztürk'ün “Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler” başlıklı özgün araştırma makalesini sunacağım.",
      "Konu birinci basamakta neredeyse her gün karşılaştığımız bir sorun olduğu için bu makaleyi seçtim."
    ]
  },
  2: {
    baslik: "İçerik",
    sure: 1,
    metin: [
      "Sunum 28 slayttan oluşmakta ve yaklaşık yarım saat sürecektir. Sonunda 10 dakikalık bir tartışma bölümü planladım.",
      "Önce makalenin künyesini ve giriş bölümünü, ardından gereç ve yöntemi aktaracağım. Bulgular bölümünde makaledeki altı tablonun öne çıkan sonuçlarını grafiklerle göstereceğim.",
      "Tartışma ve kısıtlılıklardan sonra makaleyi eleştirel gözle değerlendireceğim. Son olarak kısa bir olgu üzerinden sizlerin görüşlerini almak istiyorum."
    ]
  },
  3: {
    baslik: "Hedefler",
    sure: 1,
    metin: [
      "Bu sunumun sonunda üç şeyi hedefliyorum.",
      "Birincisi, sigara bırakma tedavilerinin gerçek yaşam koşullarındaki etkinliğini karşılaştırmak. İkincisi, bırakma başarısını etkileyen hasta ve çevre faktörlerini tanımak.",
      "Üçüncüsü ve belki en önemlisi, makaleyi yalnızca özetlemek değil, yöntem ve raporlama açısından eleştirel bir gözle değerlendirmek."
    ]
  },
  4: {
    baslik: "Makale künyesi",
    sure: 1,
    metin: [
      "Solda makalenin ilk sayfasını görüyorsunuz. Makale, Türkiye Aile Hekimleri Uzmanlık Derneği'nin yayın organı olan Turkish Journal of Family Practice'te 2026 yılında yayımlanmıştır. Açık erişimli olup CC BY lisansı ile yayımlanmıştır.",
      "Çalışma retrospektif, kesitsel bir araştırma olarak tanımlanmıştır. Veriler Samsun Eğitim ve Araştırma Hastanesi Sigara Bırakma Polikliniği'nden elde edilmiştir.",
      "Bir bilgi notu olarak: Dergi PubMed'de dizinlenmemektedir. Makaleye DOI numarası üzerinden ulaşılabilmektedir."
    ]
  },
  5: {
    baslik: "Sorunun büyüklüğü",
    sure: 1,
    metin: [
      "Giriş bölümünde yazarlar sorunun büyüklüğünü vurgulamaktadır. Küresel Yetişkin Tütün Araştırması 2016 verilerine göre Türkiye'de sigara içme prevalansı erkeklerde yüzde 44,1, kadınlarda yüzde 19,2'dir.",
      "Ülkemizde 500'ün üzerinde sigara bırakma polikliniği bulunmakta ve bu polikliniklere 2,5 milyondan fazla kişi başvurmuştur.",
      "Polikliniklerde bildirilen bırakma oranları ise yüzde 20 ile 50 arasında değişmektedir. Bu geniş aralık, hangi faktörlerin başarıyı belirlediği sorusunu gündeme getirmektedir."
    ]
  },
  6: {
    baslik: "Tedavi seçenekleri",
    sure: 1,
    metin: [
      "Sigara bırakma tedavisi iki ayak üzerinde durmaktadır. Davranışsal tarafta motivasyonel görüşme ve davranış değişikliği modelleri yer almaktadır; bunlardan en sık kullanılanı Transteorik Model'dir.",
      "Farmakolojik tarafta nikotin replasman tedavisi, bupropion ve vareniklin klasik seçeneklerdir. Sitizin ise ülkemizde son yıllarda kullanıma giren, vareniklinle benzer mekanizmaya sahip bir parsiyel agonisttir.",
      "Kılavuzlar farmakoterapinin davranışsal destekle birlikte verilmesini ve gerektiğinde kombinasyonların kullanılmasını önermektedir."
    ]
  },
  7: {
    baslik: "Amaç",
    sure: 0.5,
    metin: [
      "Yazarların amacı, kombine tedavinin ve yakın takibin sigara bırakma başarısı üzerindeki etkisini değerlendirmek ve bırakmayı etkileyen hasta özelliklerini belirlemektir.",
      "Bu amacın ileride bulgular bölümünde nasıl karşılandığına dikkatinizi çekmek istiyorum."
    ]
  },
  8: {
    baslik: "Tasarım ve örneklem",
    sure: 1.5,
    metin: [
      "Çalışma 1 Ağustos 2020 ile 31 Ağustos 2024 arasındaki dört yıllık dönemi kapsamaktadır. Polikliniğe başvuran, 18 yaş ve üzeri, sigara içen 432 hastanın dosyası taranmıştır.",
      "Bunlardan 33 dosyada veriler eksik olduğu için 399 hasta analize alınmıştır. Tüm kayıtlar kullanıldığından örneklem büyüklüğü hesaplanmamıştır.",
      "Yıllık kontrolünü kaçıran hastaların takip bilgileri asistan hekimler tarafından uzaktan görüşmeyle tamamlanmıştır. Bu noktaya kısıtlılıklarda tekrar değineceğim."
    ]
  },
  9: {
    baslik: "Veri toplama ve FNBT",
    sure: 1,
    metin: [
      "Hasta dosyalarından yaş, cinsiyet, meslek, alkol kullanımı, kronik hastalık, sigara öyküsü ve uygulanan tedaviler kaydedilmiştir.",
      "Nikotin bağımlılığı ilk vizitte Fagerström Nikotin Bağımlılık Testi ile ölçülmüştür. Altı sorudan oluşan test 0 ile 10 arasında puanlanmakta; 0–2 düşük, 3–7 orta, 8–10 yüksek bağımlılık olarak sınıflanmaktadır.",
      "Testin Türkçe geçerlik çalışmasında Cronbach alfa değeri 0,56 bulunmuştur. Bu değer iç tutarlılığın sınırlı olduğunu göstermektedir; ancak özgün İngilizce sürümde de 0,61 civarındadır ve testin az sayıda, farklı yönleri ölçen sorudan oluşmasıyla ilişkilidir."
    ]
  },
  10: {
    baslik: "Tedavi yaklaşımı",
    sure: 1,
    metin: [
      "Tedavi; FNBT puanı, kronik hastalıklar, kullanılan ilaçlar, kontrendikasyonlar ve hasta uyumuna göre bireyselleştirilmiştir.",
      "Hastalar üç gruba ayrılmıştır: yalnızca davranışsal tedavi, monoterapi ve kombine tedavi. Kombine tedavi seçenekleri bupropion ile NRT, vareniklin ile NRT, sitizin ile NRT ve üçlü tedavidir.",
      "Önemli bir ayrıntı: Sağlık Bakanlığı politikaları doğrultusunda NRT ve sitizin belirli dönemlerde ücretsiz verilmiştir. Bu durum tedavi seçimini ve uyumu etkilemiş olabilir."
    ]
  },
  11: {
    baslik: "İstatistiksel analiz",
    sure: 1.5,
    metin: [
      "Analizler SPSS 25 ile yapılmıştır. Dağılımın normalliği histogram ve Kolmogorov–Smirnov testiyle değerlendirilmiş, veriler normal dağılmadığı için non-parametrik testler tercih edilmiştir.",
      "Kategorik değişkenler ki-kare testiyle, iki grup karşılaştırmaları Mann–Whitney U, ikiden fazla grup karşılaştırmaları Kruskal–Wallis testiyle yapılmıştır. Post-hoc karşılaştırmalar için Duncan testi bildirilmiştir.",
      "Bağımsız belirleyicileri bulmak için ikili lojistik regresyon kurulmuş ve çoklu karşılaştırma için Bonferroni düzeltmesi uygulanarak anlamlılık eşiği p<0,003 olarak belirlenmiştir. Bu eşiği aklınızda tutmanızı rica ediyorum; regresyon sonuçlarında önemli olacak."
    ]
  },
  12: {
    baslik: "Katılımcıların genel özellikleri",
    sure: 1,
    metin: [
      "Bulgulara geçiyorum. Analize alınan 399 hastanın yaş ortalaması 44,7 yıldır; standart sapma 12,1 olup hastaların yaklaşık üçte ikisi 33–57 yaş aralığındadır.",
      "Hastaların yüzde 63,7'si erkektir. Ortalama FNBT puanı 5,66 ile orta düzey bağımlılığa karşılık gelmektedir. Ortalama tüketim 27,4 paket-yıl, hasta başına ortalama görüşme sayısı 2,21'dir.",
      "Genel bırakma oranı yüzde 34,1'dir; yani her üç hastadan biri sigarayı bırakmıştır."
    ]
  },
  13: {
    baslik: "Bağımlılık düzeyi ve deneme öyküsü",
    sure: 1,
    metin: [
      "Hastaların büyük çoğunluğu, yüzde 61'i, orta düzey bağımlılık grubundadır. Dörtte biri yüksek bağımlılık göstermektedir.",
      "Hastaların dörtte üçü daha önce bırakmayı denemiş, bunların yaklaşık yarısı profesyonel destek almıştır. Yüzde 7,2'si sigara dışında elektronik sigara, nargile veya puro gibi ürünler kullanmaktadır.",
      "Bir ayrıntıya dikkatinizi çekmek isterim: Bu yüzdeler makalede 399 değil 432 hasta üzerinden hesaplanmıştır. Örneğin 57, 265 ve 110 toplandığında 432 elde edilmektedir. Eleştirel değerlendirmede bu noktaya döneceğim."
    ]
  },
  14: {
    baslik: "Evde sigara içilmesi başarıyı azaltmaktadır",
    sure: 1,
    metin: [
      "Tablo 2'de sosyodemografik özellikler ile bırakma durumu karşılaştırılmıştır. Anlamlı fark yalnızca bir değişkende bulunmuştur: hanede başka bir sigara içicisinin varlığı.",
      "Hanesinde sigara içen olmayanların yüzde 39,8'i, olanların ise yüzde 25,3'ü sigarayı bırakmıştır; p değeri 0,003'tür.",
      "Cinsiyet, yaş, medeni durum, eğitim, yerleşim yeri, çalışma durumu ve alkol kullanımı ile bırakma arasında anlamlı ilişki saptanmamıştır. Kırsalda yaşayanlarda oran yüzde 23 ile düşük görünse de bu grup yalnızca 56 kişidir ve fark anlamlı değildir."
    ]
  },
  15: {
    baslik: "En sık kombine tedavi uygulanmıştır",
    sure: 1,
    metin: [
      "Tablo 3'te tedavi dağılımı görülmektedir. En sık uygulanan yöntem 141 hasta ile kombine tedavidir; bunu 109 hasta ile bupropion monoterapisi ve 80 hasta ile NRT monoterapisi izlemektedir.",
      "Vareniklin yalnızca 18 hastada kullanılmıştır; bunun nedeni çalışma döneminde vareniklinin piyasadan çekilmesidir. Sitizin 34 hastada tek başına verilmiştir.",
      "Kombine tedavi alanların büyük çoğunluğu, 141 hastanın 125'i, bupropion ile NRT almıştır. Özette bu sayı 134 olarak geçmektedir; tablo ile özet arasında küçük bir tutarsızlık bulunmaktadır."
    ]
  },
  16: {
    baslik: "En düşük başarı bupropion monoterapisinde",
    sure: 1.5,
    metin: [
      "Tablo 5 çalışmanın ana bulgusunu göstermektedir. Bupropion monoterapisi alanların yalnızca yüzde 16,5'i sigarayı bırakmıştır.",
      "Diğer tüm gruplarda bu oran yüzde 35 ile 44 arasındadır. En yüksek oranlar vareniklin ve kombine tedavi gruplarındadır; altı grup arasındaki fark anlamlıdır, p<0,001.",
      "İlginç bir nokta, hiç ilaç almayan 17 hastada bile oranın yüzde 35 olmasıdır. Bu grup küçüktür ve büyük olasılıkla motivasyonu yüksek, bağımlılığı düşük hastalardan oluşmaktadır. Bu durum seçim yanlılığının bir göstergesi olabilir."
    ]
  },
  17: {
    baslik: "Başarı görüşme sayısıyla artmaktadır",
    sure: 1,
    metin: [
      "Tablo 4'te sürekli değişkenler karşılaştırılmıştır. Sigarayı bırakanlar ortalama 2,83 kez, bırakamayanlar 1,96 kez görüşmeye gelmiştir; fark yüksek düzeyde anlamlıdır.",
      "Bırakanların FNBT puanı da daha düşüktür: 5,26'ya karşı 5,85. Fark istatistiksel olarak anlamlı olmakla birlikte yarım puan civarındadır ve bireysel hasta düzeyinde klinik önemi sınırlıdır.",
      "Paket-yıl açısından iki grup arasında fark bulunmamıştır. Görüşme sayısı bulgusunun yönü konusunda dikkatli olmak gerekir: Sık gelen hasta mı bırakıyor, yoksa bırakmayı başaran hasta mı kontrollere gelmeye devam ediyor? Retrospektif tasarım bu soruyu yanıtlayamamaktadır."
    ]
  },
  18: {
    baslik: "Lojistik regresyon (Tablo 6)",
    sure: 2,
    metin: [
      "Bu slaytta makalenin Tablo 6'sını özgün haliyle görüyorsunuz. Referans grup bupropion monoterapisidir; Exp(B) sütunu odds oranını vermektedir.",
      "Bupropiona göre bırakma odds'u vareniklinde 4,0, kombine tedavide 4,0, NRT'de 3,0, sitizinde 2,8 kat yüksektir. Hanede sigara içen olmaması odds'u yaklaşık 2 kat, sigaraya bağlı yakınma olmaması 1,6 kat artırmaktadır.",
      "Burada önemli bir nokta var: Yazarların kendi belirlediği Bonferroni eşiği p<0,003'tür. Bu eşiğe göre yalnızca NRT ve kombine tedavi anlamlı kalmaktadır; hane faktörü tam sınırdadır. Vareniklin, sitizin ve yakınma satırları 0,05'in altında olsa da düzeltilmiş eşiği geçmemektedir.",
      "Ayrıca tabloda bazı değerlerin başındaki “0,” basımda düşmüştür; örneğin standart hata 540 yerine 0,540 olarak okunmalıdır. Wald değerleri bu okumayı doğrulamaktadır."
    ]
  },
  19: {
    baslik: "Odds oranı, risk oranı değildir",
    sure: 1.5,
    metin: [
      "Asistan arkadaşlarım için kısa bir istatistik notu eklemek istedim. Makalede kombine tedavi için “bırakma olasılığı yaklaşık dört kat yüksek” denmektedir. Bu ifade odds oranına dayanmaktadır.",
      "Gerçek oranlara baktığımızda bupropion grubunda bırakma yüzde 16,5, kombine grupta yüzde 44'tür. Yani risk oranı yaklaşık 2,7'dir. Odds oranı ise 0,78'in 0,20'ye bölünmesiyle 3,97 çıkmaktadır.",
      "Sonuç sık görüldüğünde, bu çalışmada olduğu gibi yüzde 34 civarında, odds oranı etkiyi olduğundan büyük gösterir. Hastaya anlatırken “kombine tedavide başarı şansınız yaklaşık 2,5–3 kat artıyor” demek daha doğru olacaktır."
    ]
  },
  20: {
    baslik: "Tartışma: literatürle uyum",
    sure: 1.5,
    metin: [
      "Yazarlar bulgularını literatürle karşılaştırmıştır. Vareniklinin bupropiona üstünlüğü Cochrane ağ meta-analizi ve EAGLES çalışmasıyla uyumludur.",
      "Sitizin plaseboya üstün, NRT ile benzer bulunmuştur; Avustralya'daki randomize çalışmada vareniklinle benzer etkinlik ve daha az yan etki bildirilmiştir.",
      "Kombine tedavinin üstünlüğü kılavuzların monoterapi başarısız olduğunda veya bağımlılık ağır olduğunda kombinasyon önerisiyle örtüşmektedir. Hane faktörü ise eş desteğine yönelik Cochrane derlemesindeki bulgularla uyumludur."
    ]
  },
  21: {
    baslik: "Kısıtlılıklar",
    sure: 1,
    metin: [
      "Yazarlar üç kısıtlılık bildirmiştir. Birincisi, görüşmeleri yürüten asistanların rotasyonlar nedeniyle değişmesidir; bu durum takip sürekliliğini ve öz bildirimin doğruluğunu etkilemiş olabilir.",
      "İkincisi, eksik verilerin telefonla ve hasta beyanıyla tamamlanmasıdır. Üçüncüsü, vareniklinin piyasadan çekilmesi ve sitizinin kullanıma girmesinin ilaç seçimini değiştirmesidir.",
      "Yazarlar ayrıca ilaçların ücretsiz sağlanıp sağlanmadığının analiz edilmediğini ve bunun olası bir karıştırıcı faktör olduğunu belirtmektedir."
    ]
  },
  22: {
    baslik: "Eleştirel değerlendirme: yöntem",
    sure: 1.5,
    metin: [
      "Makalenin güçlü yönleriyle başlamak istiyorum. Gerçek yaşam verisi sunmaktadır, beş farklı tedavi seçeneğini bir arada değerlendirmektedir ve yazarların ifadesiyle sitizin ile ilgili erişilebilir ilk tez verisidir. Ayrıca bir yıllık takip süresi uygundur.",
      "Geliştirilebilecek yönlere gelince, en önemlisi randomizasyon olmamasıdır. Tedaviyi hekim ve hasta birlikte seçmiştir; bu da endikasyona bağlı karıştırıcılık yaratır. Örneğin ilaçsız grubun başarısı bunu düşündürmektedir.",
      "Bırakma durumu karbonmonoksit ölçümü gibi biyokimyasal bir yöntemle doğrulanmamıştır. Son olarak çalışma kesitsel olarak tanımlanmış olsa da başvurudaki özellikler ve bir yıl sonraki sonuç kullanıldığı için metodolojik olarak retrospektif kohort tasarımına daha yakındır."
    ]
  },
  23: {
    baslik: "Eleştirel değerlendirme: raporlama",
    sure: 1.5,
    metin: [
      "Raporlamada dikkatimi çeken noktaları yapıcı bir gözle paylaşmak istiyorum.",
      "Bonferroni eşiği yöntemde belirtilmiş ancak yorumda uygulanmamıştır. Kruskal–Wallis sonrası parametrik bir test olan Duncan kullanılmıştır; bu durumda Dunn testi daha uygun olurdu.",
      "Bazı yüzdeler 432, bazıları 399 hasta üzerinden verilmiştir. Özette erkek hasta sayısı 275, tablolarda 254'tür; kombine tedavi oranı da özet ve tabloda farklıdır.",
      "Yöntemde “sigarayı bırakamayanlar dışlandı” ifadesi yer almaktadır; bu ifade bulgularla çelişmektedir ve büyük olasılıkla bir yazım hatasıdır. Son olarak Tablo 4 ve 6'da bazı değerlerin başındaki sıfırlar basımda düşmüştür."
    ]
  },
  24: {
    baslik: "Sonuç",
    sure: 0.5,
    metin: [
      "Yazarların sonucu özetle şöyledir: Hastaların yaklaşık üçte biri sigarayı bırakmıştır. Kombine tedavi alanlarda bırakma oranı diğer seçeneklere göre daha yüksektir. Tedaviye uyum arttıkça bırakma oranı da artmaktadır.",
      "Yazarlar tedavi seansları sırasında hastaların motivasyonunu artırmaya yönelik çabaların yoğunlaştırılmasını önermektedir."
    ]
  },
  25: {
    baslik: "Olgu: Siz ne yapardınız?",
    sure: 3,
    metin: [
      "Şimdi kısa bir olgu üzerinden sizlerin görüşlerini almak istiyorum.",
      "52 yaşında erkek hasta; günde 25 sigara içiyor, 30 paket-yıl öyküsü var ve FNBT puanı 8, yani yüksek bağımlılık. İki yıl önce bupropion ile denemiş ve başaramamış. Eşi de sigara içiyor.",
      "Bu hastada hangi tedaviyi seçerdiniz? Takip sıklığını nasıl planlardınız? Eşini sürece nasıl dahil ederdiniz?",
      "[Burada 2–3 dakika görüş alın. Makaleye göre tartışmayı yönlendirebileceğiniz noktalar: Bupropion tek başına tekrar verilmemeli, kombine NRT veya sitizin/vareniklin temelli tedavi düşünülmeli, ilk ay sık kontrol planlanmalı ve eşe de bırakma danışmanlığı önerilmelidir.]"
    ]
  },
  26: {
    baslik: "Akılda kalacak mesajlar",
    sure: 1,
    metin: [
      "Sunumu özetlemek gerekirse beş mesajla ayrılmak istiyorum.",
      "Bupropion tek başına bu çalışmada en zayıf seçenek olmuştur. Kombine tedavi ve NRT, düzeltilmiş eşiği de geçen en güvenilir sonuçları vermiştir.",
      "Hastanın hanesinde sigara içen olup olmadığı mutlaka sorgulanmalıdır. Sık takip başarıyla ilişkilidir. Son olarak, retrospektif ve randomize olmayan tasarım nedeniyle bu sonuçlar dikkatli yorumlanmalıdır."
    ]
  },
  27: {
    baslik: "Kaynaklar",
    sure: 0.25,
    metin: [
      "Sunumda kullandığım kaynaklar Vancouver stiline uygun olarak, kullanım sırasıyla listelenmiştir. Birinci kaynak sunulan makalenin kendisidir; diğerleri makalenin atıf yaptığı çalışmalardır."
    ]
  },
  28: {
    baslik: "Kapanış",
    sure: 0.25,
    metin: [
      "İlginiz ve katkılarınız için teşekkür ederim. Sorularınızı ve görüşlerinizi almaktan memnuniyet duyarım."
    ]
  }
};

const SORULAR = [
  {
    s: "Neden ki-kare yerine lojistik regresyon da yapılmış?",
    c: "Ki-kare yalnızca iki değişken arasındaki ilişkiyi gösterir. Lojistik regresyon ise birden fazla faktörü aynı anda modele koyarak her birinin diğerlerinden bağımsız etkisini tahmin eder. Sonuç ikili (bıraktı/bırakamadı) olduğu için ikili lojistik regresyon seçilmiştir."
  },
  {
    s: "Bonferroni düzeltmesi neden yapılır, eşik nasıl 0,003 olmuş?",
    c: "Çok sayıda karşılaştırma yapıldığında tesadüfen anlamlı sonuç bulma olasılığı artar. Bonferroni, 0,05'i karşılaştırma sayısına böler. 0,05 / 16 ≈ 0,003 olduğuna göre yazarlar yaklaşık 16 karşılaştırma yapmış olmalıdır; hangi karşılaştırmaların sayıldığı makalede belirtilmemiştir."
  },
  {
    s: "Odds oranı ile risk oranı arasındaki fark nedir?",
    c: "Risk oranı iki grubun olay oranlarını doğrudan karşılaştırır (%44,0 / %16,5 ≈ 2,7). Odds oranı ise olma/olmama oranlarını karşılaştırır (0,78 / 0,20 ≈ 3,97). Olay nadirse ikisi birbirine yakındır; olay sık ise odds oranı etkiyi büyük gösterir."
  },
  {
    s: "Görüşme sayısı ile başarı arasındaki ilişki nedensel midir?",
    c: "Kesin söylenemez. Ters nedensellik olasıdır: Bırakmayı başaran hasta kontrollere gelmeye devam ederken başaramayan hasta takibi bırakabilir. Retrospektif tasarım bu ayrımı yapamaz."
  },
  {
    s: "İlaçsız grubun başarısı neden bupropionun iki katı?",
    c: "Bu grup yalnızca 17 hastadır ve fark anlamlı değildir (p=0,075). Büyük olasılıkla bağımlılığı düşük, motivasyonu yüksek hastalardan oluşmaktadır. Randomizasyon olmadığı için tedavi grupları başlangıçta birbirine benzememektedir."
  },
  {
    s: "FNBT'nin Cronbach alfası 0,56 iken test güvenilir mi?",
    c: "İç tutarlılık sınırlıdır; ancak özgün İngilizce sürümde de alfa 0,61 civarındadır. Testin altı sorudan oluşması ve soruların farklı boyutları ölçmesi bu durumu açıklamaktadır. Test, kabaca gruplama ve tedavi planlaması için kullanışlı bir tarama aracı olarak değerini korumaktadır."
  },
  {
    s: "Bu sonuçlar kendi polikliniğimize genellenebilir mi?",
    c: "Tek merkezli, eğitim hastanesi kaynaklı ve ilaçların dönemsel olarak ücretsiz verildiği bir örneklemdir. Birinci basamağa genellenirken hasta profili, ilaç erişimi ve takip olanakları farklılıkları göz önünde bulundurulmalıdır."
  }
];

module.exports = { NOTLAR, SORULAR, KAYNAK_KISA };
