package com.robotsupurge.widget

import android.app.Activity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Switch
import android.widget.TextView

/** Ayar ekranı: robot IP'si, local key ve oda listesi. */
class AyarlarActivity : Activity() {

    private lateinit var ip: EditText
    private lateinit var key: EditText
    private lateinit var odalar: EditText
    private lateinit var tekDokunus: Switch
    private lateinit var sonuc: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_ayarlar)

        ip = findViewById(R.id.ip) as EditText
        key = findViewById(R.id.key) as EditText
        odalar = findViewById(R.id.odalar) as EditText
        tekDokunus = findViewById(R.id.tekDokunus) as Switch
        sonuc = findViewById(R.id.sonuc) as TextView

        ip.setText(Ayarlar.ip(this))
        key.setText(Ayarlar.key(this))
        odalar.setText(Ayarlar.odalarMetni(this))
        tekDokunus.isChecked = Ayarlar.tekDokunus(this)

        (findViewById(R.id.kaydet) as Button).setOnClickListener { kaydet() }
        (findViewById(R.id.test) as Button).setOnClickListener { if (kaydet()) dene() }
    }

    /** Girilenleri kontrol edip kaydeder. Hata varsa false. */
    private fun kaydet(): Boolean {
        val ipMetni = ip.text.toString().trim()
        val keyMetni = key.text.toString().trim()
        val odaMetni = odalar.text.toString()
        val liste = Ayarlar.odalariCoz(odaMetni)

        val hata = when {
            !Regex("""^\d{1,3}(\.\d{1,3}){3}$""").matches(ipMetni) ->
                "IP adresi 192.168.1.135 gibi olmalı."
            keyMetni.length != 16 -> "Local key tam 16 karakter olmalı (şu an ${keyMetni.length})."
            liste.isEmpty() -> "En az bir oda yaz. Örnek satır: Mutfak = 16"
            else -> null
        }
        if (hata != null) {
            sonuc.text = "✗ $hata"
            return false
        }

        Ayarlar.kaydet(this, ipMetni, keyMetni, odaMetni, tekDokunus.isChecked)
        Ayarlar.durumYaz(this, if (tekDokunus.isChecked) "Odaya dokun, robot hemen gider." else "Oda seç, sonra BAŞLAT'a bas.")
        OdaWidget.hepsiniGuncelle(this)

        val fazla = liste.size - Ayarlar.EN_FAZLA_ODA
        sonuc.text = "✓ Kaydedildi: " + liste.take(Ayarlar.EN_FAZLA_ODA).joinToString(", ") { "${it.ad} (${it.segment})" } +
            (if (fazla > 0) "\nNot: widget en fazla ${Ayarlar.EN_FAZLA_ODA} oda gösterir, son $fazla oda görünmez." else "")
        return true
    }

    /** Robota bağlanıp pil durumunu sorar (robot hareket etmez). */
    private fun dene() {
        sonuc.text = "Robota bağlanılıyor…"
        val ipMetni = Ayarlar.ip(this)
        val keyMetni = Ayarlar.key(this)
        Thread {
            val mesaj = try {
                RobotIslem.durumOku(ipMetni, keyMetni).mesaj
            } catch (e: Exception) {
                RobotIslem.hataMesaji(e)
            }
            runOnUiThread { if (!isFinishing) sonuc.text = mesaj }
        }.start()
    }
}
