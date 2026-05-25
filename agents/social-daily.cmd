@echo off
REM CliniClick daily social sender - run by Windows Task Scheduler at
REM 08:00 local. Sends that day's FINISHED post to Telegram for Abdullah
REM to approve + post. $0: no Claude model in the loop. Log is gitignored.
cd /d "C:\Users\Abdullah Wali - SM\Documents\Personal\CliniClick"
REM --ahead=1: send TOMORROW's post today, so it is reviewed + finalised
REM the day before its posting day (Abdullah's day-before model).
call npx tsx agents/social-send-day.ts --ahead=1 >> "social-crawl\daily-send.log" 2>&1
