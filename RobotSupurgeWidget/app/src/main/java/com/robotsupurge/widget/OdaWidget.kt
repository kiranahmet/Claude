package com.robotsupurge.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews

/**
 * Ana ekran widget'ı.
 *
 * Oda butonuna dokununca oda seçilir (mavi olur), tekrar dokununca seçim kalkar.
 * BAŞLAT seçili odaları süpürür, EVE DÖN robotu istasyona gönderir. Robota giden
 * komutlar ön planda (KomutActivity) gönderilir.
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
        if (intent.action == EYLEM_SEC) odayaDokunuldu(context, intent.getIntExtra(EK_ODA, -1))
    }

    /** Oda seçimini aç/kapat (ağ gerekmez). Gönderme işi KomutActivity'de. */
    private fun odayaDokunuldu(ctx: Context, i: Int) {
        val odalar = Ayarlar.odalar(ctx)
        if (i !in odalar.indices) return
        val secim = Ayarlar.secim(ctx).toMutableSet()
        if (!secim.add(i)) secim.remove(i)  // seç / seçimi kaldır
        Ayarlar.secimKaydet(ctx, secim)
        Ayarlar.olayEkle(ctx, "Dokunuldu: ${odalar[i].ad} (" + (if (i in secim) "seçildi" else "seçim kalktı") + ")")
        Ayarlar.durumYaz(
            ctx,
            if (secim.isEmpty()) "Oda seç, sonra BAŞLAT'a bas."
            else secim.sorted().filter { it in odalar.indices }.joinToString(", ") { odalar[it].ad } +
                " seçili. Şimdi BAŞLAT'a bas."
        )
        hepsiniGuncelle(ctx)
    }

    companion object {
        private const val EYLEM_SEC = "com.robotsupurge.widget.SEC"
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
                    v.setOnClickPendingIntent(
                        id,
                        if (Ayarlar.tekDokunus(ctx)) komut(ctx, KomutActivity.EYLEM_ODA, i) else secimYayini(ctx, i)
                    )
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
            v.setOnClickPendingIntent(R.id.baslat, komut(ctx, KomutActivity.EYLEM_BASLAT))
            v.setOnClickPendingIntent(R.id.eveDon, komut(ctx, KomutActivity.EYLEM_EVE_DON))

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

        /** Oda seçimi: widget'ın kendisine yayın (arka planda, ağ yok). */
        private fun secimYayini(ctx: Context, oda: Int): PendingIntent {
            val intent = Intent(ctx, OdaWidget::class.java).setAction(EYLEM_SEC).putExtra(EK_ODA, oda)
            return PendingIntent.getBroadcast(
                ctx, oda, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        /** Robota komut: ön planda çalışan KomutActivity'yi açar. */
        private fun komut(ctx: Context, eylem: String, oda: Int = -1): PendingIntent {
            val istekKodu = when (eylem) {
                KomutActivity.EYLEM_ODA -> 200 + oda
                KomutActivity.EYLEM_BASLAT -> 250
                else -> 251
            }
            return PendingIntent.getActivity(
                ctx, istekKodu, KomutActivity.intent(ctx, eylem, oda),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }
}
