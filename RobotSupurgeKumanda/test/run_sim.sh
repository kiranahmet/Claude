#!/usr/bin/env bash
# ESP32 programının buton akışını bilgisayarda, sahte robota karşı test eder.
# Gerekenler: g++, libmbedtls-dev, python3 + `pip install python-roborock`
set -euo pipefail
cd "$(dirname "$0")"
PY=${PYTHON:-python3}
KEY="xxxxxxxxxxxxxxxx"   # config.h'deki örnek key
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

{ echo '#include "Arduino.h"'; cat ../RobotSupurgeKumanda/RobotSupurgeKumanda.ino; } >"$TMP/sketch.cpp"
g++ -std=gnu++17 -Wall -Wextra -O1 -Isim -I../RobotSupurgeKumanda -o "$TMP/sim" \
  "$TMP/sketch.cpp" sim/sim_main.cpp ../RobotSupurgeKumanda/roborock_local.cpp -lmbedcrypto

fail=0
# $1 açıklama, $2 robotta beklenen metin ('-' = robota hiç gidilmemeli), $3 uyandıran pin, kalanlar basışlar
senaryo() {
  local ad=$1 bek=$2; shift 2
  local port=$((40000 + RANDOM % 20000))
  $PY fake_robot.py "$port" v1 "$KEY" >"$TMP/robot.log" 2>&1 &
  local pid=$!
  for _ in $(seq 50); do grep -q ready "$TMP/robot.log" && break; sleep 0.1; done
  timeout 20 "$TMP/sim" "$port" "$@" >"$TMP/sim.log" 2>&1 || true
  sleep 0.2
  kill "$pid" 2>/dev/null || true
  local ok=1
  grep -q "^UYKU" "$TMP/sim.log" || ok=0
  if [ "$bek" = "-" ]; then
    grep -q '"rpc"' "$TMP/robot.log" && ok=0
  else
    grep -qF "$bek" "$TMP/robot.log" || ok=0
  fi
  if [ $ok = 1 ]; then echo "OK   $ad"; else
    echo "FAIL $ad"; cat "$TMP/sim.log"; cat "$TMP/robot.log"; fail=1; fi
  cp "$TMP/sim.log" "$TMP/son_sim.log"
}

# Pinler (config.h): Mutfak 32, Oturma 33, Salon 25, Koridor 26, Cocuk 27, Yatak 14,
#                    Başlat 13, Eve Dön 4
senaryo "Mutfak ile uyan, Salon sec, Mutfak kaldir, Koridor sec, Baslat -> Salon+Koridor" \
  '"segments": [18, 19]' 32 25@400 32@800 26@1200 13@1600
# Seçilen odaların LED'leri yanmış olmalı (Salon LED 21, Koridor LED 19)
grep -q "LED 21=1" "$TMP/son_sim.log" && grep -q "LED 19=1" "$TMP/son_sim.log" \
  && echo "OK   secilen odalarin LED'leri yandi" || { echo "FAIL LED"; fail=1; }

senaryo "Eve Don ile uyan -> istasyona don" '"method": "app_charge"' 4
senaryo "Oda secmeden Baslat (bir sey olmamali), sonra Oturma Odasi + Baslat" \
  '"segments": [17]' 13 33@700 13@1100
senaryo "Butun odalari sec + Baslat" '"segments": [16, 17, 18, 19, 20, 21]' \
  32 33@300 25@600 26@900 27@1200 14@1500 13@1900
senaryo "Pil takildi (buton yok) -> robota gitmeden uyu" - -1
exit $fail
