#!/bin/sh
# One-time setup: turns this folder into a git repo and pushes it to GitHub.
# Usage (Mac/Linux): open a terminal in this folder and run:  sh setup-github.sh
set -e
cd "$(dirname "$0")"
REMOTE="https://github.com/mertJF/matteflux.git"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is not installed. Get it from https://git-scm.com/downloads and run this again."
  exit 1
fi

if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
  echo "Git needs your name and email for commits (one time only)."
  printf "Name: ";  read NAME
  printf "Email (the one on your GitHub account): "; read EMAIL
  git config --global user.name "$NAME"
  git config --global user.email "$EMAIL"
fi

[ -d .git ] || git init -q
git add .
git diff --cached --quiet || git commit -q -m "Site, Set 01 and production tools"
git branch -M main
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$REMOTE"

echo "Pushing to $REMOTE ..."
echo "If a browser window or login prompt opens, sign in to GitHub there."
git push -u origin main
echo "Done. Your code is on GitHub."
