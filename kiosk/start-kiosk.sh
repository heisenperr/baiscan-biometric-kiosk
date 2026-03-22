#!/bin/bash

# 1. Configuration & Initial Cleanup
# Clear the terminal buffer to prevent any flashing before Chromium covers it
clear
echo "Initializing Kiosk System..."
SCRIPT_PATH="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
export DISPLAY=:0

# Move to the project root (assumed to be one level up from the kiosk/ folder)
cd "$SCRIPT_DIR/.." || cd "$SCRIPT_DIR"

# 2. Network & IP Detection
export ALLOWED_HOST=$(hostname -I | awk '{print $1}')
export ALLOWED_HOST=${ALLOWED_HOST:-localhost}
URL="http://$ALLOWED_HOST"

echo "------------------------------------------"
echo "Detected IP: $ALLOWED_HOST"
echo "Target URL:  $URL"
echo "------------------------------------------"

# 3. Isolated Splash Launch
# We use a temporary profile for the splash screen so we can control it independently
# without affecting the main application window.
SPLASH_PROFILE="/tmp/kiosk-splash-profile"

echo "Cleaning stale browser sessions..."
pkill -f chromium &> /dev/null || true
rm -rf "$SPLASH_PROFILE" &> /dev/null
sleep 1

# Detect Splash Screen Path
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

# 4. Immediate Visual Coverage
# Launch the splash screen instantly. It stays on top throughout the Docker boot.
echo "Launching splash screen (isolated)..."
chromium \
  --kiosk "$SPLASH_URL" \
  --user-data-dir="$SPLASH_PROFILE" \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --password-store=basic \
  --incognito \
  --allow-file-access-from-files \
  --disable-pinch \
  --overscroll-history-navigation=0 &

# Let the splash screen render its first frame and GIFs before the CPU work starts
sleep 4

# 5. Background Container Management
echo "Managing system containers..."
docker compose down --remove-orphans &> /dev/null
rm -rf frontend-service/.next

echo "Starting system services..."
docker compose up -d &> /dev/null

# 6. Smooth Handover Check
# We wait for the live app to respond before launching the final window
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

# 7. Seamless Window Switch
# Launch the REAL app (default profile). This window covers the splash screen instantly.
chromium \
  --kiosk "$URL" \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --password-store=basic \
  --incognito \
  --disable-pinch \
  --overscroll-history-navigation=0 &

# Give the main app enough time to load its CSS and images before closing the splash
sleep 5

# SILENTLY kill the isolated splash screen process in the background.
pkill -f "$SPLASH_PROFILE" &> /dev/null

echo "Kiosk is active. Enjoy!"