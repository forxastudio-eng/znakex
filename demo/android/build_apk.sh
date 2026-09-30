#!/usr/bin/env bash
# Builds the ZNAKEX Android APK without Gradle, using the Ubuntu Android tools:
#   sudo apt-get install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23
# Usage: demo/android/build_apk.sh [tester|release]   (default: tester)
set -euo pipefail
MODE="${1:-tester}"
HERE="$(cd "$(dirname "$0")" && pwd)"
DEMO="$(cd "$HERE/.." && pwd)"
ANDROID_JAR="${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}"
OUT="$HERE/out"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

VERSION_NAME="0.8.0"
VERSION_CODE="12"
if [ "$MODE" = "tester" ]; then
  PACKAGE="com.forxastudio.znakex.tester"; LABEL="ZNAKEX Tester"; TESTER=true; APK="znakex-tester.apk"
else
  PACKAGE="com.forxastudio.znakex"; LABEL="ZNAKEX"; TESTER=false; APK="znakex.apk"
fi

mkdir -p "$OUT" "$WORK/gen" "$WORK/obj" "$WORK/assets/www"
sed -e "s/@PACKAGE@/$PACKAGE/" -e "s/@LABEL@/$LABEL/" -e "s/@VERSION_CODE@/$VERSION_CODE/" -e "s/@VERSION_NAME@/$VERSION_NAME/" \
  "$HERE/AndroidManifest.template.xml" > "$WORK/AndroidManifest.xml"

# game files -> assets/www
cp -r "$DEMO/index.html" "$DEMO/css" "$DEMO/js" "$DEMO/fonts" "$DEMO/assets" "$WORK/assets/www/"
SUFFIX=""; [ "$TESTER" = true ] && SUFFIX="-tester"
echo "window.ZNAKEX_BUILD = { tester: $TESTER, version: '$VERSION_NAME$SUFFIX' };" > "$WORK/assets/www/build.js"

aapt package -f -m -J "$WORK/gen" -M "$WORK/AndroidManifest.xml" -S "$HERE/res" -I "$ANDROID_JAR"
javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -classpath "$ANDROID_JAR" \
  -d "$WORK/obj" $(find "$HERE/src" "$WORK/gen" -name '*.java')
dalvik-exchange --dex --output="$WORK/classes.dex" "$WORK/obj"
aapt package -f -M "$WORK/AndroidManifest.xml" -S "$HERE/res" -A "$WORK/assets" -I "$ANDROID_JAR" -F "$WORK/app.unaligned.apk"
(cd "$WORK" && aapt add -f app.unaligned.apk classes.dex > /dev/null)
zipalign -f 4 "$WORK/app.unaligned.apk" "$WORK/app.aligned.apk"

KS="${KEYSTORE:-$HERE/debug.keystore}"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -storepass android -keypass android -alias znakex \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=ZNAKEX Debug, O=Forxa Studio, C=ES" > /dev/null 2>&1
fi
apksigner sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --ks-key-alias znakex \
  --min-sdk-version 24 --out "$OUT/$APK" "$WORK/app.aligned.apk"
apksigner verify "$OUT/$APK"
echo "APK: $OUT/$APK ($(du -h "$OUT/$APK" | cut -f1))"
