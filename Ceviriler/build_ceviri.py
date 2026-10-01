# -*- coding: utf-8 -*-
"""Türkçe çeviri HTML'ini üretir (tablolar veriden kurulur)."""
import html

OUT = "ceviri.html"

# ---------- Tablo verileri ----------
T1 = [
    ("Cinsiyet", [("Kadın", 145, "36,34"), ("Erkek", 254, "63,66")]),
    ("Yaş grubu (yıl)", [("<25", 20, "5,01"), ("26–44", 182, "45,61"), ("45–60", 147, "36,84"), ("61–75", 50, "12,54")]),
    ("Medeni durum", [("Evli", 327, "81,96"), ("Bekâr/Hiç evlenmemiş", 51, "12,78"), ("Dul", 21, "5,26")]),
    ("Eğitim durumu", [("İlköğretim", 95, "23,81"), ("Ortaöğretim", 131, "32,83"), ("Yükseköğretim", 173, "43,36")]),
    ("Yerleşim yeri", [("İl merkezi", 343, "85,96"), ("Kırsal/İl dışı", 56, "14,04")]),
    ("Çalışma durumu", [("Memur", 135, "33,83"), ("İşsiz/Ev hanımı/Emekli/Öğrenci", 137, "34,34"), ("İşçi", 50, "12,53"), ("Özel sektör", 77, "19,30")]),
    ("Hanede başka sigara içen varlığı", [("Evet", 158, "39,60"), ("Hayır", 241, "60,40")]),
]

T2 = [
    ("Cinsiyet", "0,331", [("Kadın", "100 (68,97)", "45 (31,03)"), ("Erkek", "163 (64,18)", "91 (35,82)")]),
    ("Yaş grubu", "0,587", [("<25", "15 (75,00)", "5 (25,00)"), ("26–44", "115 (63,20)", "67 (36,80)"), ("45–60", "101 (68,70)", "46 (31,30)"), ("61–75", "32 (64,00)", "18 (36,00)")]),
    ("Medeni durum", "0,614", [("Evli", "219 (67,20)", "107 (32,80)"), ("Bekâr/Hiç evlenmemiş", "31 (60,78)", "20 (39,22)"), ("Dul", "13 (61,90)", "8 (38,10)")]),
    ("Eğitim durumu", "0,632", [("İlköğretim", "66 (69,47)", "29 (30,53)"), ("Ortaöğretim", "83 (63,36)", "48 (36,64)"), ("Yükseköğretim", "114 (65,93)", "59 (34,07)")]),
    ("Yerleşim yeri", "0,169", [("İl merkezi", "220 (64,17)", "123 (35,83)"), ("Kırsal/İl dışı", "43 (76,79)", "13 (23,21)")]),
    ("Çalışma durumu", "0,719", [("Memur", "87 (64,44)", "48 (35,56)"), ("İşsiz/Ev hanımı/Emekli/Öğrenci", "88 (64,23)", "49 (35,77)"), ("İşçi", "33 (66,00)", "17 (34,00)"), ("Özel sektör", "55 (71,43)", "22 (28,57)")]),
    ("Hanede başka sigara içen", "0,003", [("Hayır", "145 (60,16)", "96 (39,84)"), ("Evet", "118 (74,68)", "40 (25,32)")]),
    ("Alkol kullanımı", "0,273", []),
]

T3_main = [
    ("Monoterapi", "Vareniklin monoterapisi", 18, "4,51"),
    ("", "Bupropion monoterapisi", 109, "27,32"),
    ("", "Sitizin monoterapisi", 34, "8,52"),
    ("", "NRT monoterapisi", 80, "20,05"),
    ("Farmakolojik", "Kombine tedavi", 141, "35,34"),
    ("Farmakolojik olmayan", "Farmakolojik olmayan tedavi", 17, "4,26"),
    ("Toplam katılımcı", "", 399, "100,00"),
]
T3_comb = [
    ("Bupropion + NRT", 125, "88,65"),
    ("Vareniklin + NRT", 14, "9,93"),
    ("Sitizin + NRT", 1, "0,71"),
    ("Vareniklin + Bupropion + NRT", 1, "0,71"),
]

T4 = [
    ("Görüşme sayısı", [("Başarısız", "1,96±1,17", "2 (1–6)"), ("Başarılı", "2,83±1,33", "3 (1–8)")], "<0,001"),
    ("FNBT puanı", [("Başarısız", "5,85±2,40", "6 (0–10)"), ("Başarılı", "5,26±2,52", "5 (0–10)")], "24"),
    ("Sigara tüketimi (paket-yıl)", [("Başarısız", "28,12±17,43", "26,5 (1,5–100)"), ("Başarılı", "26,66±15,25", "24 (1–72)")], "550"),
]

T5 = [
    ("Monoterapi", [("Vareniklin", "10 (55,55)", "8 (44,45)"), ("Bupropion", "91 (83,48)", "18 (16,52)"), ("Sitizin", "22 (64,70)", "12 (35,30)"), ("NRT", "50 (62,50)", "30 (37,50)")]),
    ("Kombine tedavi", [("Kombine tedavi", "79 (56,02)", "62 (43,98)")]),
    ("Farmakolojik tedavi yok", [("Yalnızca farmakolojik olmayan tedavi", "11 (64,70)", "6 (35,30)")]),
]

T6 = [
    ("Tedavi yöntemi (Referans: Bupropion monoterapisi)", [
        ("Vareniklin monoterapisi", "1,397", "540", "6,697", "0,010", "4,044"),
        ("Sitizin monoterapisi", "1,014", "442", "5,267", "0,022", "2,758"),
        ("NRT monoterapisi", "1,110", "346", "10,272", "0,001", "3,033"),
        ("Kombine tedavi", "1,378", "309", "19,924", "<0,001", "3,968"),
        ("Farmakolojik tedavi yok", "1,014", "569", "3,174", "0,075", "2,758"),
    ]),
    ("Hanede başka sigara içen (Referans: Evet)", [
        ("Hanede başka sigara içen yok", "669", "225", "8,823", "0,003", "1,953"),
    ]),
    ("Sigaraya bağlı yakınma (Referans: Var)", [
        ("Sigaraya bağlı yakınma yok", "489", "220", "4,932", "0,026", "1,630"),
    ]),
]

e = html.escape


def table1():
    rows = []
    for grp, items in T1:
        for i, (cat, n, pct) in enumerate(items):
            rows.append(f"<tr><td class='l'>{e(grp) if i == 0 else ''}</td><td class='l'>{e(cat)}</td><td class='c'>{n}</td><td class='c'>({pct})</td></tr>")
    rows.append("<tr><td class='l'>Toplam</td><td></td><td class='c'>399</td><td class='c'>100,00</td></tr>")
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 1.</b> Katılımcıların sosyodemografik özellikleri</div>
<table><thead><tr><th class='l'>Özellik</th><th class='l'>Kategori</th><th>n</th><th>%</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""


def table2():
    rows = []
    for grp, p, items in T2:
        rows.append(f"<tr><td class='l'>{e(grp)}</td><td></td><td></td><td class='c'>{p}</td></tr>")
        for cat, u, s in items:
            rows.append(f"<tr><td class='l ind'>{e(cat)}</td><td class='c'>{u}</td><td class='c'>{s}</td><td></td></tr>")
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 2.</b> Hastaların sosyodemografik özelliklerine göre sigara bırakma sonuçlarının karşılaştırılması</div>
<table><thead><tr><th class='l'>Özellik</th><th>Başarısız<br>n (%)</th><th>Başarılı<br>n (%)</th><th>p</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""


def table3():
    rows = []
    for a, b, n, pct in T3_main:
        rows.append(f"<tr><td class='l'>{e(a)}</td><td class='l'>{e(b)}</td><td class='c'>{n}</td><td class='c'>({pct})</td></tr>")
    rows.append("<tr><td class='l' colspan='2'>Spesifik kombine tedavi seçenekleri (Toplam n=141)</td><th>n</th><th>%</th></tr>")
    for b, n, pct in T3_comb:
        rows.append(f"<tr><td></td><td class='l'>{e(b)}</td><td class='c'>{n}</td><td class='c'>({pct})</td></tr>")
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 3.</b> Katılımcıların kullandığı tedavi seçenekleri</div>
<table><thead><tr><th class='l'>Tedavi kategorisi</th><th class='l'>Spesifik tedavi</th><th>n</th><th>%</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""


def table4():
    rows = []
    for ch, items, p in T4:
        for i, (st, m, med) in enumerate(items):
            rows.append(f"<tr><td class='l'>{e(ch) if i == 0 else ''}</td><td class='l'>{st}</td><td class='c'>{m}</td><td class='c'>{med}</td><td class='c'>{p if i == 0 else ''}</td></tr>")
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 4.</b> Sigara içme ve tedaviye ilişkin belirli parametrelerin sigara bırakma durumu ile karşılaştırılması</div>
<table><thead><tr><th class='l'>Özellik</th><th class='l'>Bırakma durumu</th><th>Ortalama ± SS</th><th>Ortanca (Min–Maks)</th><th>p değeri</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""


def table5():
    rows = []
    first = True
    for grp, items in T5:
        for i, (st, u, s) in enumerate(items):
            rows.append(f"<tr><td class='l'>{e(grp) if i == 0 else ''}</td><td class='l'>{e(st)}</td><td class='c'>{u}</td><td class='c'>{s}</td><td class='c'>{'<0,001' if first else ''}</td></tr>")
            first = False
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 5.</b> Tedavi yöntemlerinin sigara bırakma durumu ile karşılaştırılması</div>
<table><thead><tr><th class='l'>Tedavi yöntemi</th><th class='l'>Bırakma durumu</th><th>Başarısız<br>n (%)</th><th>Başarılı<br>n (%)</th><th>p değeri</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table>
<div class="fn">*Tüm tedavi grupları arasındaki karşılaştırmada Ki-kare testi kullanılmıştır.</div></div>"""


def table6():
    rows = []
    for grp, items in T6:
        rows.append(f"<tr><td class='l'>{e(grp)}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>")
        for cat, b, se, w, p, ex in items:
            rows.append(f"<tr><td></td><td class='l'>{e(cat)}</td><td class='c'>{b}</td><td class='c'>{se}</td><td class='c'>{w}</td><td class='c'>{p}</td><td class='c'>{ex}</td></tr>")
    return f"""
<div class="tbl"><div class="cap"><b>Tablo 6.</b> Sigara bırakma durumunu öngören tedavi yöntemleri ve ilişkili özelliklerin ileri analizi (lojistik regresyon)</div>
<table><thead><tr><th class='l'>Değişken</th><th class='l'>Kategori</th><th>B<br>(Katsayı)</th><th>S.H.<br>(Standart hata)</th><th>Wald χ<sup>2</sup></th><th>p değeri</th><th>Exp(B)<br>(Odds oranı)</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""


# ---------- Metin ----------
def r(*nums):  # kaynak üst simgesi
    return f"<sup class='ref'>[{','.join(str(n) for n in nums)}]</sup>"


ABSTRACT = """
<div class="abstract">
<div class="abs-title">ÖZ</div>
<p><b>Amaç:</b> Sigara bağımlılığı, önlenebilir ölüm nedenlerinin başında gelen ve tüm yaş gruplarını etkileyen ciddi bir halk sağlığı sorunudur. Çalışmamızda, bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özelliklerinin ve sigara bırakma durumlarını etkileyen faktörlerin incelenmesi amaçlanmıştır.</p>
<p><b>Yöntem:</b> Bu çalışma retrospektif, kesitsel bir çalışmadır. 01 Ağustos 2020 ile 31 Ağustos 2024 tarihleri arasında Samsun Eğitim ve Araştırma Hastanesi'ne bağlı sigara bırakma polikliniğine başvuran hastaların yaş, cinsiyet, meslek, kronik hastalık durumu, uygulanan tedaviler, sigara içme öyküleri ve Fagerström puanları, kişisel bilgileri paylaşılmaksızın hastane otomasyon sistemi aracılığıyla elde edilmiştir. Veriler SPSS paket programı kullanılarak analiz edilmiştir.</p>
<p><b>Bulgular:</b> Çalışmaya toplam 399 hasta dahil edildi. Hastaların %63,66'sı (n=275) erkekti. Hastaların ortalama Fagerström puanı 5,66±2,43 olarak hesaplandı. Hasta başına ortalama 2,21±1,28 görüşme yapıldı. Hastaların ortalama sigara içme süresi 27,38±16,57 paket-yıl olarak hesaplandı. Hastaların %35,19'unda (n=141) kombine tedavi başlandı. Kombine tedavi olarak hastaların %88,15'ine (n=134) Bupropion ve Nikotin Replasman Tedavisi (NRT) kombinasyonu başlandı. Tedavi sonucunda hastaların %34,09'u (n=136) sigarayı bıraktı. Bupropion monoterapisi, sigara bırakmada en az etkili ilaç olarak bulundu (p=0,01). Kombine tedavi alan hastalarda sigara bırakma oranı diğer tedavi seçeneklerine göre daha yüksek bulundu (p<0,001). Sigarayı bırakan hastaların Fagerström puanı bırakmayanlara göre anlamlı derecede düşükken (p=0,024), hasta başına düşen bireysel görüşme sayısı (p<0,001) anlamlı derecede yüksekti. Hanesinde sigara içen başka birinin bulunduğu hastaların oranı, sigarayı bırakanlarda bırakmayanlara göre daha düşüktü (p=0,003).</p>
<p><b>Sonuç:</b> Hastaların yaklaşık üçte birinin sigarayı bıraktığı gözlendi. Kombine tedavi kullanan hastaların sigara bırakma oranı diğer tedavi seçeneklerine göre daha yüksek bulundu.</p>
<p><b>Anahtar kelimeler:</b> bupropion, nikotin replasman tedavisi, sigara bırakma, sitizin, vareniklin</p>
</div>"""

INTRO = f"""
<h2>Giriş</h2>
<p>Tütün bağımlılığı, tüm yaş gruplarını etkileyen önemli bir halk sağlığı sorunudur ve dünya genelinde önlenebilir ölüm nedenlerinin başında gelmeye devam etmektedir.{r(1)} Düşük ve orta gelirli ülkelerdeki erken ölümlerin yaklaşık %80'inden sorumludur.{r(2,3)} Küresel Yetişkin Tütün Araştırması Türkiye 2016 verilerine göre sigara içme prevalansı erkeklerde %44,1, kadınlarda %19,2'dir.{r(4)}</p>
<p>Sigara bırakmada bireyin kararı, tutumları ve davranışları belirleyici rol oynar. Profesyonel yardım gerektiğinde yapılandırılmış tedavi, bırakma şansını büyük ölçüde artırır.{r(5)} Bununla birlikte sigara bırakma danışmanlığı sunmak, nikotin bağımlılığının kendisi kadar karmaşık ve zorludur. Türkiye'de 500'den fazla sigara bırakma polikliniği hizmet vermekte olup 2,5 milyondan fazla kişi sigara bırakma danışmanlığı almak için başvurmuştur.{r(6)} Türkiye'de sigara bırakma polikliniklerine başvuran bireylerin bırakma oranları %20 ile %50 arasında değişmektedir.{r(7)}</p>
<p>Türkiye'de düşük nikotin bağımlılığı, sağlık profesyonelleri tarafından düzenli takip, farmakolojik tedaviye uyum ve güçlü sosyal destek dahil olmak üzere birçok faktör sigara bırakma başarısını etkilemektedir.{r(8,9)}</p>
<p>Tedavi stratejileri hem davranışsal yaklaşımlardan hem de farmakoterapiden oluşur. Sağlık İnanç Modeli, Sağlık Kontrol Odağı, Yeniliklerin Yayılımı Modeli, Pender'in Sağlığı Geliştirme Modeli ve Transteorik Model, yaygın olarak uygulanan davranış değişikliği modelleri arasındadır.{r(10,11)} Farmakoterapi temel olarak nikotin replasman tedavisi (NRT – transdermal bant, sakız, burun spreyi, inhaler, dil altı tablet ve pastil), bupropion ve vareniklinden oluşur. Sitizin yakın zamanda ek bir farmakoterapi seçeneği olarak kullanıma sunulmuştur.{r(12)} Farmakoterapi uygulanırken ideal olarak davranışsal müdahalelerle desteklenmeli ve gerektiğinde kombine tedaviler düşünülmelidir.{r(5)}</p>
<p>Bu çalışmada, bir üniversite hastanesi sigara bırakma polikliniğine başvuran bireylerde kombine tedavi ve yakın takibin sigara bırakma başarısı üzerindeki etkisini değerlendirmeyi amaçladık. Bu hastaların özelliklerini ve bırakma sonuçlarını etkileyen faktörleri analiz ederek, gelecekte başvuracak kişiler için tedavi kararlarına yol gösterebilecek kanıtlar sunmayı hedefliyoruz.</p>

<h2>Gereç ve Yöntem</h2>
<h3>Çalışma tasarımı ve popülasyonu</h3>
<p>Bu çalışma kesitsel, retrospektif bir analiz olarak tasarlandı. Çalışma popülasyonu, 1 Ağustos 2020 ile 31 Ağustos 2024 tarihleri arasında Samsun Eğitim ve Araştırma Hastanesi Sigara Bırakma Polikliniği'ne gönüllü olarak başvuran, sigara içen ve ≥18 yaşındaki 432 hastadan oluştu. Mevcut tüm hasta kayıtları dahil edildiğinden örneklem büyüklüğü hesaplaması yapılmadı.</p>
<h3>Veri toplama</h3>
<p>Yaş, cinsiyet, meslek, alkol kullanımı, kronik hastalık varlığı, tedavi yöntemleri ve sigara öyküsü (paket-yıl) dahil demografik ve klinik veriler hastaların tıbbi kayıtlarından elde edildi. Her hastanın, ilk görüşmeye ve sonraki takip seanslarına ait verilerin belgelendiği bireysel bir dosyası vardı. Sigara bırakma danışmanlığı, sigara bırakma tedavisi sertifikasına sahip hekimler ve eğitim almış asistan hekimler tarafından verildi.</p>
<p>İlk vizitte nikotin bağımlılığı, Fagerström Nikotin Bağımlılık Testi (FNBT; Fagerström Test for Nicotine Dependence, FTND) ile değerlendirildi. 0–2 puan düşük, 3–7 puan orta ve 8–10 puan yüksek bağımlılık olarak sınıflandırıldı.{r(13)} FNBT'nin Türkçe geçerlik ve güvenilirlik çalışması 2004 yılında Uysal ve ark. tarafından yapılmış olup Cronbach alfa değeri 0,56 olarak bildirilmiştir.{r(14)}</p>
<p>Tedavi stratejileri FNBT puanlarına, kronik hastalık durumuna, eşzamanlı ilaç kullanımına, farmakoterapi kontrendikasyonlarına ve hasta uyumuna göre bireyselleştirildi. Hastalar yalnızca davranışsal tedavi, monoterapi (vareniklin, bupropion, sitizin, nikotin replasman tedavisi [NRT]) veya kombine tedavi (bupropion+NRT, vareniklin+NRT, sitizin+NRT ya da üçlü tedavi) aldı. Sağlık Bakanlığı politikaları doğrultusunda NRT ve sitizin belirli dönemlerde ücretsiz olarak sağlandı. Takip vizitleri hasta dosyalarına kaydedildi.</p>
<p>432 hasta dosyası mevcut olmasına rağmen 399 hastanın verilerine eksiksiz ulaşılabildi ve bu hastalar nihai analize dahil edildi. 31 Ağustos 2024 itibarıyla en az bir yıllık takibini tamamlamamış olan hastalar ile sigarayı bırakamayan hastalar analiz dışı bırakıldı. Yıllık kontrol vizitlerini kaçıran hastaların takip bilgileri, asistan hekimler tarafından yapılan uzaktan görüşmelerle elde edildi.</p>
<h3>Etik hususlar</h3>
<p>Çalışma protokolü için Etik Kurul onayı Samsun Üniversitesi Tıp Fakültesi'nden alındı (Onay No: 2023/18/10, tarih: 4 Ekim 2023). Tüm hastalardan ilk başvurularında yazılı bilgilendirilmiş onam alındı.</p>
<h3>İstatistiksel analiz</h3>
<p>İstatistiksel analizler SPSS 25.0 sürümü kullanılarak yapıldı. Dağılımın normalliği histogram grafikleri ve Kolmogorov–Smirnov testi ile değerlendirildi. Tanımlayıcı istatistikler ortalama ± standart sapma, ortanca ve minimum–maksimum değerler olarak sunuldu. Kategorik değişkenler ki-kare testi ile karşılaştırıldı. Normal dağılım göstermeyen sürekli değişkenler, iki grup karşılaştırmalarında Mann–Whitney U testi, ikiden fazla grup karşılaştırmalarında ise Kruskal–Wallis testi ile analiz edildi. p<0,05 değeri istatistiksel olarak anlamlı kabul edildi. Anlamlı sonuçlar için post-hoc ikili karşılaştırmalar Duncan testi ile yapıldı. Tedavi yöntemlerinin sigara bırakma sonuçları üzerindeki etkisini değerlendirmek için ikili (binary) lojistik regresyon analizi yapıldı ve Bonferroni düzeltmesi uygulandı (düzeltilmiş anlamlılık düzeyi: p<0,003).</p>

<h2>Bulgular</h2>
<p>Analize toplam 399 hasta dahil edildi. Katılımcıların yaş ortalaması 44,69 ± 12,05 yıl, ortanca yaş 44 (aralık: 18–74) idi. Çalışma popülasyonunun sosyodemografik özellikleri Tablo 1'de sunulmuştur. Sosyodemografik özellikler ile sigara bırakma durumu arasındaki karşılaştırmalar Tablo 2'de gösterilmiştir. Hanede sigara içen başka birinin bulunması, başarılı bırakma olasılığının anlamlı derecede daha düşük olmasıyla ilişkiliydi (p = 0,003). Benzer şekilde, sigaraya bağlı yakınma bildiren katılımcıların bırakma oranları daha düşüktü (p = 0,026).</p>
"""

RESULTS2 = f"""
<p>Fagerström Nikotin Bağımlılık Testi (FNBT) puanlarına göre katılımcıların %13,19'u (n = 57) düşük, %61,34'ü (n = 265) orta ve %25,46'sı (n = 110) yüksek nikotin bağımlılığına sahipti. Katılımcıların çoğunluğu (%75,69, n = 327) daha önce sigarayı bırakmayı denemiş olup bunların %49,85'i (n = 163) bu denemeler sırasında profesyonel destek almıştı. Hastaların toplam %7,19'u (n = 31) sigara dışında tütün ürünleri kullandığını bildirdi; bunlar arasında elektronik sigara (%3,70, n = 16), nargile (%3,94, n = 17), puro (%1,39, n = 6) ve diğer tütün ürünleri yer alıyordu.</p>
<p>Sigara bırakma polikliniğinde uygulanan tedavi yöntemlerinin dağılımı Tablo 3'te sunulmuştur. Hasta başına yüz yüze görüşme sayısı 1 ile 8 arasında değişiyordu. Sigarayı bırakamayan hastalar, başarıyla bırakanlara kıyasla anlamlı derecede daha az seansa katılmıştı (p < 0,001) ve anlamlı derecede daha yüksek FNBT puanlarına sahipti (p = 0,024). Sigara içme özellikleri, tedavi yaklaşımları ve bırakma sonuçlarına ilişkin ayrıntılı karşılaştırmalar Tablo 4'te sunulmuştur.</p>
<p>Kombine tedavi en yüksek bırakma oranlarıyla ilişkili olup diğer tüm tedavi seçeneklerinden anlamlı derecede üstündü (p < 0,001). Tedavi türleri ile sigara bırakma sonuçlarının karşılaştırması, bupropion monoterapisi referans kategori olarak alınarak Tablo 5'te sunulmuştur. Farmakolojik tedavi almayan hastalarda bırakma olasılığı bupropion ile tedavi edilenlere göre 2,76 kat daha yüksek olmasına rağmen bu fark istatistiksel olarak anlamlı değildi (p = 0,075). Lojistik regresyon analizi, hanede sigara içen başka birinin bulunmasının bırakma olasılığını anlamlı derecede azalttığını (p = 0,003), hanede sigara içen kimsenin olmamasının ise bırakma olasılığını neredeyse iki katına çıkardığını (Exp(B) = 1,953) ortaya koydu. FNBT puanı, bırakma başarısının anlamlı bir negatif öngörücüsüydü (B = −0,022, p = 0,023); bu, daha yüksek nikotin bağımlılığının daha düşük bırakma oranlarıyla ilişkili olduğunu göstermektedir. Sigaraya bağlı yakınmanın olmaması bırakma başarısıyla pozitif ilişkiliydi (B = 0,489, p = 0,026) ve yakınma bildirenlere kıyasla 1,63 kat daha yüksek bırakma olasılığına karşılık geliyordu. İleri analizler Tablo 6'da sunulmuştur.</p>
"""

DISCUSSION = f"""
<h2>Tartışma</h2>
<p>Bu çalışmada, bir sigara bırakma polikliniğine başvuran bireylerin özelliklerini analiz ettik ve bırakma başarısını etkileyen faktörleri araştırdık. Bulgularımız; vareniklin, sitizin, nikotin replasman tedavisi (NRT) ve kombine tedavilerin, en az etkili seçenek olan bupropion monoterapisine kıyasla bırakma oranlarını anlamlı derecede artırdığını göstermektedir. Daha düşük FNBT puanları ve hanede sigara içen kimsenin olmaması, daha yüksek bırakma başarısıyla ilişkiliydi.</p>
<p>Özellikle vareniklin monoterapisinin sigara bırakma olasılığını bupropiona kıyasla yaklaşık dört kat artırdığı bulundu (p = 0,010). Bu bulgu, literatürde vareniklinin bupropion ve tek ajanlı NRT'ye üstün etkinliğini gösteren büyük ölçekli meta-analizler ve randomize kontrollü çalışmalar (RKÇ) ile uyumludur.{r(15)} Vareniklinin α4β2 nikotinik asetilkolin reseptöründeki parsiyel agonist aktivitesinin nikotin isteğini (craving) ve yoksunluk belirtilerini azaltırken aynı zamanda nikotinin ödüllendirici etkilerini zayıflattığı ve böylece bırakma oranlarını artırdığı düşünülmektedir.{r(16)}</p>
<p>Benzer şekilde sitizin ve NRT monoterapisi, bupropiona kıyasla bırakma olasılığını yaklaşık üç kat artırdı. Vareniklinle benzer etki mekanizmasına sahip, maliyet-etkin bir parsiyel agonist olan sitizin Doğu ve Orta Avrupa'da yaygın olarak kullanılmaktadır. Klinik çalışmalardan elde edilen kanıtlar sitizinin plaseboya üstünlüğünü ve NRT ile karşılaştırılabilir etkinliğini doğrulamıştır.{r(17)} Bulgularımız sitizini bupropiona uygun bir alternatif olarak desteklemektedir. En yüksek bırakma oranları kombine tedavi alan hastalarda gözlendi; bu hastalarda bırakma olasılığı bupropion grubuna göre yaklaşık dört kat daha yüksekti. Bu bulgu, monoterapi başarısız olduğunda veya bağımlılık şiddetli olduğunda uzun etkili NRT (bant) ile kısa etkili NRT (sakız veya pastil) ya da vareniklin ile bupropion kombinasyonu gibi kombine rejimleri öneren güncel klinik kılavuzları desteklemektedir.{r('18-20')} Kombine yaklaşımlar birbirini tamamlayan mekanizmalar aracılığıyla etki eder, daha stabil nikotin düzeyleri sağlar ve akut nikotin isteğinin daha etkili yönetilmesine yardımcı olur. Sonuçlarımız; vareniklin alan hastaların bupropion alanlara göre 1. ve 2. haftalarda ve 1., 3. ve 6. aylarda daha yüksek bırakma oranlarına sahip olduğunu, ancak 12. ayda anlamlı fark gözlenmediğini bildiren Benli ve ark. ile uyumludur.{r(21)} Yakın tarihli büyük ölçekli Avustralya çalışmaları sitizin ile vareniklini karşılaştırmış ve sitizinin benzer etkinlik gösterirken daha düşük yan etki insidansı ve daha düşük maliyet sunduğunu bildirmiştir; bu durum sitizini kaynakları kısıtlı ortamlarda uygun bir seçenek haline getirmektedir.{r(22)} Rigotti ve arkadaşları, 810 katılımcılı randomize klinik çalışmalarında sitizinin plaseboya kıyasla anlamlı derecede daha yüksek bırakma oranları sağladığını göstermiştir.{r(23)}</p>
<p>Bir diğer önemli bulgu, davranışsal desteğin etkisidir. Yüz yüze danışmanlık seanslarının sayısının bırakma başarısıyla anlamlı derecede ilişkili olduğu, daha fazla seansa katılan hastaların daha yüksek bırakma oranlarına ulaştığı bulundu (p < 0,001). Bu gözlem, daha sık takip vizitlerinin sonuçları iyileştirdiğini gösteren önceki çalışmalarla uyumludur.{r(24,25)} Kohortumuzda hasta başına ortalama danışmanlık seansı sayısı 2,21 ± 1,28 idi; bu bulgu, yoğun davranışsal desteğin sürdürülebilir bırakma için kritik önem taşıdığı görüşünü desteklemektedir.</p>
<p>Özellikle dikkat çekici bir gözlem, hanede sigara içen başka birinin bulunmasının bırakma başarısını anlamlı derecede azaltması, hanede sigara içen kimsenin olmamasının ise bırakma olasılığını neredeyse iki katına çıkarmasıydı. Bu bulgu, bırakma sürecinde sosyal ve çevresel faktörlerin önemini vurgulamaktadır. Literatür, eşin veya hane üyelerinin sigara içmesinin hem bir tetikleyici hem de motivasyon önünde bir engel işlevi gördüğünü ve böylece bırakma başarı oranlarını düşürdüğünü göstermektedir.{r(26)}</p>
<p>FNBT ile ölçülen nikotin bağımlılığının şiddeti de bırakma sonuçlarının anlamlı bir öngörücüsüydü; bu, tedavi arayan sigara içicilerinde ortalama puanın yaklaşık 5 olduğunu bildiren önceki çalışmalarla uyumludur.{r(27)} Kohortumuzda ortalama FNBT puanı 5,66 ± 2,43 idi ve daha yüksek puanlar bırakma başarısıyla negatif ilişkiliydi; bu durum, yüksek bağımlılığı olan bireyler için daha yoğun farmakolojik ve davranışsal müdahalelere olan ihtiyacı ortaya koymaktadır.{r('28-30')}</p>
<p>İlginç bir şekilde, sigaraya bağlı yakınması olmayan katılımcıların, semptomu olanlara kıyasla 1,63 kat daha yüksek bırakma olasılığına sahip olduğu bulundu. Sağlık kaygılarının sıklıkla bırakmanın birincil motivasyon kaynağı olarak gösterildiği düşünüldüğünde bu durum sezgiye aykırı görünebilir; olası bir açıklama, asemptomatik bireylerin anlık tepkisel korkudan ziyade uzun vadeli sağlığı koruma amacıyla daha proaktif ve içsel bir bırakma motivasyonuna sahip olabileceğidir. Otonom motivasyonun, dışsal motivasyonla yapılan girişimlere kıyasla daha sürdürülebilir davranış değişikliğiyle sonuçlandığı gösterilmiştir.{r(31)} Bir diğer olası açıklama ise kronik hastalığı veya semptomları olan bireylerin sigarayı bir başa çıkma mekanizması olarak kullanabilmesi ve bunun bırakmayı zorlaştırabilmesidir.</p>
<p>Son olarak, çalışmamız sonuçları ilaçların ücretsiz sağlanıp sağlanmadığına göre ayrıntılı olarak incelememiş olsa da önceki araştırmalar, farmakoterapinin ücretsiz sağlanmasının tedaviye uyumu ve sigara bırakma başarısını artırdığını göstermiştir.{r(32)} Analizimizde maliyetle ilgili verilerin bulunmaması olası bir karıştırıcı faktör oluşturabilir.</p>

<h3>Kısıtlılıklar</h3>
<p>Bu bulgular yorumlanırken birkaç kısıtlılık göz önünde bulundurulmalıdır. Birincisi, hasta görüşmelerini yürüten asistan hekimlerin değişmesi nedeniyle (eğitim programları arasındaki rotasyonlardan kaynaklanan bir zorunluluk) hasta uyumunda kesintiler yaşanmış olabilir ve bu durum bazı katılımcılar için öz bildirime dayalı sigara bırakma durumunun doğruluğunu etkilemiş olabilir. İkincisi, standart dosyalama sistemine ek olarak eksik verilerin kaydedilmesinde telefon görüşmelerine ve hasta öz bildirimine dayanılması, veri bütünlüğü ve nesnellik açısından bir kısıtlılık oluşturmaktadır. Son olarak, vareniklinin (piyasadan çekilmesi nedeniyle) temin edilememesi ve ardından sitizinin kullanıma girmesi, çalışma dönemi boyunca terapötik ilaç seçim sürecini önemli ölçüde etkilemiştir.</p>

<h3>Güçlü yönler</h3>
<p>Bu çalışma, bildiğimiz kadarıyla sitizin ile sigara bırakma tedavisini ele alan erişilebilir ilk tez çalışması olması bakımından dikkate değer bir güçlü yön sunmaktadır. Ayrıca bupropion, vareniklin, sitizin ve Nikotin Replasman Tedavisi (NRT) dahil çeşitli tedavi yöntemlerinden elde edilen sonuçları kapsayan geniş yapısı, bu çalışmayı alana değerli bir katkı haline getirmektedir.</p>

<h2>Sonuç ve Öneriler</h2>
<p>Kombine tedavi alan hastalarda sigara bırakma oranları, monoterapi veya diğer tedavi seçeneklerini kullananlara göre daha yüksek bulundu. Artan tedavi uyumu ile daha yüksek bırakma oranları arasında pozitif bir korelasyon gözlendi. Bu bağlamda, tedavi seansları sırasında hastaların sigara bırakma motivasyonunu artırmaya yönelik çabaların yoğunlaştırılması önerilmektedir.</p>

<h3>Etik onay</h3>
<p>Çalışma protokolü Samsun Üniversitesi Tıp Fakültesi Etik Kurulu tarafından onaylanmıştır (Onay No: 2023/18/10, 4 Ekim 2023 tarihli). Tüm hastalardan ilk vizitlerinde yazılı bilgilendirilmiş onam alınmıştır.</p>
<h3>Yazar katkısı</h3>
<p>Yazarlar makaleye katkılarını şu şekilde beyan etmektedir: Çalışmanın kavramsallaştırılması ve tasarımı: OÖ, Veri toplama: EC, Sonuçların analizi ve yorumlanması: EC, Taslak makalenin hazırlanması: AG, OÖ, EC. Tüm yazarlar sonuçları gözden geçirmiş ve makalenin son halini onaylamıştır.</p>
<h3>Finansman kaynağı</h3>
<p>Yazarlar, çalışmanın herhangi bir finansman desteği almadığını beyan etmektedir.</p>
<h3>Çıkar çatışması</h3>
<p>Yazarlar, açıklanması gereken herhangi bir çıkar çatışması bulunmadığını beyan etmektedir.</p>
"""

REFS = [
 "Le Foll B, Piper ME, Fowler CD, et al. Tobacco and nicotine use. Nat Rev Dis Primers. 2022;8(1):19. [Crossref]",
 "Timilsina JK, Bhatta B, Devkota A. Nicotine dependence and quitting stages of smokers in Nepal: a community based cross-sectional study. PLoS One. 2022;17(4):e0266661. [Crossref]",
 "Çelik M, Erdoğan A. Epidemiology of tobacco use. Turkiye Klinikleri Family Medicine - Special Topics. 2016;7(5):5-12.",
 "Summers AD, Sirin H, Palipudi K, Erguder T, Ciobanu A, Ahluwalia IB. Changes in prevalence and predictors of tobacco smoking and interest in smoking cessation in Turkey: Evidence from the Global Adult Tobacco Survey, 2008-2016. Tob Prev Cessat. 2022;8:35. [Crossref]",
 "Öztürk O, Selçuk MY, Bektaş MY, Ünal M. Self-control, everything for smoking cessation? Turkish Journal of Family Medicine and Primary Care. 2016;10(1):4-5. [Crossref]",
 "2.5 million people received services from smoking cessation polyclinics. Available at: https://www.aa.com.tr/tr/saglik/sigarayi-birakma-polikliniklerinden-2-5-milyon-kisi-hizmet-aldi/1533870 (Accessed on Sep 25, 2025).",
 "Fidanci I, Ozturk O, Unal M. Transtheoretic Model in smoking cessation. J Exp Clin Med. 2017;34(1):9-13.",
 "Argüder Y, Kılınç O, Rezene M, Abadoğlu O, S. One-year smoking cessation outcomes of patients admitted to our smoking cessation clinic. Eurasian J Pulmonol. 2014;16(1):16-21",
 "Karadoğan D, Önal Ö, Şahin DS, Kanbay Y, Alp S, Şahin Ü. Treatment adherence and short-term outcomes of smoking cessation outpatient clinic patients. Tob Induc Dis. 30;16:38. [Crossref]",
 "Choi SH, Duffy SA. Analysis of health behavior theories for clustering of health behaviors. J Addict Nurs. 2017;28(4):203-209. [Crossref]",
 "Ezika E. Use of transtheoretical model to facilitate physical activity and promote cardiovascular health knowledge in an urban community setting. Int J Sci Res Arch. 2024;11(1):304-315. [Crossref]",
 "McDonough M. Update on medicines for smoking cessation. Aust Prescr. 2015;38(4):106-111. [Crossref]",
 "Heatherton TF, Kozlowski LT, Frecker RC, Fagerström KO. The Fagerström test for nicotine dependence: a revision of the Fagerström Tolerance Questionnaire. Br J Addict. 1991;86(9):1119-1127. [Crossref]",
 "Uysal M, Kadakal F, Karşıdağ Ç, Bayram N, Uysal O, Yilmaz V. Fagerström test for nicotine dependence: reliability in a Turkish sample and factor analysis. Tuberk Toraks. 2004;52(2):175-182.",
 "Cahill K, Stevens S, Perera R, Lancaster T. Pharmacological interventions for smoking cessation: an overview and network meta-analysis. Cochrane Database Syst Rev. 2013;2013(5):CD009329. [Crossref]",
 "Anthenelli RM, Benowitz NL, West R, et al. Neuropsychiatric safety and efficacy of varenicline, bupropion, and nicotine patch in smokers with and without psychiatric disorders (EAGLES): a double-blind, randomised, placebo-controlled clinical trial. Lancet. 2016;387(10037):2507-2520. [Crossref]",
 "Walker N, Howe C, Glover M, et al. Cytisine versus nicotine for smoking cessation. N Engl J Med. 2014;371(25):2353-2362. [Crossref]",
 "Koegelenberg CFN, Noor F, Bateman ED, et al. Efficacy of varenicline combined with nicotine replacement therapy vs varenicline alone for smoking cessation: a randomized clinical trial. JAMA. 2014;312(2):155-161. [Crossref]",
 "Lancaster T, Stead LF. Individual behavioural counselling for smoking cessation. Cochrane Database Syst Rev. 2017;3(3):CD001292. [Crossref]",
 "Patel MS, Patel SB, Steinberg MB. Smoking cessation. Ann Intern Med. 2021;174(12):ITC177-ITC192. [Crossref]",
 "Benli AR, Erturhan S, Oruc MA, Kalpakci P, Sunay D, Demirel Y. A comparison of the efficacy of varenicline and bupropion and an evaluation of the effect of the medications in the context of the smoking cessation programme. Tob Induc Dis. 2017;15:10. [Crossref]",
 "Courtney RJ, McRobbie H, Tutka P, et al. Effect of cytisine vs varenicline on smoking cessation: a randomized clinical trial. JAMA. 2021;326(1):56-64. [Crossref]",
 "Rigotti NA, Benowitz NL, Prochaska J, et al. Cytisinicline for smoking cessation: a randomized clinical trial. JAMA. 2023;330(2):152-160. [Crossref]",
 "Yılmaz A, Turan A. General characteristics of our patients in smoking cessation treatment and factors affecting treatment success. Izmir Chest Hospital Journal. 2015;3(29):145-149.",
 "Arpacıoğlu S, Ünübol B, Erzincan E, Bilici R. Results of the Erenköy Psychiatric And Neurological Diseases Hospital smoking cessation clinic: investigation of the effectiveness of cognitive behavioral intervention and pharmacotherapy. Addicta: The Turkish Journal on Addictions. 2019;6(4):295-231. [Crossref]",
 "Park EW, Schultz JK, Tudiver F, Campbell T, Becker L. Enhancing partner support to improve smoking cessation. Cochrane Database Syst Rev. 2004;(3):CD002928. [Crossref]",
 "Davis JM, Masclans L, Rose JE. Adaptive smoking cessation using precessation varenicline or nicotine patch: a randomized clinical trial. JAMA Netw Open. 2023;6(9):e2332214. [Crossref]",
 "Górecka D, Bednarek M, Nowiński A, Puścińska E, Goljan-Geremek A, Zieliński J. Diagnosis of airflow limitation combined with smoking cessation advice increases stop-smoking rate. Chest. 2003;123(6):1916-1923. [Crossref]",
 "Vangeli E, Stapleton J, Smit ES, Borland R, West R. Predictors of attempts to stop smoking and their success in adult general population samples: a systematic review. Addiction. 2011;106(12):2110-2121. [Crossref]",
 "Uzer F, Uzun R. General health status and smoking cessation rates of individuals admitted to the smoking cessation outpatient clinic. Thorac Res Pract 2019;20(1):113.",
 "Curry S, Wagner EH, Grothaus LC. Intrinsic and extrinsic motivation for smoking cessation. J Consult Clin Psychol. 1990;58(3):310-316. [Crossref]",
 "Aksel O, Küçüktepe N, Yaslıca Z, Başak O. Providing free access to smoking cessation medications: does ıt have an ımpact on the treatment adherence and success of smoking cessation? Turk Thorac J. 2021;22(3):224-230. [Crossref]",
]

refs_html = "<h2>Kaynaklar</h2><ol class='refs'>" + "".join(
    f"<li>{e(x).replace('[Crossref]', '<span class=cr>[Crossref]</span>')}</li>" for x in REFS) + "</ol>"

CSS = """
@page { size: 215mm 285mm; margin: 24mm 22mm 22mm 22mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: "Liberation Serif", "DejaVu Serif", serif; font-size: 10pt; line-height: 1.38; color: #111; }
p { margin: 0 0 7pt 0; text-align: justify; hyphens: manual; }
sup.ref { font-size: 7pt; line-height: 0; vertical-align: super; }
.sans { font-family: "Liberation Sans", "DejaVu Sans", sans-serif; }

/* ---- Sayfa 1 başlık ---- */
.top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12mm; }
.top .cite { font-family: "Liberation Sans", sans-serif; font-style: italic; font-size: 9pt; line-height: 1.5; color: #222; }
.badge { background: #1f3a8a; color: #fff; font-family: "Liberation Sans", sans-serif; font-size: 10.5pt; padding: 5px 16px; }
h1 { font-family: "Liberation Serif", serif; font-weight: bold; color: #1f3a8a; font-size: 18.5pt; line-height: 1.3; margin: 0 0 9pt 0; }
.authors { font-size: 13pt; margin-bottom: 9pt; color: #222; }
.authors sup { font-size: 8pt; color: #1f3a8a; }
.affil { font-size: 8.4pt; line-height: 1.4; margin-bottom: 5mm; }
.affil sup { font-size: 6.5pt; }
.abstract { background: #eef2fa; padding: 4mm 5mm 2.5mm 5mm; margin-bottom: 4mm; }
.abs-title { font-family: "Liberation Sans", sans-serif; font-weight: bold; color: #1f3a8a; font-size: 10.5pt; margin-bottom: 6pt; }
.abstract p { font-size: 9.3pt; line-height: 1.35; margin-bottom: 5pt; }
.corr { font-family: "Liberation Sans", sans-serif; font-size: 7.8pt; border-top: 0.6pt solid #999; padding-top: 4pt; display: flex; justify-content: space-between; margin-top: 2mm; }
.corr b { font-weight: bold; }
.copy { font-family: "Liberation Sans", sans-serif; font-size: 7pt; line-height: 1.35; color: #333; margin-top: 3pt; }
.copy a { color: #1f5fa8; text-decoration: none; }
.note { font-family: "Liberation Sans", sans-serif; font-size: 7pt; line-height: 1.35; color: #333; margin-top: 4pt; padding: 3pt 6pt; border-left: 2pt solid #1f3a8a; background: #f6f7fb; }

/* ---- Gövde: iki sütun ---- */
.cols { column-count: 2; column-gap: 7mm; column-fill: auto; }
h2 { font-family: "Liberation Sans", sans-serif; color: #1f3a8a; font-size: 12pt; margin: 8pt 0 5pt 0; break-after: avoid; }
h3 { font-family: "Liberation Sans", sans-serif; color: #1f3a8a; font-size: 10.2pt; margin: 6pt 0 3pt 0; break-after: avoid; }
h2:first-child, h3:first-child { margin-top: 0; }

/* ---- Tablolar ---- */
.tbl { column-span: all; margin: 3mm 0 5mm 0; break-inside: avoid; font-family: "Liberation Serif", serif; }
.tbl .cap { background: #dde5f4; font-size: 9.6pt; padding: 3pt 5pt; line-height: 1.3; }
.tbl table { width: 100%; border-collapse: collapse; font-size: 8.8pt; }
.tbl th, .tbl td { border: 0.5pt solid #e1e4ea; padding: 2pt 5pt; vertical-align: middle; line-height: 1.22; }
.tbl th { font-weight: bold; text-align: center; background: #f7f8fb; }
.tbl th.l { text-align: left; }
.tbl td.l { text-align: left; }
.tbl td.c { text-align: center; }
.tbl td.ind { padding-left: 16pt; }
.tbl .fn { font-size: 8pt; margin-top: 2pt; }

ol.refs { margin: 0; padding-left: 16pt; font-size: 9pt; line-height: 1.35; }
ol.refs li { margin-bottom: 4pt; padding-left: 2pt; text-align: justify; }
.cr { color: #1f5fa8; }
.brk { break-before: page; }
"""



import re as _re
_V = set("aeıioöuüâîûAEIİOÖUÜÂÎÛ")
def _syllables(w):
    # Türkçe hece kuralları: her hecede tek ünlü; V-CV, VC-CV, VCC-CV
    idx=[i for i,ch in enumerate(w) if ch in _V]
    if len(idx)<2: return [w]
    cuts=[]
    for a,b in zip(idx,idx[1:]):
        k=b-a-1  # aradaki ünsüz sayısı
        if k==0: cuts.append(b)
        elif k==1: cuts.append(b-1)
        elif k==2: cuts.append(b-1)
        else: cuts.append(b-1)  # kont-rol, Türk-çe
    parts=[]; p=0
    for c in cuts: parts.append(w[p:c]); p=c
    parts.append(w[p:])
    return parts
def _hyph_word(m):
    w=m.group(0)
    if len(w)<7: return w
    parts=_syllables(w)
    if len(parts)<2: return w
    out=parts[0]
    for pt in parts[1:]:
        # baştan/sondan en az 3 harf kalsın
        if len(out)>=3 and len(w)-len(out)>=3: out+="­"+pt
        else: out+=pt
    return out
_WORD=_re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]+")
def hyphenate(html_text):
    # etiketlerin dışındaki metni hecele
    pieces=_re.split(r"(<[^>]+>)", html_text)
    return "".join(p if p.startswith("<") else _WORD.sub(_hyph_word,p) for p in pieces)

ABSTRACT=hyphenate(ABSTRACT); INTRO=hyphenate(INTRO); RESULTS2=hyphenate(RESULTS2); DISCUSSION=hyphenate(DISCUSSION)

HEAD = f"""<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Sigara Bırakma Polikliniği Hastaları – Türkçe Çeviri</title><style>{CSS}</style></head><body>
<div class="top">
  <div class="cite">DOI: 10.54308/TJFP.2026.912</div>
  <div class="badge">Araştırma Makalesi</div>
</div>
<h1>Bir üniversite hastanesine bağlı sigara bırakma polikliniğine başvuran hastaların demografik ve klinik özellikleri ile sigara bırakma durumlarını etkileyen faktörler</h1>
<div class="authors">Emre Cenberlitaş<sup>1</sup>, Aksanur Gökçe<sup>2</sup>, Onur Öztürk<sup>3</sup></div>
<div class="affil">
<sup>1</sup>İstanbul Beylikdüzü Kavaklı 3 No'lu Aile Sağlığı Merkezi (Birim: 34.12.035), İstanbul, Türkiye<br>
<sup>2</sup>Amasya Üniversitesi Tıp Fakültesi, Aile Hekimliği Anabilim Dalı, Amasya, Türkiye<br>
<sup>3</sup>Amasya Üniversitesi Tıp Fakültesi, Aile Hekimliği Anabilim Dalı, Amasya, Türkiye
</div>
{ABSTRACT}
<div class="corr">
  <div>&#9993;&nbsp; Aksanur Gökçe &nbsp;&#9642;&nbsp; aksanurgokce@gmail.com</div>
  <div><b>Geliş:</b> 29.09.2025 &nbsp;&nbsp; <b>Kabul:</b> 11.03.2026 &nbsp;&nbsp; <b>Yayın:</b> 30.06.2026</div>
</div>
<div class="copy">Telif Hakkı © 2026 Yazar(lar). Türkiye Aile Hekimleri Uzmanlık Derneği (Turkish Association of Family Physicians) tarafından yayımlanmıştır. Bu makale, uygun atıf yapılması koşuluyla her ortam ve formatta sınırsız kullanım, dağıtım ve çoğaltmaya izin veren <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Atıf Lisansı (CC BY)</a> kapsamında yayımlanan açık erişimli bir makaledir.</div>
<div class="note"><b>Çeviri notu:</b> Bu belge, yukarıda künyesi verilen İngilizce makalenin Türkçe çevirisidir; orijinal makale yerine geçmez ve atıflarda özgün yayın esas alınmalıdır. Özgün kaynak: Cenberlitaş E, Gökçe A, Öztürk O. Demographic and clinical characteristics of patients applying to a smoking cessation clinic affiliated with a university hospital and factors affecting their smoking cessation status. Turk J Fam Pract 2026;30(2):97-106. DOI: 10.54308/TJFP.2026.912. Gövde metninde ondalık ayırıcı olarak Türkçe yazım kuralına uygun biçimde virgül, tablolarda ise orijinal yayındaki gibi nokta kullanılmıştır.</div>
"""

def dotdec(h):
    # tablolarda ondalık ayırıcı: orijinal yayındaki gibi nokta
    return _re.sub(r"(\d),(\d)", r"\1.\2", h)

BODY = f"""
<div class="cols brk">{INTRO}{dotdec(table1())}{dotdec(table2())}{RESULTS2}{dotdec(table3())}{dotdec(table4())}{dotdec(table5())}{dotdec(table6())}{DISCUSSION}{refs_html}</div>
</body></html>"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(HEAD + BODY)
print("wrote", OUT)
