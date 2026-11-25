package com.robotsupurge.widget

import java.io.IOException
import java.net.ConnectException
import java.net.NoRouteToHostException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/** Robota gönderilen komutlar. Ağ işlemi yapar: ana iş parçacığında çağırma. */
object RobotIslem {

    class Sonuc(val basarili: Boolean, val mesaj: String)

    /** Seçili odaları süpürür. Robot başka bir işteyse durdurup tekrar dener. */
    fun odalariSupur(ip: String, key: String, odalar: List<Oda>): Sonuc {
        kontrol(ip, key)?.let { return it }
        val params = "[{\"segments\":[" + odalar.joinToString(",") { it.segment.toString() } + "]}]"
        val robot = RoborockYerel(ip, key)
        var yanit: String
        try {
            yanit = robot.komut("app_segment_clean", params)
            if (!RoborockYerel.basarili(yanit)) {
                // Robot meşgul olabilir: mevcut işi durdur, tekrar dene
                robot.komut("app_stop", "[]")
                Thread.sleep(1500)
                yanit = robot.komut("app_segment_clean", params)
            }
        } catch (e: RoborockYerel.KomutCevapsiz) {
            val adlar = odalar.joinToString(", ") { "${it.ad} (${it.segment})" }
            return Sonuc(false, "✗ Robota bağlanıldı ama $adlar komutuna cevap gelmedi. " +
                "Bu oda numarası bu robotun haritasında olmayabilir: uygulamayı açıp Bağlantıyı dene'ye bas.")
        }
        return if (RoborockYerel.basarili(yanit))
            Sonuc(true, "✓ Yola çıktı: " + odalar.joinToString(", ") { it.ad })
        else
            Sonuc(false, "✗ Robot kabul etmedi: $yanit")
    }

    fun eveDon(ip: String, key: String): Sonuc {
        kontrol(ip, key)?.let { return it }
        val yanit = RoborockYerel(ip, key).komut("app_charge", "[]")
        return if (RoborockYerel.basarili(yanit)) Sonuc(true, "✓ İstasyona dönüyor")
        else Sonuc(false, "✗ Robot kabul etmedi: $yanit")
    }

    /**
     * Bağlantı testi: robotun pil durumunu okur (robot hareket etmez) ve ayarlardaki
     * oda numaralarını robotun haritasıyla karşılaştırır.
     */
    fun durumOku(ip: String, key: String, odalar: List<Oda>): Sonuc {
        kontrol(ip, key)?.let { return it }
        val robot = RoborockYerel(ip, key)
        val yanit = robot.komut("get_status", "[]")
        if (!RoborockYerel.basarili(yanit)) return Sonuc(false, "✗ Robot hata döndü: $yanit")
        val pil = RoborockYerel.jsonSayi(yanit, "battery")
        val satirlar = mutableListOf(
            "✓ Robot yanıt verdi (protokol ${robot.surum()}" + (if (pil >= 0) ", pil %$pil)" else ")")
        )
        // Haritadaki isimli odalar: [[16,"iot_id",..],[17,...]]
        val harita = try {
            haritaNumaralari(robot.komut("get_room_mapping", "[]"))
        } catch (e: Exception) {
            null
        }
        if (harita != null && harita.isNotEmpty()) {
            satirlar += "Robotun haritasındaki isimli odalar: " + harita.sorted().joinToString(", ")
            val yok = odalar.filter { it.segment !in harita }
            if (yok.isNotEmpty()) {
                satirlar += "⚠ Bu numaralar haritada isimli oda olarak yok: " +
                    yok.joinToString(", ") { "${it.ad} (${it.segment})" } +
                    ". Yanlışsa robot bu odalara gitmez. (Uygulamada isim verilmemiş odalar bu listede görünmez.)"
            }
        }
        return Sonuc(true, satirlar.joinToString("\n"))
    }

    /** get_room_mapping yanıtından oda numaralarını çıkarır. */
    fun haritaNumaralari(yanit: String): Set<Int> {
        val sonuc = yanit.substringAfter("\"result\"", "")
        return Regex("""\[\s*(\d+)\s*,""").findAll(sonuc).map { it.groupValues[1].toInt() }.toSet()
    }

    private fun kontrol(ip: String, key: String): Sonuc? = when {
        ip.isBlank() -> Sonuc(false, "✗ Robotun IP adresi girilmemiş (uygulamayı aç).")
        key.length != 16 -> Sonuc(false, "✗ Local key girilmemiş ya da 16 karakter değil (uygulamayı aç).")
        else -> null
    }

    /** Hata mesajını Türkçe ve anlaşılır hale getirir. */
    fun hataMesaji(e: Throwable): String = when (e) {
        is RoborockYerel.KomutCevapsiz ->
            "✗ Robota bağlanıldı ama '${e.method}' komutuna cevap gelmedi."
        is ConnectException, is NoRouteToHostException, is UnknownHostException ->
            "✗ Robota ulaşılamadı. Telefon evin Wi-Fi'sinde mi? Robot IP'si doğru mu?"
        is SocketTimeoutException ->
            "✗ Robot bağlantıya cevap vermedi. Robot açık ve Wi-Fi'de mi? Local key doğru mu?"
        is IOException -> "✗ " + (e.message ?: "Bağlantı hatası")
        else -> "✗ Hata: " + (e.message ?: e.javaClass.simpleName)
    }
}
