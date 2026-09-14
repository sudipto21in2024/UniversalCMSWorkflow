@echo off
setlocal enabledelayedexpansion
title Universal Visual Annotator Studio
echo ======================================================================
echo           UNIVERSAL VISUAL BLOCK ANNOTATOR STUDIO
echo ======================================================================
echo.
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run this studio.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

set "INPUT_DIR=%~1"
set "OUTPUT_DIR=%~2"

if "%INPUT_DIR%"=="" (
    set "INPUT_DIR=inputs/vision"
    if not exist "!INPUT_DIR!" (
        set "INPUT_DIR=tools/visual-annotator/inputs"
    )
)

if "%OUTPUT_DIR%"=="" (
    set "OUTPUT_DIR=%INPUT_DIR%"
)

set PORT=4040

echo Configuration:
echo   - Input Directory:  %INPUT_DIR%
echo   - Output Directory: %OUTPUT_DIR%
echo   - Web Studio Port:  http://localhost:%PORT%
echo.
echo Launching Universal Annotator Studio in your default browser...
echo Press Ctrl+C in this window when you want to stop the server.
echo.
start "" http://localhost:%PORT%
node tools/visual-annotator/server.mjs --input "%INPUT_DIR%" --output "%OUTPUT_DIR%" --port %PORT%
pause