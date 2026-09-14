@echo off
setlocal enabledelayedexpansion
title Visual Block Annotator Studio
echo ======================================================================
echo           VISUAL BLOCK ANNOTATOR STUDIO (PORTABLE)
echo ======================================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run this studio.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: Read CLI arguments or prompt
set "INPUT_DIR=%~1"
set "OUTPUT_DIR=%~2"

if "%INPUT_DIR%"=="" (
    set "INPUT_DIR=../../inputs/vision"
    if not exist "!INPUT_DIR!" (
        set "INPUT_DIR=./inputs"
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
echo Launching Visual Annotator Studio in your default browser...
echo Press Ctrl+C in this window when you want to stop the server.
echo.

:: Auto-open the browser after a brief delay
start "" http://localhost:%PORT%

:: Start the standalone Node server
node server.mjs --input "%INPUT_DIR%" --output "%OUTPUT_DIR%" --port %PORT%

pause
