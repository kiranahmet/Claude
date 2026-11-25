import com.robotsupurge.widget.Ayarlar;
import com.robotsupurge.widget.Oda;
import com.robotsupurge.widget.RobotIslem;
import java.util.List;

/**
 * Widget mantığını (oda listesi okuma + robot komutları) sahte robota karşı dener.
 * Derlenmiş Kotlin sınıflarına ihtiyaç duyar (bkz. apk_derle.sh); robot portu 58867.
 */
public class IslemTest {
    static void beklenen(boolean kosul, String ad) {
        System.out.println((kosul ? "OK   " : "FAIL ") + ad);
        if (!kosul) System.exit(1);
    }

    public static void main(String[] a) throws Exception {
        String ip = "127.0.0.1", key = a[1];
        List<Oda> odalar = Ayarlar.INSTANCE.odalariCoz(
            "Oturma Odası = 16\n  Koridor:17 \nbu satır hatalı\nÇocuk Odası=20\n");
        beklenen(odalar.size() == 3 && odalar.get(2).getSegment() == 20
            && odalar.get(2).getAd().equals("Çocuk Odası"), "oda listesi okunuyor");

        RobotIslem.Sonuc s = RobotIslem.INSTANCE.odalariSupur(ip, key, odalar.subList(0, 2));
        beklenen(s.getBasarili(), "odalari supur: " + s.getMesaj());
        s = RobotIslem.INSTANCE.eveDon(ip, key);
        beklenen(s.getBasarili(), "eve don: " + s.getMesaj());
        s = RobotIslem.INSTANCE.odalariSupur(ip, "kisa", odalar);
        beklenen(!s.getBasarili() && s.getMesaj().contains("16 karakter"), "kisa key reddedilir");

        // Haritada olmayan oda: robot cevap vermez -> 'bağlanıldı ama cevap gelmedi'
        long t0 = System.currentTimeMillis();
        s = RobotIslem.INSTANCE.odalariSupur(ip, key, List.of(new Oda("Yatak Odası", 99)));
        beklenen(!s.getBasarili() && s.getMesaj().contains("bağlanıldı ama")
            && s.getMesaj().contains("Yatak Odası (99)"), "olmayan oda dogru mesaj: " + s.getMesaj());
        System.out.println("     (sure " + (System.currentTimeMillis() - t0) + " ms), adim kaydi:\n" + s.getIz());
        beklenen(s.getIz().contains("merhaba cevabı geldi") && s.getIz().contains("cevap gelmedi"),
            "adim kaydi baglantinin kuruldugunu ve komutun cevapsiz kaldigini gosteriyor");

        // Bağlantı testi: haritada olmayan numaraları uyarır
        s = RobotIslem.INSTANCE.durumOku(ip, key, odalar);
        beklenen(s.getBasarili() && s.getMesaj().contains("16, 17")
            && s.getMesaj().contains("Çocuk Odası (20)") && !s.getMesaj().contains("Koridor (17)"),
            "baglanti testi harita uyarisi:\n" + s.getMesaj());
    }
}
