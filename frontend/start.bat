@echo off
echo Starting F-QUEST Frontend...
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
npm run dev