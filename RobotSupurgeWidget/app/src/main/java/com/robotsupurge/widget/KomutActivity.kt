package com.robotsupurge.widget

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import android.widget.Toast
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Widget'tan gelen komutu (BAŞLAT, EVE DÖN, tek dokunuşla oda) ÖN PLANDA gönderen
 * görünmez ekran.
 *
 * Bazı telefonlar arka plandaki uygulamaların ağ bağlantısını kısıtlıyor; widget'ın
 * yayın alıcısı (arka plan) yerine bu ekran açık kalırken komut gönderilir. Ekran
 * saydamdır ve dokunmaları engellemez; işi bitince kendiliğinden kapanır.
 */
class KomutActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Saydam pencere ana ekrana dokunmayı engellemesin
        window.addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)

        val uyg = applicationContext
        val eylem = intent.getStringExtra(EK_EYLEM)
        val odalar = Ayarlar.odalar(uyg)
        val eveDon = eylem == EYLEM_EVE_DON
        val hedef: List<Oda> = when (eylem) {
            EYLEM_BASLAT -> Ayarlar.secim(uyg).filter { it in odalar.indices }.sorted().map { odalar[it] }
            EYLEM_ODA -> listOfNotNull(odalar.getOrNull(intent.getIntExtra(EK_ODA, -1)))
            else -> emptyList()
        }
        Ayarlar.olayEkle(uyg, "Dokunuldu: " + when {
            eveDon -> "EVE DÖN"
            eylem == EYLEM_BASLAT -> "BAŞLAT (" + hedef.joinToString(", ") { it.ad } + ")"
            else -> hedef.joinToString(", ") { it.ad }
        })

        if (eylem == null || (!eveDon && hedef.isEmpty())) {
            Ayarlar.durumYaz(uyg, "Önce oda seç.")
            OdaWidget.hepsiniGuncelle(uyg)
            Toast.makeText(uyg, "Önce oda seç", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        if (Ayarlar.mesgul(uyg)) {
            Ayarlar.olayEkle(uyg, "Yok sayıldı: önceki komut hâlâ gönderiliyor")
            finish()
            return
        }

        Ayarlar.mesgulYap(uyg, true)
        Ayarlar.durumYaz(uyg, if (eveDon) "İstasyona gönderiliyor…" else "Gönderiliyor…")
        OdaWidget.hepsiniGuncelle(uyg)
        Toast.makeText(
            uyg,
            if (eveDon) "Robot istasyona gönderiliyor…" else hedef.joinToString(", ") { it.ad } + " gönderiliyor…",
            Toast.LENGTH_SHORT
        ).show()

        Thread {
            val ip = Ayarlar.ip(uyg)
            val key = Ayarlar.key(uyg)
            val sonuc = try {
                if (eveDon) RobotIslem.eveDon(ip, key) else RobotIslem.odalariSupur(ip, key, hedef)
            } catch (e: Exception) {
                RobotIslem.Sonuc(false, RobotIslem.hataMesaji(e))
            }
            if (sonuc.basarili) Ayarlar.secimKaydet(uyg, emptySet())
            val saat = SimpleDateFormat("HH:mm", Locale.forLanguageTag("tr")).format(Date())
            Ayarlar.durumYaz(uyg, "${sonuc.mesaj}  ($saat)")
            if (!sonuc.basarili && sonuc.iz.isNotBlank()) Ayarlar.olayEkle(uyg, "Ayrıntı:\n" + sonuc.iz)
            Ayarlar.olayEkle(uyg, sonuc.mesaj)
            Ayarlar.mesgulYap(uyg, false)
            OdaWidget.hepsiniGuncelle(uyg)
            runOnUiThread {
                Toast.makeText(uyg, sonuc.mesaj, Toast.LENGTH_LONG).show()
                finish()
            }
        }.start()
    }

    companion object {
        const val EK_EYLEM = "eylem"
        const val EK_ODA = "oda"
        const val EYLEM_BASLAT = "baslat"
        const val EYLEM_EVE_DON = "eve_don"
        const val EYLEM_ODA = "oda"

        fun intent(ctx: Context, eylem: String, oda: Int = -1): Intent =
            Intent(ctx, KomutActivity::class.java)
                .putExtra(EK_EYLEM, eylem)
                .putExtra(EK_ODA, oda)
                .addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION or
                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                )
    }
}
