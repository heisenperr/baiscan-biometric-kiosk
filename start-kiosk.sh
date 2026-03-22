#!/bin/bash

# 1. Configuration & Path
cd /home/raspi/Desktop/baiscan-biometric-kiosk

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
rm -rf .next

# 3. Start containers
# Docker Compose will now pick up the $ALLOWED_HOST variable
echo "Starting containers..."
docker compose up -d

# 4. Wait until containers are running
echo "Waiting for containers to initialize..."
while true; do
    CONTAINERS=$(docker compose ps -q)
    if [ -z "$CONTAINERS" ]; then
        echo "No containers found. Exiting."
        exit 1
    fi

    RUNNING=$(docker inspect -f '{{.State.Status}}' $CONTAINERS | grep -c "running")
    TOTAL=$(echo "$CONTAINERS" | wc -l)

    if [ "$RUNNING" -eq "$TOTAL" ]; then
        echo "All containers running ($RUNNING/$TOTAL)."
        break
    else
        echo "Waiting for services... ($RUNNING/$TOTAL)"
        sleep 2
    fi
done

# 5. Wait until frontend responds (prevents Chromium from showing 'Site not found')
echo "Waiting for frontend at $URL ..."
while true; do
    # Check if the server is returning a 200 OK
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

    if [ "$STATUS" = "200" ]; then
        echo "Frontend is ready!"
        break
    else
        echo "Frontend status: $STATUS (Still compiling...)"
        sleep 3
    fi
done

echo "Launching kiosk..."

# 6. Launch Chromium in clean kiosk mode
# Added --disable-features=Translate to prevent the translate bubble
# Added --no-first-run to skip welcome screens
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