#!/bin/bash

# Load commit message from user input or use a default one
read -p "Enter commit message: " MESSAGE
if [ -z "$MESSAGE" ]; then
  MESSAGE="chore: automatic update"
fi

# Add changes and commit locally
git add .
git commit -m "$MESSAGE"

# Show the status of the local branch vs remote
echo "----------------------------------------"
echo "Commit created locally: $MESSAGE"
echo "----------------------------------------"

# Ask for confirmation before pushing
read -p "Do you want to push to origin? (y/n): " CONFIRM

if [[ "$CONFIRM" == "y" || "$CONFIRM" == "Y" ]]; then
  git push origin
  echo "✅ Push successful!"
else
  echo "❌ Push canceled. Your changes are committed locally."
fi
