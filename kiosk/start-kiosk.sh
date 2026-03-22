#!/bin/bash

# 1. Configuration & Path Detection
clear
echo "Initializing Kiosk System..."
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

# 3. Memory & Resource Hardening
# Avoid /tmp (RAM-based) for profiles. We use a disk-based folder to save RAM.
SPLASH_PROFILE="$SCRIPT_DIR/.splash-profile"

echo "Releasing stale memory..."
pkill -9 -f chromium &> /dev/null || true
pkill -9 -f chromium-browser &> /dev/null || true
rm -rf "$SPLASH_PROFILE" &> /dev/null
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

# 5. Launch Splash (Low-RAM Strategy)
# disk-cache-size and media-cache-size are set to minimal to prevent RAM bloat.
echo "Starting low-resource splash..."
"$CHROME_BIN" \
  --kiosk \
  --user-data-dir="$SPLASH_PROFILE" \
  --background-color='#000000' \
  --disk-cache-size=1048576 \
  --media-cache-size=1048576 \
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

# Wait for visuals to render
sleep 4

# 6. Container Lifecycle
echo "Restoring system containers..."
docker compose down --remove-orphans &> /dev/null
rm -rf frontend-service/.next

echo "Starting system services..."
docker compose up -d &> /dev/null

# 7. Transition Health Check
echo "Warming up services..."
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    if [ "$STATUS" = "200" ]; then
        echo "Frontend is ready. Finalizing transition..."
        break
    else
        sleep 2
    fi
done

# 8. Seamless Handover
# Launch main app in default profile. One window covers the other.
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

# Allow time for initial rendering
sleep 5

# 9. Resource Release
# Kill the splash screen process tree entirely.
# This prevents background tabs from eating memory.
pkill -9 -f "$SPLASH_PROFILE" &> /dev/null

echo "Kiosk is active. Memory optimization complete."