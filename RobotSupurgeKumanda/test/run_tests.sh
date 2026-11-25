#!/usr/bin/env bash
# Firmware protokol kodunu python-roborock'a karşı test eder.
# Gerekenler: g++, libmbedtls-dev, python3 + `pip install python-roborock`
set -euo pipefail
cd "$(dirname "$0")"
PY=${PYTHON:-python3}
KEY="AbCdEf0123456789"

g++ -std=c++17 -Wall -Wextra -O1 -o host_test host_test.cpp ../RobotSupurgeKumanda/roborock_local.cpp \
  -lmbedcrypto

fail=0
run_case() {  # $1 robot modu, $2 istemcinin önce denediği sürüm, $3 beklenen sürüm, $4 HELLO biçimi
  local port=$((40000 + RANDOM % 20000))
  local log; log=$(mktemp)
  $PY fake_robot.py "$port" "$1" "$KEY" "${4:-len0crc}" >"$log" 2>&1 &
  local pid=$!
  for _ in $(seq 50); do grep -q ready "$log" && break; sleep 0.1; done
  local out
  if out=$(./host_test "$port" "$2" "$KEY") && grep -q "version=$3" <<<"$out" \
     && grep -q '"segments": \[16, 18, 21\]' "$log" && grep -q '"method": "app_charge"' "$log" \
     && grep -q 'response=.*"result": *\["ok"\]' <<<"$out"; then
    echo "OK   robot=$1 tercih=$2 -> $3 (hello=${4:-len0crc})"
  else
    echo "FAIL robot=$1 tercih=$2"; echo "$out"; cat "$log"; fail=1
  fi
  kill "$pid" 2>/dev/null || true
  rm -f "$log"
}

run_case v1  1.0 1.0
run_case l01 L01 L01
run_case l01 1.0 L01   # 1.0 cevapsız kalınca L01'e geçmeli
run_case v1  L01 1.0   # L01 cevapsız kalınca 1.0'a geçmeli
for fmt in bare crc; do
  run_case v1  1.0 1.0 $fmt
  run_case l01 L01 L01 $fmt
done

# Kurulum betiğinin yerel bağlantısı (python-roborock'un kendi istemcisi, port 58867)
for mode in v1 l01; do
  log=$(mktemp)
  $PY fake_robot.py 58867 $mode "$KEY" len0crc >"$log" 2>&1 &
  pid=$!
  for _ in $(seq 50); do grep -q ready "$log" && break; sleep 0.1; done
  if out=$(timeout 30 $PY ../kurulum/kurulum.py yerel-test 127.0.0.1 "$KEY" duid get_status 2>&1) \
     && grep -q "'ok'" <<<"$out"; then
    echo "OK   kurulum.py yerel test robot=$mode"
  else
    echo "FAIL kurulum.py yerel test robot=$mode"; echo "$out"; cat "$log"; fail=1
  fi
  kill "$pid" 2>/dev/null || true; rm -f "$log"
done
exit $fail
