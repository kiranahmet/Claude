#!/usr/bin/env bash
# Widget'ın robot protokolünü (RoborockYerel.java) python-roborock'a karşı test eder.
# Gerekenler: JDK 11+, python3 + `pip install python-roborock`
set -uo pipefail
cd "$(dirname "$0")"
PY=${PYTHON:-python3}
KEY="AbCdEf0123456789"
ROBOT=../../RobotSupurgeKumanda/test/fake_robot.py
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
javac -d "$TMP" ../app/src/main/java/com/robotsupurge/widget/RoborockYerel.java YerelTest.java || exit 1
fail=0
for durum in "v1 len0crc 1.0" "l01 len0crc L01" "v1 bare 1.0" "l01 bare L01" "v1 crc 1.0" "l01 crc L01"; do
  set -- $durum
  port=$((40000 + RANDOM % 20000))
  $PY $ROBOT "$port" "$1" "$KEY" "$2" >"$TMP/robot.log" 2>&1 &
  pid=$!
  for _ in $(seq 50); do grep -q ready "$TMP/robot.log" && break; sleep 0.1; done
  if out=$(java -cp "$TMP" YerelTest "$port" "$KEY" 2>&1) && grep -q "surum=$3" <<<"$out" \
     && grep -qF '"segments": [16, 18, 21]' "$TMP/robot.log" && grep -qF '"method": "app_charge"' "$TMP/robot.log"; then
    echo "OK   robot=$1 hello=$2 -> $3"
  else
    echo "FAIL robot=$1 hello=$2"; echo "$out"; cat "$TMP/robot.log"; fail=1
  fi
  kill "$pid" 2>/dev/null
done
exit $fail
