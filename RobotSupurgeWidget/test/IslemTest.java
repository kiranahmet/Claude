import com.robotsupurge.widget.Ayarlar;
import com.robotsupurge.widget.Oda;
import com.robotsupurge.widget.RobotIslem;
import java.util.List;

/** Widget mantığını (oda listesi okuma + robot komutları) sahte robota karşı dener. */
public class IslemTest {
    public static void main(String[] a) throws Exception {
        String ip = "127.0.0.1";
        // Oda listesi: boşluklar, ":" ayıracı, hatalı satır, Türkçe harfler
        List<Oda> odalar = Ayarlar.INSTANCE.odalariCoz(
            "Oturma Odası = 16\n  Koridor:17 \nbu satır hatalı\nÇocuk Odası=20\n");
        System.out.println("odalar=" + odalar);
        if (odalar.size() != 3 || odalar.get(2).getSegment() != 20
            || !odalar.get(2).getAd().equals("Çocuk Odası")) System.exit(2);
        RobotIslem.Sonuc s1 = RobotIslem.INSTANCE.odalariSupur(ip, a[1], odalar);
        System.out.println("supur: " + s1.getBasarili() + " " + s1.getMesaj());
        RobotIslem.Sonuc s2 = RobotIslem.INSTANCE.eveDon(ip, a[1]);
        System.out.println("eve: " + s2.getBasarili() + " " + s2.getMesaj());
        RobotIslem.Sonuc s3 = RobotIslem.INSTANCE.odalariSupur(ip, "kisa", odalar);
        System.out.println("kisa key: " + s3.getBasarili() + " " + s3.getMesaj());
        if (!s1.getBasarili() || !s2.getBasarili() || s3.getBasarili()) System.exit(1);
    }
}
