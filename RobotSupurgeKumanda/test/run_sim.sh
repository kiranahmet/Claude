#!/usr/bin/env bash
# ESP32 programının buton akışını bilgisayarda, sahte robota karşı test eder.
# Gerekenler: g++, libmbedtls-dev, python3 + `pip install python-roborock`
set -uo pipefail
cd "$(dirname "$0")"
PY=${PYTHON:-python3}
KEY="xxxxxxxxxxxxxxxx"   # config.h'deki örnek key
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

{ echo '#include "Arduino.h"'; cat ../RobotSupurgeKumanda/RobotSupurgeKumanda.ino; } >"$TMP/sketch.cpp"
# Zaman aşımı testi kısa sürsün diye 3 sn
g++ -std=gnu++17 -Wall -Wextra -O1 -DSECIM_ZAMAN_ASIMI_MS=3000 -Isim -I../RobotSupurgeKumanda \
  -o "$TMP/sim" "$TMP/sketch.cpp" sim/sim_main.cpp ../RobotSupurgeKumanda/roborock_local.cpp \
  -lmbedcrypto || exit 1

fail=0
# senaryo <açıklama> <süre_sn> <basışlar...>   (basış: pin@ms)
# Ardından robot.log ve sim.log dosyalarına bakılarak kontrol edilir.
senaryo() {
  local sure=$2; shift 2
  local port=$((40000 + RANDOM % 20000))
  $PY fake_robot.py "$port" v1 "$KEY" >"$TMP/robot.log" 2>&1 &
  local pid=$!
  for _ in $(seq 50); do grep -q ready "$TMP/robot.log" && break; sleep 0.1; done
  timeout "$sure" "$TMP/sim" "$port" -1 "$@" >"$TMP/sim.log" 2>&1
  sleep 0.2
  kill "$pid" 2>/dev/null
}
sonuc() {  # $1 açıklama, $2 = 0 başarılı
  if [ "$2" = 0 ]; then echo "OK   $1"; else
    echo "FAIL $1"; cat "$TMP/sim.log"; cat "$TMP/robot.log"; fail=1; fi
}
rpc_sayisi() { grep -c '"rpc"' "$TMP/robot.log"; }

# Pinler (config.h): Mutfak 32/LED23, Oturma 33/22, Salon 25/21, Koridor 26/19,
#                    Cocuk 27/18, Yatak 14/17, Başlat 13, Eve Dön 4
A="Mutfak, Salon sec, Mutfak kaldir, Koridor sec, Baslat -> Salon+Koridor"
senaryo "$A" 6 32@1500 25@1900 32@2300 26@2700 13@3100
grep -qF '"segments": [18, 19]' "$TMP/robot.log" && [ "$(rpc_sayisi)" = 1 ] \
  && grep -q "LED 21=1" "$TMP/sim.log" && grep -q "LED 19=1" "$TMP/sim.log"
sonuc "$A" $?

A="Eve Don -> istasyona don"
senaryo "$A" 4 4@1500
grep -qF '"method": "app_charge"' "$TMP/robot.log"
sonuc "$A" $?

A="Oda secmeden Baslat (bir sey olmamali), sonra Oturma Odasi + Baslat"
senaryo "$A" 5 13@1500 33@2000 13@2400
grep -qF '"segments": [17]' "$TMP/robot.log" && [ "$(rpc_sayisi)" = 1 ]
sonuc "$A" $?

A="Butun odalari sec + Baslat"
senaryo "$A" 6 32@1500 33@1800 25@2100 26@2400 27@2700 14@3000 13@3400
grep -qF '"segments": [16, 17, 18, 19, 20, 21]' "$TMP/robot.log"
sonuc "$A" $?

A="Arka arkaya iki temizlik (kutu hic uyumaz)"
senaryo "$A" 9 32@1500 13@1900 25@5000 14@5400 13@5800
grep -qF '"segments": [16]' "$TMP/robot.log" && grep -qF '"segments": [18, 21]' "$TMP/robot.log" \
  && ! grep -q "^UYKU" "$TMP/sim.log"
sonuc "$A" $?

A="Zaman asimi: secim silinir, sonra Baslat bir sey yapmaz"
senaryo "$A" 7 32@1500 13@5500
grep -q "Zaman asimi" "$TMP/sim.log" && [ "$(rpc_sayisi)" = 0 ]
sonuc "$A" $?

# --- Segment 0: o oda bu robotta yok, butona basınca seçilmemeli
mkdir -p "$TMP/cfg"
sed 's/{"Yatak Odasi",     14,   17,  21}/{"Yatak Odasi",     14,   17,  0}/' \
  ../RobotSupurgeKumanda/config.h >"$TMP/cfg/config.h"
grep -q '14,   17,  0}' "$TMP/cfg/config.h" || { echo "FAIL test ayari olusturulamadi"; fail=1; }
g++ -std=gnu++17 -Wall -Wextra -O1 -I"$TMP/cfg" -Isim -I../RobotSupurgeKumanda -o "$TMP/sim0" \
  "$TMP/sketch.cpp" sim/sim_main.cpp ../RobotSupurgeKumanda/roborock_local.cpp -lmbedcrypto || exit 1
A="Segment 0 olan oda secilmez, LED'i yanip soner; digerleri calisir"
cp "$TMP/sim" "$TMP/sim_normal"; cp "$TMP/sim0" "$TMP/sim"
senaryo "$A" 6 14@1500 32@2500 13@2900
cp "$TMP/sim_normal" "$TMP/sim"
grep -q "tanimli degil" "$TMP/sim.log" && grep -qF '"segments": [16]' "$TMP/robot.log" \
  && [ "$(grep -c 'LED 17=1' "$TMP/sim.log")" -ge 3 ]
sonuc "$A" $?

exit $fail
