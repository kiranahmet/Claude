package com.robotsupurge.widget;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.zip.CRC32;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Roborock yerel (LAN) protokolü: bulut olmadan TCP 58867 üzerinden komut.
 *
 * Kutudaki ESP32 kodunun (roborock_local.cpp) Java karşılığıdır ve
 * python-roborock kütüphanesiyle birebir uyumludur:
 *   "1.0": AES-128-ECB, anahtar = MD5(kodlanmış_zaman + local_key + SALT)
 *   "L01": AES-256-GCM (yeni firmware), anahtar = SHA-256(...)
 *
 * Android'e bağımlı değildir; bilgisayarda da çalışır (test için).
 */
public final class RoborockYerel {

    public static final int PORT = 58867;
    private static final byte[] SALT = "TXdfu$jyZ#TZHsg4".getBytes(StandardCharsets.US_ASCII);
    private static final int HEADER = 17;  // sürüm(3) seq(4) random(4) zaman(4) protokol(2)
    private static final int HELLO_REQUEST = 0, HELLO_RESPONSE = 1, GENERAL_REQUEST = 4;

    /** Robotun konuştuğu protokol; ilk başarılı bağlantıdan sonra hatırlanır. */
    private static volatile boolean tercihL01 = false;

    private final String ip;
    private final int port;
    private final byte[] localKey;
    private final SecureRandom rnd = new SecureRandom();

    private boolean l01;
    private int connectNonce, ackNonce;
    private boolean ackVar;
    private Socket soket;
    private InputStream giris;
    private OutputStream cikis;
    private final ByteArrayOutputStream tampon = new ByteArrayOutputStream();

    public RoborockYerel(String ip, String localKey) {
        this(ip, PORT, localKey);
    }

    public RoborockYerel(String ip, int port, String localKey) {
        this.ip = ip.trim();
        this.port = port;
        this.localKey = localKey.trim().getBytes(StandardCharsets.US_ASCII);
    }

    /** Hangi protokolle konuşulduğu ("1.0" ya da "L01"); bağlandıktan sonra geçerli. */
    public String surum() {
        return l01 ? "L01" : "1.0";
    }

    /**
     * Bağlanır, komutu gönderir, yanıtı döner, bağlantıyı kapatır.
     *
     * @param method     örn. "app_segment_clean", "app_charge", "get_status"
     * @param paramsJson örn. "[{\"segments\":[16,17]}]" ya da "[]"
     * @return robotun yanıtı, örn. {"id":123,"result":["ok"]}
     */
    public String komut(String method, String paramsJson) throws IOException {
        baglan();
        try {
            return cagir(method, paramsJson, 6000);
        } finally {
            kapat();
        }
    }

    /** Yanıt başarılı mı? ({"result": ...} var, "error" yok) */
    public static boolean basarili(String yanit) {
        return yanit != null && yanit.contains("\"result\"") && !yanit.contains("\"error\"");
    }

    // ------------------------------------------------------------ bağlantı

    void baglan() throws IOException {
        boolean[] sira = {tercihL01, !tercihL01};
        IOException son = null;
        for (boolean v : sira) {
            try {
                ac();
                merhaba(v, 3000);
                tercihL01 = v;
                return;
            } catch (IOException e) {
                son = e;
                kapat();
            }
        }
        throw son != null ? son : new IOException("Robota bağlanılamadı");
    }

    private void ac() throws IOException {
        soket = new Socket();
        soket.connect(new InetSocketAddress(ip, port), 4000);
        soket.setTcpNoDelay(true);
        giris = soket.getInputStream();
        cikis = soket.getOutputStream();
        tampon.reset();
    }

    void kapat() {
        try {
            if (soket != null) soket.close();
        } catch (IOException ignored) {
        }
        soket = null;
    }

    private void merhaba(boolean v, int zamanAsimi) throws IOException {
        l01 = v;
        ackVar = false;
        connectNonce = 10000 + rnd.nextInt(22768);
        cikis.write(cerceve(1, connectNonce, simdi(), HELLO_REQUEST, null));
        cikis.flush();
        Mesaj m = bekle(HELLO_RESPONSE, 1, 0, zamanAsimi);
        ackNonce = m.random;
        ackVar = true;
    }

    String cagir(String method, String paramsJson, int zamanAsimi) throws IOException {
        int id = 10000 + rnd.nextInt(22768);
        long ts = simdi();
        String ic = "{\"id\":" + id + ",\"method\":\"" + method + "\",\"params\":"
                + (paramsJson == null || paramsJson.isEmpty() ? "[]" : paramsJson) + "}";
        String govde = "{\"dps\":{\"101\":\"" + ic.replace("\\", "\\\\").replace("\"", "\\\"")
                + "\"},\"t\":" + ts + "}";
        int seq = 100000 + rnd.nextInt(900000);
        int random = 10000 + rnd.nextInt(90000);
        cikis.write(cerceve(seq, random, ts, GENERAL_REQUEST, govde.getBytes(StandardCharsets.UTF_8)));
        cikis.flush();
        return bekle(-1, 0, id, zamanAsimi).icYanit;
    }

    // -------------------------------------------------------------- çerçeve

    byte[] cerceve(int seq, int random, long ts, int protokol, byte[] icerik) throws IOException {
        ByteArrayOutputStream m = new ByteArrayOutputStream();
        m.write((l01 ? "L01" : "1.0").getBytes(StandardCharsets.US_ASCII));
        yaz32(m, seq);
        yaz32(m, random);
        yaz32(m, (int) ts);
        yaz16(m, protokol);
        if (icerik != null) {
            byte[] sifreli = l01 ? gcm(true, ts, seq, random, icerik) : ecb(true, ts, icerik);
            yaz16(m, sifreli.length);
            m.write(sifreli);
        }
        byte[] govde = m.toByteArray();
        CRC32 crc = new CRC32();
        crc.update(govde);
        ByteArrayOutputStream c = new ByteArrayOutputStream();
        yaz32(c, govde.length + 4);
        c.write(govde);
        yaz32(c, (int) crc.getValue());
        return c.toByteArray();
    }

    static final class Mesaj {
        String surum;
        int seq, random, protokol;
        long zaman;
        byte[] icerik;
        String icYanit;
    }

    /** Tampondaki ilk çerçeveyi çözer; tamamlanmamışsa null. */
    Mesaj coz() {
        byte[] b = tampon.toByteArray();
        int i = 0;
        Mesaj sonuc = null;
        while (b.length - i >= 7) {
            if (!gecerliSurum(b, i + 4)) {  // senkron kayması: bir bayt atla
                i++;
                continue;
            }
            int uzunluk = oku32(b, i);
            if (uzunluk < HEADER || uzunluk > 65535) {
                i++;
                continue;
            }
            if (b.length - i < 4 + uzunluk) break;  // henüz tamamlanmadı
            int m = i + 4;
            i += 4 + uzunluk;
            Mesaj x = new Mesaj();
            x.surum = new String(b, m, 3, StandardCharsets.US_ASCII);
            x.seq = oku32(b, m + 3);
            x.random = oku32(b, m + 7);
            x.zaman = oku32(b, m + 11) & 0xFFFFFFFFL;
            x.protokol = oku16(b, m + 15);
            int kalan = uzunluk - HEADER;
            // İçeriksiz biçimler: [başlık], [başlık+CRC], [başlık+0000], [başlık+0000+CRC]
            if (kalan >= 2 && kalan != 4) {
                int plen = oku16(b, m + HEADER);
                if (plen > 0 && HEADER + 2 + plen <= uzunluk) {
                    int msgLen = HEADER + 2 + plen;
                    if (uzunluk >= msgLen + 4) {
                        CRC32 crc = new CRC32();
                        crc.update(b, m, msgLen);
                        if ((int) crc.getValue() != oku32(b, m + msgLen)) continue;  // bozuk
                    }
                    byte[] sifreli = Arrays.copyOfRange(b, m + HEADER + 2, m + HEADER + 2 + plen);
                    try {
                        x.icerik = "L01".equals(x.surum)
                                ? gcm(false, x.zaman, x.seq, x.random, sifreli)
                                : "1.0".equals(x.surum) ? ecb(false, x.zaman, sifreli) : null;
                    } catch (IOException e) {
                        x.icerik = null;  // çözülemedi: başlık geçerli, içerik yok sayılır
                    }
                }
            }
            sonuc = x;
            break;
        }
        byte[] artan = Arrays.copyOfRange(b, Math.min(i, b.length), b.length);
        tampon.reset();
        tampon.write(artan, 0, artan.length);
        return sonuc;
    }

    private Mesaj bekle(int protokol, int seq, int rpcId, int zamanAsimiMs) throws IOException {
        long bitis = System.currentTimeMillis() + zamanAsimiMs;
        byte[] okunan = new byte[4096];
        while (true) {
            Mesaj m;
            while ((m = coz()) != null) {
                if (protokol >= 0 && m.protokol == protokol && m.seq == seq) return m;
                if (rpcId != 0 && m.icerik != null) {
                    String ic = jsonString(new String(m.icerik, StandardCharsets.UTF_8), "102");
                    if (ic != null && jsonSayi(ic, "id") == rpcId) {
                        m.icYanit = ic;
                        return m;
                    }
                }
                // diğer mesajlar (durum bildirimleri vb.) yok sayılır
            }
            long kalan = bitis - System.currentTimeMillis();
            if (kalan <= 0) throw new SocketTimeoutException("Robottan yanıt gelmedi");
            soket.setSoTimeout((int) Math.max(1, kalan));
            int n;
            try {
                n = giris.read(okunan);
            } catch (SocketTimeoutException e) {
                throw new SocketTimeoutException("Robottan yanıt gelmedi");
            }
            if (n < 0) throw new IOException("Robot bağlantıyı kapattı");
            tampon.write(okunan, 0, n);
        }
    }

    // ------------------------------------------------------------- şifreleme

    static String zamanKodla(long ts) {
        String hex = String.format("%08x", ts & 0xFFFFFFFFL);
        int[] sira = {5, 6, 3, 7, 1, 2, 0, 4};
        StringBuilder s = new StringBuilder();
        for (int k : sira) s.append(hex.charAt(k));
        return s.toString();
    }

    private byte[] anahtarMalzemesi(long ts) {
        byte[] z = zamanKodla(ts).getBytes(StandardCharsets.US_ASCII);
        byte[] r = new byte[z.length + localKey.length + SALT.length];
        System.arraycopy(z, 0, r, 0, z.length);
        System.arraycopy(localKey, 0, r, z.length, localKey.length);
        System.arraycopy(SALT, 0, r, z.length + localKey.length, SALT.length);
        return r;
    }

    private byte[] ecb(boolean sifrele, long ts, byte[] veri) throws IOException {
        try {
            byte[] anahtar = MessageDigest.getInstance("MD5").digest(anahtarMalzemesi(ts));
            Cipher c = Cipher.getInstance("AES/ECB/PKCS5Padding");
            c.init(sifrele ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE, new SecretKeySpec(anahtar, "AES"));
            return c.doFinal(veri);
        } catch (GeneralSecurityException e) {
            throw new IOException("Şifreleme hatası (local key doğru mu?)", e);
        }
    }

    private byte[] gcm(boolean sifrele, long ts, int seq, int nonce, byte[] veri) throws IOException {
        try {
            byte[] anahtar = MessageDigest.getInstance("SHA-256").digest(anahtarMalzemesi(ts));
            ByteArrayOutputStream ivGiris = new ByteArrayOutputStream();
            yaz32(ivGiris, seq);
            yaz32(ivGiris, nonce);
            yaz32(ivGiris, (int) ts);
            byte[] iv = Arrays.copyOf(MessageDigest.getInstance("SHA-256").digest(ivGiris.toByteArray()), 12);
            ByteArrayOutputStream aad = new ByteArrayOutputStream();
            yaz32(aad, seq);
            yaz32(aad, connectNonce);
            if (ackVar) yaz32(aad, ackNonce);
            yaz32(aad, nonce);
            yaz32(aad, (int) ts);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(sifrele ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE, new SecretKeySpec(anahtar, "AES"),
                    new GCMParameterSpec(128, iv));
            c.updateAAD(aad.toByteArray());
            return c.doFinal(veri);  // şifrelerken: şifreli + 16 bayt etiket
        } catch (GeneralSecurityException e) {
            throw new IOException("Şifreleme hatası (local key doğru mu?)", e);
        }
    }

    // -------------------------------------------------------------- yardımcı

    private static long simdi() {
        return System.currentTimeMillis() / 1000L;
    }

    private static boolean gecerliSurum(byte[] b, int i) {
        if (i + 3 > b.length) return false;
        String s = new String(b, i, 3, StandardCharsets.US_ASCII);
        return s.equals("1.0") || s.equals("L01") || s.equals("A01") || s.equals("B01");
    }

    private static void yaz32(ByteArrayOutputStream o, int v) {
        o.write(v >>> 24);
        o.write(v >>> 16);
        o.write(v >>> 8);
        o.write(v);
    }

    private static void yaz16(ByteArrayOutputStream o, int v) {
        o.write(v >>> 8);
        o.write(v);
    }

    private static int oku32(byte[] b, int i) {
        return ((b[i] & 0xFF) << 24) | ((b[i + 1] & 0xFF) << 16) | ((b[i + 2] & 0xFF) << 8) | (b[i + 3] & 0xFF);
    }

    private static int oku16(byte[] b, int i) {
        return ((b[i] & 0xFF) << 8) | (b[i + 1] & 0xFF);
    }

    /** JSON içindeki "anahtar": "..." string değerini kaçışları çözerek döner. */
    static String jsonString(String json, String anahtar) {
        String desen = "\"" + anahtar + "\"";
        int p = json.indexOf(desen);
        if (p < 0) return null;
        p += desen.length();
        while (p < json.length() && (json.charAt(p) == ' ' || json.charAt(p) == ':')) p++;
        if (p >= json.length() || json.charAt(p) != '"') return null;
        p++;
        StringBuilder s = new StringBuilder();
        while (p < json.length() && json.charAt(p) != '"') {
            char c = json.charAt(p++);
            if (c == '\\' && p < json.length()) {
                char e = json.charAt(p++);
                switch (e) {
                    case 'n': c = '\n'; break;
                    case 't': c = '\t'; break;
                    case 'r': c = '\r'; break;
                    case 'u':
                        c = (char) Integer.parseInt(json.substring(p, Math.min(p + 4, json.length())), 16);
                        p += 4;
                        break;
                    default: c = e;  // \" \\ \/
                }
            }
            s.append(c);
        }
        return s.toString();
    }

    /** JSON içindeki "anahtar": 123 sayısını okur (boşluklara toleranslı). Yoksa -1. */
    static long jsonSayi(String json, String anahtar) {
        String desen = "\"" + anahtar + "\"";
        int p = json.indexOf(desen);
        if (p < 0) return -1;
        p += desen.length();
        while (p < json.length() && (json.charAt(p) == ' ' || json.charAt(p) == ':')) p++;
        long v = 0;
        boolean var = false;
        while (p < json.length() && Character.isDigit(json.charAt(p))) {
            v = v * 10 + (json.charAt(p++) - '0');
            var = true;
        }
        return var ? v : -1;
    }
}
