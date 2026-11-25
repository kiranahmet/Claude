package com.robotsupurge.widget

import android.content.Context
import android.content.SharedPreferences

/** Bir oda: widget'ta görünen adı ve robotun haritasındaki numarası (segment). */
data class Oda(val ad: String, val segment: Int)

/** Uygulama ayarları ve widget durumu (telefonda saklanır). */
object Ayarlar {
    const val EN_FAZLA_ODA = 8

    /** İlk açılışta gelen örnek oda listesi (Hacer'in robotu). */
    const val ORNEK_ODALAR = "Oturma Odası = 16\nKoridor = 17\nBalkon = 18\nOda 19 = 19\nÇocuk Odası = 20"
    private const val ORNEK_IP = "192.168.1.135"
    /** Boş: key uygulamadan girilir. (apk_derle.sh ONCEDEN_KEY ile doldurabilir.) */
    private const val ORNEK_KEY = ""

    private const val MESGUL_SURE_MS = 25_000L

    private fun p(ctx: Context): SharedPreferences =
        ctx.applicationContext.getSharedPreferences("ayarlar", Context.MODE_PRIVATE)

    fun ip(ctx: Context): String = p(ctx).getString("ip", ORNEK_IP) ?: ORNEK_IP
    fun key(ctx: Context): String = p(ctx).getString("key", ORNEK_KEY) ?: ORNEK_KEY
    fun odalarMetni(ctx: Context): String = p(ctx).getString("odalar", ORNEK_ODALAR) ?: ORNEK_ODALAR
    fun odalar(ctx: Context): List<Oda> = odalariCoz(odalarMetni(ctx)).take(EN_FAZLA_ODA)
    fun tekDokunus(ctx: Context): Boolean = p(ctx).getBoolean("tekDokunus", false)

    fun kaydet(ctx: Context, ip: String, key: String, odalarMetni: String, tekDokunus: Boolean) {
        p(ctx).edit()
            .putString("ip", ip.trim())
            .putString("key", key.trim())
            .putString("odalar", odalarMetni)
            .putBoolean("tekDokunus", tekDokunus)
            .putString("secim", "")  // oda listesi değişmiş olabilir
            .apply()
    }

    /** "Oda adı = 16" satırlarını okur. Hatalı satırları atlar. */
    fun odalariCoz(metin: String): List<Oda> {
        val desen = Regex("""^\s*(.+?)\s*[=:]\s*(\d+)\s*$""")
        return metin.lines().mapNotNull { satir ->
            desen.find(satir)?.let { m ->
                val segment = m.groupValues[2].toIntOrNull() ?: return@let null
                Oda(m.groupValues[1], segment)
            }
        }
    }

    // ---- widget durumu

    fun secim(ctx: Context): Set<Int> =
        (p(ctx).getString("secim", "") ?: "").split(',').mapNotNull { it.toIntOrNull() }.toSet()

    fun secimKaydet(ctx: Context, secim: Set<Int>) {
        p(ctx).edit().putString("secim", secim.sorted().joinToString(",")).apply()
    }

    fun durum(ctx: Context): String =
        p(ctx).getString("durum", null) ?: "Oda seç, sonra BAŞLAT'a bas."

    fun durumYaz(ctx: Context, metin: String) {
        p(ctx).edit().putString("durum", metin).apply()
    }

    /** Bir komut gönderiliyorsa true (aynı anda iki komut gitmesin). */
    fun mesgul(ctx: Context): Boolean =
        System.currentTimeMillis() - p(ctx).getLong("mesgulZaman", 0L) < MESGUL_SURE_MS

    fun mesgulYap(ctx: Context, mesgul: Boolean) {
        p(ctx).edit().putLong("mesgulZaman", if (mesgul) System.currentTimeMillis() else 0L).commit()
    }
}
