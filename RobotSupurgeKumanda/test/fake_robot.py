"""Sahte Roborock robotu — firmware protokol kodunu bilgisayarda test etmek için.

Çerçeveleri python-roborock kütüphanesinin kendi kodlayıcı/çözücüsüyle işler;
yani ESP32 kodunun ürettiği paketler gerçek kütüphaneyle birebir uyumlu mu,
bunu doğrular.

Kullanım: python fake_robot.py <port> <v1|l01> <local_key> [bare|len0crc|crc]
Her bağlantıda alınan RPC komutlarını JSON satırı olarak stdout'a yazar.
"""

import binascii
import json
import socket
import sys
import time

from roborock.protocol import MessageParser
from roborock.roborock_message import RoborockMessage, RoborockMessageProtocol


def frames(sock):
    buf = b""
    while True:
        data = sock.recv(4096)
        if not data:
            return
        buf += data
        while len(buf) >= 4:
            n = int.from_bytes(buf[:4], "big")
            if len(buf) < 4 + n:
                break
            yield buf[: 4 + n]
            buf = buf[4 + n :]


def parse(frame, key, connect_nonce=None, ack_nonce=None):
    body = frame[4:]
    if len(body) in (17, 21):
        # İçeriksiz çerçeve (HELLO). Kütüphanenin ayrıştırıcısı bunu okuyamıyor
        # (kendi ürettiği HELLO'yu da okuyamıyor), o yüzden elle çözüyoruz.
        if len(body) == 21:
            assert binascii.crc32(body[:17]) == int.from_bytes(body[17:], "big"), "CRC hatali"
        # Baytların kütüphanenin ürettiğiyle birebir aynı olduğunu da doğrula
        msg = RoborockMessage(
            version=body[:3],
            seq=int.from_bytes(body[3:7], "big"),
            random=int.from_bytes(body[7:11], "big"),
            timestamp=int.from_bytes(body[11:15], "big"),
            protocol=RoborockMessageProtocol(int.from_bytes(body[15:17], "big")),
        )
        assert build(msg, key, msg.random) == frame, "HELLO baytlari kutuphaneyle ayni degil"
        return msg
    msgs, _ = MessageParser.parse(frame, local_key=key, connect_nonce=connect_nonce, ack_nonce=ack_nonce)
    return msgs[0]


def build(msg, key, connect_nonce=None, ack_nonce=None):
    return MessageParser.build(msg, local_key=key, connect_nonce=connect_nonce, ack_nonce=ack_nonce)


def hello_response(version, ack_nonce, fmt):
    """İçeriksiz HELLO yanıtını farklı biçimlerde üretir.

    bare    : yalnız başlık            (python-roborock okuyabilir)
    len0crc : başlık + 0000 + CRC      (python-roborock okuyabilir)
    crc     : başlık + CRC             (python-roborock okuyamaz, ESP32 okumalı)
    """
    body = (
        version
        + (1).to_bytes(4, "big")
        + ack_nonce.to_bytes(4, "big")
        + int(time.time()).to_bytes(4, "big")
        + int(RoborockMessageProtocol.HELLO_RESPONSE).to_bytes(2, "big")
    )
    if fmt == "len0crc":
        body += b"\x00\x00"
        body += binascii.crc32(body).to_bytes(4, "big")
    elif fmt == "crc":
        body += binascii.crc32(body).to_bytes(4, "big")
    return len(body).to_bytes(4, "big") + body


def serve(port, mode, key, hello_fmt="len0crc"):
    srv = socket.socket()
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", port))
    srv.listen(4)
    print(json.dumps({"ready": port}), flush=True)
    while True:
        conn, _ = srv.accept()
        connect_nonce = ack_nonce = None
        version = b"L01" if mode == "l01" else b"1.0"
        try:
            for frame in frames(conn):
                msg = parse(frame, key, connect_nonce, ack_nonce)
                if msg.protocol == RoborockMessageProtocol.HELLO_REQUEST:
                    if msg.version != version:
                        print(json.dumps({"hello_ignored": msg.version.decode()}), flush=True)
                        continue  # bu sürümü konuşmuyor: yanıt verme
                    connect_nonce, ack_nonce = msg.random, 4242
                    conn.sendall(hello_response(version, ack_nonce, hello_fmt))
                    print(json.dumps({"hello_ok": version.decode()}), flush=True)
                elif msg.protocol == RoborockMessageProtocol.GENERAL_REQUEST:
                    outer = json.loads(msg.payload)
                    inner = json.loads(outer["dps"]["101"])
                    print(json.dumps({"rpc": inner, "t": outer["t"], "hdr_ts": msg.timestamp}), flush=True)
                    # Araya ilgisiz bir durum bildirimi sıkıştır (filtreleme testi)
                    push = RoborockMessage(
                        protocol=RoborockMessageProtocol.GENERAL_RESPONSE,
                        version=version,
                        payload=json.dumps({"dps": {"121": 5}, "t": int(time.time())}).encode(),
                    )
                    conn.sendall(build(push, key, connect_nonce, ack_nonce))
                    result = {"id": inner["id"], "result": ["ok"]}
                    resp = RoborockMessage(
                        protocol=RoborockMessageProtocol.GENERAL_RESPONSE,
                        version=version,
                        payload=json.dumps(
                            {"dps": {"102": json.dumps(result)}, "t": int(time.time())}
                        ).encode(),
                    )
                    conn.sendall(build(resp, key, connect_nonce, ack_nonce))
        finally:
            conn.close()


if __name__ == "__main__":
    serve(int(sys.argv[1]), sys.argv[2], sys.argv[3], *sys.argv[4:5])
