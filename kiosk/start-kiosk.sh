#!/bin/bash

# 1. Configuration & Path
# Move to the project root (assumed to be one level up from this script in 'kiosk/')
# Or if this script is in the root, stay here.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.." || cd "$SCRIPT_DIR"

# 2. Get the real IP of the Raspberry Pi immediately
# This ensures Next.js knows which origin to allow
export ALLOWED_HOST=$(hostname -I | awk '{print $1}')
URL="http://$ALLOWED_HOST"

echo "------------------------------------------"
echo "Detected IP: $ALLOWED_HOST"
echo "Target URL:  $URL"
echo "------------------------------------------"

echo "Cleaning previous state..."

# Kill any existing Chromium instances to prevent "Session Crashed" popups
pkill -f chromium

# Stop containers and remove orphans
docker compose down --remove-orphans

# CRITICAL: Fix for "OS Error 22" and "Write Batch" errors
# Deleting the cache ensures Next.js starts with a clean slate
echo "Clearing Next.js build cache..."
rm -rf frontend-service/.next

# 3. Start containers
# Docker Compose will now pick up the $ALLOWED_HOST variable
echo "Starting containers..."
docker compose up -d

# 4. Launch Splash Screen
# This gives the user something to look at while the containers warm up
echo "Launching splash screen..."
WORKING_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$WORKING_DIR/start-kiosk.html" ]; then
    SPLASH_URL="file://$WORKING_DIR/start-kiosk.html"
elif [ -f "$WORKING_DIR/../start-kiosk.html" ]; then
    SPLASH_URL="file://$WORKING_DIR/../start-kiosk.html"
else
    SPLASH_URL="$URL"
fi

# Launch Chromium with splash screen in background
# We save the PID if possible, but pkill is safer for Chromium's multi-process model
chromium \
  --kiosk "$SPLASH_URL" \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --disable-features=Translate \
  --password-store=basic \
  --incognito \
  --allow-file-access-from-files \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0 &

# 5. Wait until frontend responds
echo "Waiting for frontend at $URL ..."
while true; do
    # Check if the server is returning a 200 OK
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

    if [ "$STATUS" = "200" ]; then
        echo "Frontend is ready! Transitioning from splash screen..."
        break
    else
        echo "Frontend status: $STATUS (Still compiling...)"
        sleep 3
    fi
done

# 6. Final Launch
# Kill the splash screen browser and launch the final app
# A brief 1s sleep ensures the port is fully released if necessary
pkill -f chromium
sleep 1

echo "Launching kiosk mode..."
chromium \
  --kiosk "$URL" \
  --no-first-run \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --disable-features=Translate \
  --password-store=basic \
  --incognito \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0