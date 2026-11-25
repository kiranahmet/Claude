package com.robotsupurge.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Ana ekran widget'ı.
 *
 * Oda butonuna dokununca oda seçilir (mavi olur), tekrar dokununca seçim kalkar.
 * BAŞLAT seçili odaları süpürür, EVE DÖN robotu istasyona gönderir.
 * Ayarlarda "tek dokunuş" açıksa odaya dokununca hemen süpürmeye başlar.
 */
class OdaWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        Ayarlar.olayEkle(context, "Widget çizildi (${ids.size} adet)")
        val gorunum = gorunum(context)
        for (id in ids) manager.updateAppWidget(id, gorunum)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val odalar = Ayarlar.odalar(context)
        when (intent.action) {
            EYLEM_ODA -> Ayarlar.olayEkle(context, "Dokunuldu: " +
                (odalar.getOrNull(intent.getIntExtra(EK_ODA, -1))?.ad ?: "oda?"))
            EYLEM_BASLAT -> Ayarlar.olayEkle(context, "Dokunuldu: BAŞLAT")
            EYLEM_EVE_DON -> Ayarlar.olayEkle(context, "Dokunuldu: EVE DÖN")
        }
        when (intent.action) {
            EYLEM_ODA -> odayaDokunuldu(context, intent.getIntExtra(EK_ODA, -1))
            EYLEM_BASLAT -> baslat(context)
            EYLEM_EVE_DON -> gonder(context, emptyList(), eveDon = true)
        }
    }

    private fun odayaDokunuldu(ctx: Context, i: Int) {
        val odalar = Ayarlar.odalar(ctx)
        if (i !in odalar.indices) return
        if (Ayarlar.mesgul(ctx)) {
            Ayarlar.olayEkle(ctx, "Yok sayıldı: önceki komut hâlâ gönderiliyor")
            return
        }
        if (Ayarlar.tekDokunus(ctx)) {
            gonder(ctx, listOf(odalar[i]), eveDon = false)
            return
        }
        val secim = Ayarlar.secim(ctx).toMutableSet()
        if (!secim.add(i)) secim.remove(i)  // seç / seçimi kaldır
        Ayarlar.secimKaydet(ctx, secim)
        Ayarlar.durumYaz(
            ctx,
            if (secim.isEmpty()) "Oda seç, sonra BAŞLAT'a bas."
            else secim.sorted().filter { it in odalar.indices }.joinToString(", ") { odalar[it].ad } +
                " seçili. Şimdi BAŞLAT'a bas."
        )
        hepsiniGuncelle(ctx)
    }

    private fun baslat(ctx: Context) {
        val odalar = Ayarlar.odalar(ctx)
        val secilen = Ayarlar.secim(ctx).filter { it in odalar.indices }.sorted().map { odalar[it] }
        if (secilen.isEmpty()) {
            Ayarlar.durumYaz(ctx, "Önce oda seç.")
            hepsiniGuncelle(ctx)
            return
        }
        gonder(ctx, secilen, eveDon = false)
    }

    /** Komutu arka planda gönderir; sonucu widget'ın durum satırına yazar. */
    private fun gonder(ctx: Context, odalar: List<Oda>, eveDon: Boolean) {
        if (Ayarlar.mesgul(ctx)) return
        val uygulama = ctx.applicationContext
        Ayarlar.mesgulYap(uygulama, true)
        Ayarlar.durumYaz(uygulama, if (eveDon) "İstasyona gönderiliyor…" else "Gönderiliyor…")
        hepsiniGuncelle(uygulama)

        val bekleyen = goAsync()  // yayın bitmeden işlem tamamlansın
        Thread {
            try {
                val ip = Ayarlar.ip(uygulama)
                val key = Ayarlar.key(uygulama)
                val sonuc = try {
                    if (eveDon) RobotIslem.eveDon(ip, key) else RobotIslem.odalariSupur(ip, key, odalar)
                } catch (e: Exception) {
                    RobotIslem.Sonuc(false, RobotIslem.hataMesaji(e))
                }
                if (sonuc.basarili) Ayarlar.secimKaydet(uygulama, emptySet())
                Ayarlar.olayEkle(uygulama, sonuc.mesaj)
                val saat = SimpleDateFormat("HH:mm", Locale.forLanguageTag("tr")).format(Date())
                Ayarlar.durumYaz(uygulama, "${sonuc.mesaj}  ($saat)")
            } finally {
                Ayarlar.mesgulYap(uygulama, false)
                hepsiniGuncelle(uygulama)
                bekleyen.finish()
            }
        }.start()
    }

    companion object {
        private const val EYLEM_ODA = "com.robotsupurge.widget.ODA"
        private const val EYLEM_BASLAT = "com.robotsupurge.widget.BASLAT"
        private const val EYLEM_EVE_DON = "com.robotsupurge.widget.EVE_DON"
        private const val EK_ODA = "oda"

        private val ODA_IDLERI = intArrayOf(
            R.id.oda0, R.id.oda1, R.id.oda2, R.id.oda3,
            R.id.oda4, R.id.oda5, R.id.oda6, R.id.oda7,
        )
        private val SATIR_IDLERI = intArrayOf(R.id.satir0, R.id.satir1, R.id.satir2, R.id.satir3)

        /** Ana ekrandaki bütün widget'ları yeniden çizer. */
        fun hepsiniGuncelle(ctx: Context) {
            val manager = AppWidgetManager.getInstance(ctx)
            val ids = manager.getAppWidgetIds(ComponentName(ctx, OdaWidget::class.java))
            if (ids.isEmpty()) {
                Ayarlar.olayEkle(ctx, "Ana ekranda widget yok")
                return
            }
            val gorunum = gorunum(ctx)
            for (id in ids) manager.updateAppWidget(id, gorunum)
        }

        private fun gorunum(ctx: Context): RemoteViews {
            val v = RemoteViews(ctx.packageName, R.layout.widget_oda)
            val odalar = Ayarlar.odalar(ctx)
            val secim = Ayarlar.secim(ctx)
            val mesgul = Ayarlar.mesgul(ctx)

            for ((i, id) in ODA_IDLERI.withIndex()) {
                if (i < odalar.size) {
                    v.setViewVisibility(id, View.VISIBLE)
                    v.setTextViewText(id, odalar[i].ad)
                    v.setInt(id, "setBackgroundResource",
                        if (i in secim) R.drawable.oda_secili else R.drawable.oda)
                    v.setOnClickPendingIntent(id, yayin(ctx, EYLEM_ODA, i))
                } else {
                    v.setViewVisibility(id, View.GONE)
                }
            }
            for ((s, id) in SATIR_IDLERI.withIndex()) {
                v.setViewVisibility(id, if (s * 2 < odalar.size) View.VISIBLE else View.GONE)
            }

            val tek = Ayarlar.tekDokunus(ctx)
            v.setViewVisibility(R.id.baslat, if (tek) View.GONE else View.VISIBLE)
            v.setTextViewText(
                R.id.baslat,
                when {
                    mesgul -> "…"
                    secim.isEmpty() -> ctx.getString(R.string.baslat)
                    else -> ctx.getString(R.string.baslat) + " (" + secim.size + ")"
                }
            )
            v.setOnClickPendingIntent(R.id.baslat, yayin(ctx, EYLEM_BASLAT, 0))
            v.setOnClickPendingIntent(R.id.eveDon, yayin(ctx, EYLEM_EVE_DON, 0))

            v.setTextViewText(
                R.id.durum,
                if (Ayarlar.key(ctx).isEmpty()) "Kurulum gerekli: dokun, bilgileri gir."
                else Ayarlar.durum(ctx)
            )
            // Başlığa dokununca ayar ekranı açılır
            val ayarlar = PendingIntent.getActivity(
                ctx, 100, Intent(ctx, AyarlarActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            v.setOnClickPendingIntent(R.id.baslik, ayarlar)
            return v
        }

        private fun yayin(ctx: Context, eylem: String, oda: Int): PendingIntent {
            val intent = Intent(ctx, OdaWidget::class.java).setAction(eylem).putExtra(EK_ODA, oda)
            val istekKodu = when (eylem) {
                EYLEM_ODA -> oda
                EYLEM_BASLAT -> 50
                else -> 51
            }
            return PendingIntent.getBroadcast(
                ctx, istekKodu, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }
}
