@echo off
echo Starting F-QUEST Backend...
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
npm run dev