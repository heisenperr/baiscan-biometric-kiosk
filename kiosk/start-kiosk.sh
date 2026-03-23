#!/bin/bash
set -x

# 1. Configuration & Path Detection
clear
echo "Initializing Kiosk System (Low-RAM Optimization)..."
SCRIPT_PATH="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
export DISPLAY=:0

# Detect binary
CHROME_BIN=$(which chromium || which chromium-browser || echo "chromium")

# Move to project root
cd "$SCRIPT_DIR/.." || cd "$SCRIPT_DIR"

# 2. Network & IP Detection
export ALLOWED_HOST=$(hostname -I | awk '{print $1}')
export ALLOWED_HOST=${ALLOWED_HOST:-localhost}
URL="http://$ALLOWED_HOST"

echo "------------------------------------------"
echo "Detected IP: $ALLOWED_HOST"
echo "Target URL:  $URL"
echo "------------------------------------------"

# 3. Memory Hardening
# Using a persistent splash profile on disk to reduce RAM pressure.
SPLASH_PROFILE="$SCRIPT_DIR/.splash-profile"

echo "Releasing stale memory..."
pkill -9 -f chromium &> /dev/null || true
pkill -9 -f chromium-browser &> /dev/null || true
sleep 1

# 4. Splash Screen Path Detection
if [ -f "kiosk/start-kiosk.html" ]; then
    ABS_SPLASH_PATH="$(readlink -f "kiosk/start-kiosk.html")"
elif [ -f "start-kiosk.html" ]; then
    ABS_SPLASH_PATH="$(readlink -f "start-kiosk.html")"
else
    ABS_SPLASH_PATH=""
fi

if [ -n "$ABS_SPLASH_PATH" ]; then
    SPLASH_URL="file://$ABS_SPLASH_PATH"
else
    SPLASH_URL="$URL"
fi

# 5. Launch Splash (Ultra-Low-RAM Strategy)
echo "Starting low-resource splash..."
"$CHROME_BIN" \
  --kiosk \
  --user-data-dir="$SPLASH_PROFILE" \
  --background-color='#000000' \
  --disk-cache-size=1048576 \
  --media-cache-size=1048576 \
  --disable-gpu-program-cache \
  --disable-gpu-shader-disk-cache \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --password-store=basic \
  --incognito \
  --allow-file-access-from-files \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  "$SPLASH_URL" &

# Wait for visuals to render fully before Docker load starts
sleep 6

# 6. Service Restoration
echo "Restoring system services (preserving build)..."
# !!! IMPORTANT: We NO LONGER delete the .next folder. 
# Recompiling Next.js on a 2GB Pi 5 will freeze the system.
docker compose down --remove-orphans
docker compose up -d --build

# Let the Pi's CPU settle after container startup before polling
sleep 15

# 7. Transition Health Check (Low Polling Frequency)
echo "Warming up services..."
while true; do
    # Only poll every 5 seconds to minimize CPU/RAM contention
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$URL")
    if [ "$STATUS" = "200" ]; then
        echo "Frontend is ready. Finalizing handover..."
        break
    else
        sleep 5
    fi
done

# 8. Seamless Handover
echo "Handing over to live kiosk..."
"$CHROME_BIN" \
  --kiosk \
  --background-color='#000000' \
  --disk-cache-size=1048576 \
  --media-cache-size=1048576 \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --password-store=basic \
  --incognito \
  "$URL" &

# Allow time for initial app rendering
sleep 10

# 9. Resource Release
# Purge the splash process entirely to free up RAM for the main app
pkill -9 -f "$SPLASH_PROFILE" &> /dev/null

echo "Kiosk is active. Enjoy!"