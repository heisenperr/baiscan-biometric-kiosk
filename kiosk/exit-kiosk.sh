#!/bin/bash
# exit-kiosk.sh
# Terminate all Chromium processes running in kiosk mode and stop Docker containers

echo "Looking for Chromium processes..."
PIDS=$(pgrep chromium)

if [ -z "$PIDS" ]; then
    echo "No Chromium processes found."
else
    echo "Killing Chromium processes: $PIDS"
    kill -9 $PIDS
    echo "Chromium terminated. Desktop should be accessible now."
fi

echo "Stopping Docker containers..."
# Navigate to the project root where docker-compose.yml is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"
docker compose down

echo "Kiosk completely exited."
