import com.robotsupurge.widget.RoborockYerel;

/** Widget'ın robot protokolünü sahte robota karşı dener. Kullanım: YerelTest <port> <key> */
public class YerelTest {
    public static void main(String[] a) throws Exception {
        int port = Integer.parseInt(a[0]);
        RoborockYerel r = new RoborockYerel("127.0.0.1", port, a[1]);
        String y1 = r.komut("app_segment_clean", "[{\"segments\":[16,18,21]}]");
        System.out.println("surum=" + r.surum() + " yanit1=" + y1 + " basarili=" + RoborockYerel.basarili(y1));
        String y2 = r.komut("app_charge", "[]");
        System.out.println("yanit2=" + y2 + " basarili=" + RoborockYerel.basarili(y2));
        if (!RoborockYerel.basarili(y1) || !RoborockYerel.basarili(y2)) System.exit(1);
    }
}
