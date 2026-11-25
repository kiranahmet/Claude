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
        var yanit = robot.komut("app_segment_clean", params)
        if (!RoborockYerel.basarili(yanit)) {
            // Robot meşgul olabilir: mevcut işi durdur, tekrar dene
            robot.komut("app_stop", "[]")
            Thread.sleep(1500)
            yanit = robot.komut("app_segment_clean", params)
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

    /** Bağlantı testi: robotun pil durumunu okur. */
    fun durumOku(ip: String, key: String): Sonuc {
        kontrol(ip, key)?.let { return it }
        val robot = RoborockYerel(ip, key)
        val yanit = robot.komut("get_status", "[]")
        val pil = RoborockYerel.jsonSayi(yanit, "battery")
        return if (RoborockYerel.basarili(yanit))
            Sonuc(true, "✓ Robot yanıt verdi (protokol ${robot.surum()}" +
                (if (pil >= 0) ", pil %$pil)" else ")"))
        else Sonuc(false, "✗ Robot hata döndü: $yanit")
    }

    private fun kontrol(ip: String, key: String): Sonuc? = when {
        ip.isBlank() -> Sonuc(false, "✗ Robotun IP adresi girilmemiş (uygulamayı aç).")
        key.length != 16 -> Sonuc(false, "✗ Local key girilmemiş ya da 16 karakter değil (uygulamayı aç).")
        else -> null
    }

    /** Hata mesajını Türkçe ve anlaşılır hale getirir. */
    fun hataMesaji(e: Throwable): String = when (e) {
        is ConnectException, is NoRouteToHostException, is UnknownHostException ->
            "✗ Robota ulaşılamadı. Telefon evin Wi-Fi'sinde mi? Robot IP'si doğru mu?"
        is SocketTimeoutException ->
            "✗ Robot cevap vermedi. Local key doğru mu? Robot açık mı?"
        is IOException -> "✗ " + (e.message ?: "Bağlantı hatası")
        else -> "✗ Hata: " + (e.message ?: e.javaClass.simpleName)
    }
}
