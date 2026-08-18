@echo off
chcp 65001 >nul
title 國小校務教學行政與鐘點代課整合系統
echo ========================================================
echo   國小校務教學行政與鐘點代課整合系統
echo   Modular School Administrative Suite v2.0
echo ========================================================
echo.
echo 正在為您啟動系統...
echo.

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start py app.py
    exit
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start python app.py
    exit
)

echo 找不到 Python 環境，將直接透過瀏覽器開啟 index.html...
start "" "%~dp0index.html"
exit
