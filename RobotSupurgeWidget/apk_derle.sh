#!/usr/bin/env bash
# Android Studio olmadan APK üretir (Android Studio ile de açılıp derlenebilir).
#
# Gerekenler (ortam değişkenleri):
#   BUILD_TOOLS  Android build-tools klasörü (aapt2, d8, zipalign, apksigner)
#   ANDROID_JAR  platforms/android-34/android.jar
#   KOTLIN_JARS  kotlin-compiler-embeddable 1.9.22 ve bağımlılıklarının olduğu klasör
#   KEYSTORE     imza anahtarı (yoksa oluşturulur), KEYSTORE_PASS şifresi
# İsteğe bağlı:
#   ONCEDEN_KEY  local key'i uygulamaya önceden yazar (bu APK'yı paylaşma!)
#   ONCEDEN_ODALAR  örnek oda listesi yerine bu liste gelir ("Mutfak = 22\nSalon = 23" gibi)
#   CIKIS        çıktı dosyası (varsayılan: RobotSupurgeWidget.apk)
set -euo pipefail
KOK=$(cd "$(dirname "$0")" && pwd)
CIKIS=${CIKIS:-$KOK/RobotSupurgeWidget.apk}
KEYSTORE_PASS=${KEYSTORE_PASS:-robotsupurge}
B=$(mktemp -d); trap 'rm -rf "$B"' EXIT
mkdir -p "$B/src" "$B/gen" "$B/classes" "$B/dex"

cp "$KOK"/app/src/main/java/com/robotsupurge/widget/*.{kt,java} "$B/src/"
if [ -n "${ONCEDEN_KEY:-}" ]; then
  [ ${#ONCEDEN_KEY} -eq 16 ] || { echo "ONCEDEN_KEY 16 karakter olmalı"; exit 1; }
  sed -i "s|private const val ORNEK_KEY = \"\"|private const val ORNEK_KEY = \"$ONCEDEN_KEY\"|" "$B/src/Ayarlar.kt"
  grep -q "$ONCEDEN_KEY" "$B/src/Ayarlar.kt"
fi
if [ -n "${ONCEDEN_ODALAR:-}" ]; then
  python3 - "$B/src/Ayarlar.kt" "$ONCEDEN_ODALAR" <<'PY'
import re, sys
p, odalar = sys.argv[1], sys.argv[2].replace('"', '')
s = open(p, encoding="utf-8").read()
# lambda: değiştirme metnindeki \n kaçışı Kotlin'e olduğu gibi (\n olarak) gitsin
s2 = re.sub(r'const val ORNEK_ODALAR = ".*"', lambda m: 'const val ORNEK_ODALAR = "' + odalar + '"', s)
assert s2 != s
open(p, "w", encoding="utf-8").write(s2)
PY
fi

# 1) Kaynaklar (namespace, Gradle'da olduğu gibi manifest'e eklenir)
sed 's|<manifest xmlns:android="http://schemas.android.com/apk/res/android">|<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.robotsupurge.widget">|' \
  "$KOK/app/src/main/AndroidManifest.xml" > "$B/manifest.xml"
"$BUILD_TOOLS/aapt2" compile --dir "$KOK/app/src/main/res" -o "$B/res.zip"
"$BUILD_TOOLS/aapt2" link -o "$B/base.apk" -I "$ANDROID_JAR" --manifest "$B/manifest.xml" --java "$B/gen" \
  "$B/res.zip" --min-sdk-version 24 --target-sdk-version 34 --version-code 4 --version-name 1.3
R_JAVA="$B/gen/com/robotsupurge/widget/R.java"

# 2) Kod
KCP=$(ls "$KOTLIN_JARS"/{kotlin-compiler-embeddable-1.9.22,kotlin-stdlib-1.9.22,kotlin-script-runtime-1.9.22,kotlin-reflect-1.6.10,kotlin-daemon-embeddable-1.9.22,trove4j-1.0.20200330,annotations-13.0}.jar | tr '\n' ':')
java -cp "$KCP" org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -jvm-target 17 -no-reflect -no-stdlib -no-jdk \
  -classpath "$ANDROID_JAR:$KOTLIN_JARS/kotlin-stdlib-1.9.22.jar" -d "$B/classes" "$B"/src/*.kt "$B"/src/*.java "$R_JAVA"
javac --release 17 -nowarn -d "$B/classes" -cp "$ANDROID_JAR:$B/classes" "$B"/src/*.java "$R_JAVA"
"$BUILD_TOOLS/d8" --release --min-api 24 --lib "$ANDROID_JAR" --output "$B/dex" \
  $(find "$B/classes" -name '*.class') "$KOTLIN_JARS/kotlin-stdlib-1.9.22.jar"

# 3) Paketle, hizala, imzala
cp "$B/base.apk" "$B/unaligned.apk"
python3 -c "import zipfile,sys; z=zipfile.ZipFile(sys.argv[1],'a',zipfile.ZIP_DEFLATED); z.write(sys.argv[2],'classes.dex'); z.close()" \
  "$B/unaligned.apk" "$B/dex/classes.dex"
"$BUILD_TOOLS/zipalign" -p -f 4 "$B/unaligned.apk" "$B/aligned.apk"
[ -f "$KEYSTORE" ] || keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KEYSTORE_PASS" -keypass "$KEYSTORE_PASS" \
  -alias widget -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Robot Supurge Widget"
"$BUILD_TOOLS/apksigner" sign --ks "$KEYSTORE" --ks-pass "pass:$KEYSTORE_PASS" --ks-key-alias widget \
  --out "$CIKIS" "$B/aligned.apk"
"$BUILD_TOOLS/apksigner" verify "$CIKIS"
echo "APK hazır: $CIKIS"
