# İstatistiksel yöntemler: soru-cevap hazırlık notu (Word). Yardımcı fonksiyonlar modeller.py'den alınır.
import os, sys
kaynak = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "modeller.py"), encoding="utf-8").read()
exec(kaynak.split("# ---------------- Başlık ----------------")[0])

def dikkat(text):
    p = par(after=8)
    p.paragraph_format.left_indent = Cm(0.4)
    add(p, "Sorulursa: ", bold=True, color=VURGU, size=10)
    add(p, text, size=10)

par("İstatistiksel Yöntemler", size=22, bold=True, color=KOYU, after=2)
par("Sunumun 10. slaytı için soru-cevap hazırlık notu", size=13, color=VURGU, after=4)
par("Yöntem bilgileri ve sayılar makalenin “İstatistiksel analiz” bölümünden ve tablolarından alınmıştır. Testlerin genel açıklamaları ders kitabı bilgisidir.", size=10, color=GRI, after=8)

etiket("Makalede yazan cümle (özet)")
not_kutusu("Analizler SPSS 25.0 ile yapıldı. Normallik histogram ve Kolmogorov–Smirnov testiyle değerlendirildi. Tanımlayıcı istatistikler ortalama ± standart sapma, ortanca ve minimum–maksimum olarak sunuldu. Kategorik değişkenler ki-kare testiyle karşılaştırıldı. Normal dağılım göstermeyen sürekli değişkenler iki grupta Mann–Whitney U, ikiden fazla grupta Kruskal–Wallis testiyle analiz edildi. p < 0,05 anlamlı kabul edildi. Anlamlı sonuçlar için post-hoc ikili karşılaştırmalar Duncan testiyle yapıldı. Tedavi yöntemlerinin etkisi ikili lojistik regresyonla değerlendirildi ve Bonferroni düzeltmesi uygulandı (düzeltilmiş anlamlılık düzeyi p < 0,003).")

etiket("Önce iki temel kavram")
madde("**Kategorik değişken:** Gruplara ayrılan değişken. Örnek: cinsiyet, medeni durum, bıraktı/bırakamadı, tedavi türü. Sonuç “sayı ve yüzde” olarak verilir.")
madde("**Sürekli değişken:** Ölçülen, sayısal değer alan değişken. Örnek: yaş, FNBT puanı, paket-yıl, görüşme sayısı. Sonuç “ortalama ± SS” veya “ortanca (min–maks)” olarak verilir.")

# 1
par("1. Normallik: Histogram ve Kolmogorov–Smirnov", style="Heading 1")
par("**Ne işe yarar:** Sürekli bir değişkenin normal dağılıp dağılmadığını, yani çan eğrisi şeklinde olup olmadığını gösterir. Hangi testin kullanılacağına bu sonuca göre karar verilir.")
madde("**Histogram:** Verinin çubuk grafiği. Göz ile değerlendirilir; simetrik çan şekli normal dağılımı düşündürür.")
madde("**Kolmogorov–Smirnov testi:** Verinin normal dağılımdan farkını sayısal olarak test eder.")
madde("p > 0,05 ise veri normal dağılıyor kabul edilir → parametrik testler (t testi, ANOVA).", 1)
madde("p < 0,05 ise veri normal dağılmıyor → parametrik olmayan testler (Mann–Whitney U, Kruskal–Wallis).", 1)
etiket("Bu makalede")
par("Makalede normal dağılım göstermeyen sürekli değişkenler için parametrik olmayan testlerin kullanıldığı belirtilmektedir. Bu yüzden tablolarda ortalama ± SS'nin yanında ortanca (min–maks) da verilmiştir (örneğin Tablo 4).")
dikkat("“Kolmogorov–Smirnov ve Shapiro–Wilk farkı ne?” Her ikisi de normallik testidir. Shapiro–Wilk küçük örneklemlerde (genellikle n < 50) daha güçlüdür; bu çalışmada örneklem 399 olduğu için Kolmogorov–Smirnov uygundur.")

# 2
par("2. Kategorik değişkenler: Ki-kare testi", style="Heading 1")
par("**Ne işe yarar:** İki kategorik değişken arasında ilişki olup olmadığını test eder. Gözlenen sayılarla, ilişki olmasaydı beklenecek sayıları karşılaştırır.")
etiket("Bu makalede")
madde("**Tablo 2:** Sosyodemografik özellikler ile bırakma durumu. Örnek: hanede sigara içen olanların %25,3'ü, olmayanların %39,8'i bırakmış; p = 0,003 (anlamlı). Cinsiyette p = 0,331 (anlamlı değil).")
madde("**Tablo 5:** Tedavi yöntemleri ile bırakma durumu; p < 0,001. Tablonun altındaki dipnotta “Tüm tedavi grupları arasındaki karşılaştırmada ki-kare testi kullanılmıştır” yazmaktadır.")
dikkat("“Ki-kare ne zaman kullanılamaz?” Beklenen hücre sayıları çok küçükse (genellikle 5'in altında) Fisher'in kesin testi tercih edilir.")

# 3
par("3. İki grup (sürekli): Mann–Whitney U testi", style="Heading 1")
par("**Ne işe yarar:** Normal dağılmayan sürekli bir değişkeni iki bağımsız grup arasında karşılaştırır. Bağımsız gruplar t testinin parametrik olmayan karşılığıdır. Değerleri sıraya dizip sıra numaralarını karşılaştırır, bu yüzden uç değerlerden az etkilenir.")
etiket("Bu makalede")
par("**Tablo 4:** Başarılı ve başarısız iki grup karşılaştırılmıştır:")
madde("Görüşme sayısı: başarılı 2,83, başarısız 1,96; p < 0,001 (anlamlı).")
madde("FNBT puanı: başarılı 5,26, başarısız 5,85; p = 0,024 (anlamlı).")
madde("Paket-yıl: başarılı 26,66, başarısız 28,12; anlamlı fark yok.")
not_kutusu("Tablo 4'te p değerleri orijinal tabloda “24” ve “550” olarak basılmıştır; metinde FNBT için p = 0,024 olarak geçmektedir. Okurken “sıfır virgül sıfır yirmi dört” demeniz yeterli.")

# 4
par("4. İkiden fazla grup: Kruskal–Wallis ve post-hoc Duncan", style="Heading 1")
par("**Kruskal–Wallis testi:** Normal dağılmayan sürekli bir değişkeni üç veya daha fazla grup arasında karşılaştırır. Tek yönlü ANOVA'nın parametrik olmayan karşılığıdır. Sadece “gruplar arasında en az bir fark var mı?” sorusuna cevap verir, farkın hangi gruplar arasında olduğunu söylemez.")
par("**Post-hoc test:** “Sonradan yapılan” anlamına gelir. Genel test anlamlı çıktığında, farkın hangi iki grup arasında olduğunu bulmak için ikili karşılaştırmalar yapılır.")
par("**Duncan testi:** Grupları ikişer ikişer karşılaştıran bir post-hoc (çoklu karşılaştırma) testidir.")
etiket("Bu makalede")
par("Makalenin tablolarında Kruskal–Wallis ve Duncan testinin hangi karşılaştırmada kullanıldığı ayrıca belirtilmemiştir; yöntem bölümünde genel olarak tanımlanmıştır.")
dikkat("“Duncan hangi durumda kullanılır?” Duncan testi klasik olarak ANOVA sonrasında kullanılan bir post-hoc testtir. Sorulursa “Makalede anlamlı sonuçlar için post-hoc ikili karşılaştırmaların Duncan testiyle yapıldığı belirtilmektedir” demeniz yeterli; ayrıntı için Onur hocamızın açıklaması daha doğru olur.")

# 5
par("5. Tedavinin etkisi: İkili lojistik regresyon", style="Heading 1")
par("**Ne işe yarar:** Sonuç değişkeni iki seçenekli olduğunda (bıraktı / bırakamadı) kullanılır. Birden fazla faktörü aynı modele koyarak her birinin bırakma olasılığına bağımsız etkisini gösterir. Diğer faktörler sabit tutulmuş gibi düşünülür.")
etiket("Tablo 6'daki sütunlar")
tablo(["Sütun", "Anlamı", "Nasıl okunur"], [
    ["B (Katsayı)", "Ham regresyon katsayısı (logaritmik ölçek)", "Pozitif: bırakma lehine; negatif: aleyhine"],
    ["S.H.", "Standart hata", "Katsayının kesinliği; küçükse tahmin daha kesin"],
    ["Wald χ²", "(B / S.H.)² ile hesaplanan test değeri", "“Vald ki-kare” okunur; büyüdükçe p küçülür"],
    ["p değeri", "Anlamlılık", "Küçükse etki tesadüfe bağlı değil"],
    ["Exp(B)", "Odds oranı (e üzeri B)", "1'den büyükse bırakma odds'u artar"],
], [3.0, 6.0, 6.5])
etiket("Bu makalede (referans: bupropion monoterapisi)")
madde("Vareniklin Exp(B) 4,044; kombine tedavi 3,968; NRT 3,033; sitizin 2,758 → bupropiona göre bırakma odds'u yaklaşık 3–4 kat yüksek.")
madde("Farmakolojik tedavi yok: 2,758 ama p = 0,075 → anlamlı değil.")
madde("Hanede sigara içen yok: 1,953 (≈ 2 kat); sigaraya bağlı yakınma yok: 1,630 (≈ 1,6 kat).")
madde("FNBT puanı: B = −0,022, p = 0,023 → negatif öngörücü; puan arttıkça bırakma olasılığı azalıyor.")
dikkat("“Referans grup neden bupropion?” Makalede bupropion monoterapisi en az etkili seçenek olarak tanımlanmakta ve diğer tedaviler ona göre karşılaştırılmaktadır.")
dikkat("“Odds oranı ile risk oranı aynı mı?” Hayır. Odds, olayın olma olasılığının olmama olasılığına oranıdır. Olay sık görüldüğünde odds oranı risk oranından büyük çıkar; bu yüzden “4 kat daha fazla bırakır” yerine “bırakma odds'u 4 kat yüksektir” demek daha doğrudur.")

# 6
par("6. Anlamlılık: p < 0,05 ve Bonferroni düzeltmesi", style="Heading 1")
par("**p değeri:** Gerçekte fark yokken, gözlenen kadar büyük bir farkın tesadüfen bulunma olasılığıdır. p < 0,05, bu olasılığın %5'ten küçük olduğu, yani farkın istatistiksel olarak anlamlı kabul edildiği anlamına gelir.")
par("**Bonferroni düzeltmesi:** Aynı veride çok sayıda karşılaştırma yapıldığında, en az birinin tesadüfen anlamlı çıkma olasılığı artar. Bonferroni düzeltmesi bunu önlemek için anlamlılık eşiğini karşılaştırma sayısına böler: düzeltilmiş eşik = 0,05 / karşılaştırma sayısı.")
etiket("Bu makalede")
par("Düzeltilmiş anlamlılık düzeyi p < 0,003 olarak belirtilmiştir.")
not_kutusu("Olası hesap (makalede yazmıyor, tarafımdan hesaplanmıştır): 6 tedavi grubu ikişer ikişer karşılaştırıldığında 15 karşılaştırma olur; 0,05 / 15 ≈ 0,0033 → p < 0,003.")
dikkat("“Tablo 6'da p değeri 0,010 ve 0,022 olan değişkenler düzeltilmiş eşiğe göre nasıl yorumlanmalı?” Makalede Bonferroni düzeltmesinin uygulandığı ve düzeltilmiş düzeyin p < 0,003 olduğu belirtilmektedir; düzeltmenin hangi karşılaştırmalara uygulandığına dair ayrıntıyı Onur hocamız daha iyi açıklayabilir.")

# Özet
par("Akılda tutmak için", style="Heading 1")
tablo(["Durum", "Normal dağılırsa", "Normal dağılmazsa (bu makale)"], [
    ["İki grup, sürekli değişken", "Bağımsız gruplar t testi", "Mann–Whitney U"],
    ["İkiden fazla grup, sürekli", "Tek yönlü ANOVA", "Kruskal–Wallis"],
    ["Kategorik değişkenler", "Ki-kare", "Ki-kare"],
    ["İki seçenekli sonuç, çok faktör", "İkili lojistik regresyon", "İkili lojistik regresyon"],
], [5.5, 4.5, 5.5])

d.save(CIKIS)
print("ok")
