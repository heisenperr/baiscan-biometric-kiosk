#!/bin/bash

# 1. Configuration & Global Pathing
clear
echo "Initializing Kiosk System..."
SCRIPT_PATH="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
export DISPLAY=:0

# Detect the correct Chromium binary for the system
CHROME_BIN=$(which chromium || which chromium-browser || echo "chromium")

# Move to the project root
cd "$SCRIPT_DIR/.." || cd "$SCRIPT_DIR"

# 2. Network & IP Detection
export ALLOWED_HOST=$(hostname -I | awk '{print $1}')
export ALLOWED_HOST=${ALLOWED_HOST:-localhost}
URL="http://$ALLOWED_HOST"

echo "------------------------------------------"
echo "Detected IP: $ALLOWED_HOST"
echo "Target URL:  $URL"
echo "------------------------------------------"

# 3. Kiosk Profile Management
# Using a single profile allows the browser to re-navigate the existing window smoothly.
KIOSK_PROFILE="/tmp/kiosk-session-profile"

echo "Cleaning stale browser sessions..."
pkill -f "$CHROME_BIN" &> /dev/null || true
rm -rf "$KIOSK_PROFILE" &> /dev/null
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

# 5. Initial Launch (Splash Screen)
# Added --background-color and profile reuse for zero-flicker performance
echo "Launching splash screen..."
"$CHROME_BIN" \
  --kiosk \
  --user-data-dir="$KIOSK_PROFILE" \
  --background-color='#000000' \
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

# Wait for the browser to render
sleep 4

# 6. Container Lifecycle
echo "Managing system containers..."
docker compose down --remove-orphans &> /dev/null
rm -rf frontend-service/.next

echo "Starting system services..."
docker compose up -d &> /dev/null

# 7. Transition Health Check
echo "Warming up services..."
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    if [ "$STATUS" = "200" ]; then
        echo "Frontend is ready. Navigating live..."
        break
    else
        sleep 2
    fi
done

# 8. Seamless Handover
# By re-using the KIOSK_PROFILE, Chromium will navigate the EXISTING window
# rather than opening a new one, eliminating window manager flicker.
"$CHROME_BIN" \
  --kiosk \
  --user-data-dir="$KIOSK_PROFILE" \
  --background-color='#000000' \
  "$URL" &

echo "Kiosk is active. Enjoy!"