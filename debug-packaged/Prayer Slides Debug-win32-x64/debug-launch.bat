@echo off
title Prayer Slides Debug
echo Starting Prayer Slides in debug mode...
echo.
echo This will show detailed console output to help diagnose issues.
echo.
"Prayer Slides Debug.exe" --enable-logging --log-level=0 --disable-web-security --remote-debugging-port=9222
echo.
echo App closed. Press any key to exit.
pause