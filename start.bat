@echo off
REM CV Analyzer - Quick Start for Windows

echo.
echo  ^^ CV Analyzer - Quick Start
echo  ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js n'est pas installe
    echo   Telechargez-le sur : https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK Node.js detecte : %NODE_VERSION%
echo.

REM Check if .env exists
if not exist ".env" (
    echo !! Fichier .env non trouve
    echo   Creation du fichier .env...
    copy .env.example .env > nul
    echo.
    echo ** IMPORTANT : Editez .env et ajoutez votre cle API Anthropic
    echo    Vous pouvez l'obtenir gratuitement sur : https://console.anthropic.com/
    echo.
    pause
)

REM Install dependencies
echo.
echo ^> Installation des dependances...
call npm install --silent

echo.
echo OK Installation completee!
echo.
echo ^> Demarrage du serveur...
echo.
echo    Application disponible sur : http://localhost:3000
echo.
echo Tips :
echo   - Ouvrez http://localhost:3000 dans votre navigateur
echo   - Creez d'abord une offre d'emploi
echo   - Puis chargez des CVs pour les analyser
echo.

call npm start

pause
