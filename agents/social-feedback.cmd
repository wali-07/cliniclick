@echo off
REM CliniClick feedback watcher - run by Windows Task Scheduler every
REM ~20 min through the day. Reads Abdullah's Telegram replies (free
REM getUpdates), auto-handles approve/skip, captures change requests.
cd /d "C:\Users\Abdullah Wali - SM\Documents\Personal\CliniClick"
call npx tsx agents/social-feedback.ts >> "social-crawl\feedback.log" 2>&1
