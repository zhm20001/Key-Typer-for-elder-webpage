@echo off
chcp 437 >nul
title KeyMacro Server
echo ============================================
echo    KeyMacro Formula Macro Generator
echo ============================================
echo.
echo Starting local server...
echo Please open in browser: http://localhost:3000
echo Press Ctrl+C to stop server
echo.
echo ============================================

cd /d "%~dp0"
node "%~dp0server.js"
