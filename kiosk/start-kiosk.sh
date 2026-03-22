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
echo "Launching the flash screen (for debug only)"
echo "------------------------------------------"

# Ensure Chromium launches on the primary display
export DISPLAY=:0

# CRITICAL: Kill any STALE instances before starting the new flash screen
echo "Cleaning existing browser sessions..."
pkill -f chromium || true
sleep 1

# 3. Launch NEW Splash Screen Immediately
# This gives the user something to look at while the Docker cleanup and containers warm up
echo "Launching splash screen..."

# Determine the absolute path to the HTML splash screen
# We check the directory of this script, and then the parent just in case.
SCRIPT_PATH="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

if [ -f "$SCRIPT_DIR/start-kiosk.html" ]; then
    ABS_SPLASH_PATH="$SCRIPT_DIR/start-kiosk.html"
elif [ -f "$SCRIPT_DIR/../start-kiosk.html" ]; then
    ABS_SPLASH_PATH="$(readlink -f "$SCRIPT_DIR/../start-kiosk.html")"
else
    ABS_SPLASH_PATH=""
fi

if [ -n "$ABS_SPLASH_PATH" ]; then
    SPLASH_URL="file://$ABS_SPLASH_PATH"
    echo "Found splash screen at: $SPLASH_URL"
else
    echo "WARNING: Splash screen file not found. Falling back to default URL check."
    SPLASH_URL="$URL"
fi

# Launch Chromium with splash screen in background
# Triple slash file:/// is standard for Linux absolute paths
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

# Give Chromium a few seconds to fully initialize and display the GIFs 
# before we start the heavy lifting (docker compose down, etc.)
echo "Waiting for splash screen to initialize..."
sleep 5

echo "Cleaning previous state..."

# Stop containers and remove orphans (Don't kill chromium again here)
docker compose down --remove-orphans

# CRITICAL: Fix for "OS Error 22" and "Write Batch" errors
# Deleting the cache ensures Next.js starts with a clean slate
echo "Clearing Next.js build cache..."
rm -rf frontend-service/.next

# 4. Start containers
# Docker Compose will now pick up the $ALLOWED_HOST variable
echo "Starting containers..."
docker compose up -d

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