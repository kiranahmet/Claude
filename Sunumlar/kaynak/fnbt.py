# Fagerström Nikotin Bağımlılık Testi: hocanın slaytlarına dayalı hazırlık notu (Word)
import os, sys
kaynak = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "modeller.py"), encoding="utf-8").read()
exec(kaynak.split("# ---------------- Başlık ----------------")[0])

def dikkat(text):
    p = par(after=8)
    p.paragraph_format.left_indent = Cm(0.4)
    add(p, "Sorulursa: ", bold=True, color=VURGU, size=10)
    add(p, text, size=10)

par("Fagerström Nikotin Bağımlılık Testi", size=22, bold=True, color=KOYU, after=2)
par("Hocanın ders slaytlarına dayalı hazırlık notu", size=13, color=VURGU, after=4)
par("“Hoca, Slayt …” yazan bilgiler Prof. Dr. Onur Öztürk'ün “Tütün Bağımlılığına Yaklaşım” ders slaytlarından alınmıştır. “Makale” yazanlar sunulan makaleden, “Genel bilgi” yazanlar literatürdendir.", size=10, color=GRI, after=8)

# 1
par("1. Test hakkında", style="Heading 1")
madde("**Adı:** Hocanın slaytında “Fagerström Nikotin Bağımlılık Testi” olarak geçer (Hoca, Slayt 51). Kısaltması FNBT; İngilizcesi Fagerström Test for Nicotine Dependence (FTND).")
madde("**Okunuşu:** “Fa-ger-ström”. Hoca olgu slaytlarında “Fagerstrom skoru” diye yazmıştır; aynı testtir.")
madde("**Kimden geliyor (genel bilgi):** İsveçli psikolog Karl-Olov Fagerström. 1978'de geliştirdiği Fagerström Tolerans Anketi, 1991'de Heatherton ve arkadaşları tarafından gözden geçirilerek bugünkü 6 soruluk teste dönüştürülmüştür (sunumunuzdaki kaynak 6).")
madde("**Türkçe geçerlik ve güvenilirlik (makale):** Uysal ve arkadaşları, 2004. Cronbach alfa değeri 0,56 olarak bildirilmiştir (sunumunuzdaki kaynak 7).")
madde("**Ne ölçer:** Nikotine fiziksel bağımlılığın düzeyini. Hasta tarafından kısa sürede doldurulabilen 6 sorudan oluşur, toplam puan 0–10 arasındadır.")

# 2
par("2. Testin soruları ve puanlaması (Hoca, Slayt 51)", style="Heading 1")
tablo(["Soru", "Cevap", "Puan"], [
    ["1. Her gün genellikle kaç sigara içiyorsunuz?", "0–10\n11–20\n21–30\n30'dan fazla", "0\n1\n2\n3"],
    ["2. İlk sigaranızı uyandıktan ne kadar sonra içiyorsunuz?", "0–5 dk\n6–30 dk\n31–60 dk\n60 dk'dan sonra", "3\n2\n1\n0"],
    ["3. Sigara içilmeyen yerlerde sigara içmemekte zorlanıyor musunuz?", "Hayır\nEvet", "0\n1"],
    ["4. Hangi sigaradan vazgeçmekte en çok zorlanırsınız?", "Sabah ilk içilen\nDiğer", "1\n0"],
    ["5. Günün ilk saatlerinde sonraki saatlere göre daha sık sigara içiyor musunuz?", "Hayır\nEvet", "0\n1"],
    ["6. Çok hasta olduğunuzda veya günün çoğunu yatakta geçirdiğinizde sigara içer misiniz?", "Hayır\nEvet", "0\n1"],
], [9.0, 4.5, 2.0])
etiket("Puanlamada dikkat edilecekler")
madde("İki soru 0–3 puan alır: **günlük sigara sayısı** ve **uyandıktan sonra ilk sigara zamanı**. Diğer dört soru 0–1 puan alır. En yüksek toplam: 3 + 3 + 1 + 1 + 1 + 1 = 10.")
madde("İlk sigara sorusunda puan **ters** işler: ne kadar erken içilirse puan o kadar yüksektir (0–5 dk = 3 puan).")
etiket("Örnek hesap")
par("Günde 25 sigara (2) + uyanınca 10. dakikada ilk sigara (2) + yasak yerlerde zorlanıyor (1) + en zor bırakılan sabahki sigara (1) + sabah daha sık içmiyor (0) + hastayken içmiyor (0) = **6 puan → orta düzey bağımlılık**.")

# 3
par("3. Bağımlılık düzeyi (Hoca, Slayt 52)", style="Heading 1")
tablo(["Puan", "Bağımlılık düzeyi"], [
    ["0–2", "Düşük düzeyde bağımlılık"],
    ["3–7", "Orta düzeyde bağımlılık"],
    ["8–10", "Yüksek düzeyde bağımlılık"],
], [4.0, 8.0])
par("Makalede de aynı sınıflama kullanılmıştır: 0–2 düşük, 3–7 orta, 8–10 yüksek.")

# 4
par("4. Neden sabahki ilk sigara bu kadar önemli?", style="Heading 1")
madde("**Hoca, Slayt 36:** “Nikotinin yarı ömrü 2 saat olduğu için 6–8 saatten fazla maruziyet sonrasında vücutta birikir.”")
madde("**Hoca, Slayt 39:** “İki sigara arasında nörotransmitter seviyelerindeki azalma iritabilite ve stres gibi yoksunluk semptomlarına neden olur.”")
madde("Gece uykuda sigara içilmediği için sabah nikotin düzeyi düşmüş olur. Uyanır uyanmaz sigara içme ihtiyacı, yoksunluğun ne kadar güçlü olduğunu, yani fiziksel bağımlılığın derecesini gösterir. Bu yüzden ilk sigara zamanı ve sabahki sigarayla ilgili sorular testin ağırlıklı kısmıdır.")
not_kutusu("Genel bilgi: Günlük sigara sayısı ve ilk sigara zamanı, testin en güçlü iki sorusudur. Yalnızca bu iki sorudan oluşan kısa versiyona “Sigara İçme Ağırlığı İndeksi” (Heaviness of Smoking Index) denir; 0–6 puan arasındadır.")

# 5
par("5. Hocanın olgularında Fagerström skoru", style="Heading 1")
tablo(["Olgu (Hoca, Slayt)", "Skor", "Yaklaşım", "Sonuç"], [
    ["Vaka 1 (Slayt 80): 51 yaş erkek, din görevlisi, 5,5 paket/gün", "10 (yüksek)", "8 seans yüz yüze, sonra telefonla ayda 1, sonra 3 ayda 1 görüşme; vareniklin, ardından NRT", "Başarılı; seminerlere katılıyor"],
    ["Vaka 2 (Slayt 81): 76 yaş erkek, 70 yıldır içiyor, bırakmak istemiyor", "8 (yüksek)", "5R uygulanmış, bırakmayı düşünmesi önerilmiş", "Bilinmiyor (başarısız?)"],
    ["Vaka 3 (Slayt 83): 41 yaş kadın, astım atakları", "8 (yüksek)", "Daha önce vareniklinle başarısız; 4 seans, bupropion + NRT", "Başarılı"],
    ["Vaka 4 (Slayt 84): 23 yaş erkek, askerde başlamış", "2 (düşük)", "3 seans, NRT", "Başarılı"],
], [5.5, 2.2, 5.5, 2.8])
par("Olgulardan çıkarılabilecek mesaj (benim yorumum, slaytta yazmıyor): Yüksek skorlu hastalarda daha uzun ve yoğun takip, kombine veya ardışık tedavi; düşük skorlu hastada kısa takip ve tek ilaç yeterli olmuştur. Bırakmaya hazır olmayan hastada (Vaka 2) skor yüksek olsa da önce 5R uygulanmıştır.")

# 6
par("6. Sunulan makalede FNBT", style="Heading 1")
madde("Nikotin bağımlılığı **ilk vizitte** FNBT ile değerlendirilmiştir.")
madde("Ortalama puan **5,66 ± 2,43** (orta düzey).")
madde("Dağılım: düşük **%13,19**, orta **%61,34**, yüksek **%25,46**.")
madde("Bırakanların puanı daha düşük: **5,26'ya karşı 5,85; p = 0,024** (Tablo 4).")
madde("Lojistik regresyonda FNBT puanı bırakma başarısının **negatif öngörücüsü**: B = −0,022, p = 0,023. Yani puan arttıkça bırakma olasılığı azalmaktadır.")
madde("Tedavi seçiminde FNBT puanı; kronik hastalık, kullanılan ilaçlar, kontrendikasyonlar ve hasta uyumuyla birlikte dikkate alınmıştır.")
madde("Tartışmada, ortalama puanın tedavi arayan sigara içicilerinde bildirilen yaklaşık 5 puanla uyumlu olduğu belirtilmektedir.")

# 7
par("7. Olası sorular", style="Heading 1")
dikkat("“Fagerström bir kişi mi?” Evet. İsveçli psikolog Karl-Olov Fagerström; test onun adını taşır.")
dikkat("“Kaç soru, kaç puan?” 6 soru, 0–10 puan. Günlük sigara sayısı ve ilk sigara zamanı 0–3, diğer dört soru 0–1 puan.")
dikkat("“En önemli soru hangisi?” Uyandıktan sonra ilk sigaranın ne zaman içildiği. Ne kadar erken içiliyorsa bağımlılık o kadar yüksektir; 5 dakika içinde içen 3 puan alır.")
dikkat("“Cronbach alfa 0,56 ne demek?” Testin sorularının birbiriyle tutarlılığını gösterir. Türkçe çalışmada 0,56 olarak bildirilmiştir.")
dikkat("“Testin tedavi seçimine etkisi var mı?” Makalede tedavinin FNBT puanı, komorbidite, kontrendikasyon ve uyuma göre bireyselleştirildiği belirtilmektedir. Hocanın olgularında da yüksek skorlu hastalarda daha yoğun takip ve kombine/ardışık tedavi uygulanmıştır.")
dikkat("“Puan ile paket-yıl aynı şeyi mi ölçer?” Hayır. Paket-yıl toplam maruziyeti, FNBT bağımlılığın şiddetini ölçer. Makalede FNBT puanı bırakanlarda anlamlı olarak düşükken, paket-yılda iki grup arasında anlamlı fark bulunmamıştır.")

d.save(CIKIS)
print("ok")
