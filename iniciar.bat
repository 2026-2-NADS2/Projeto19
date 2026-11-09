
@echo off
setlocal
title KFKA - Inicializador
cd /d "%~dp0"

echo =========================================
echo          INICIANDO O KFKA
echo =========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado.
    echo Instale o Node.js antes de continuar.
    pause
    exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado.
    pause
    exit /b 1
)

set "BACKEND=%~dp0src\FullStack\Backend"
set "FRONTEND=%~dp0src\FullStack\Frontend"

if not exist "%BACKEND%\package.json" (
    echo ERRO: Backend nao encontrado.
    pause
    exit /b 1
)

if not exist "%FRONTEND%\package.json" (
    echo ERRO: Frontend nao encontrado.
    pause
    exit /b 1
)

if not exist "%BACKEND%\.env" (
    echo ERRO: Arquivo .env do backend nao encontrado.
    echo Configure o banco de dados antes de iniciar.
    pause
    exit /b 1
)

echo Verificando dependencias do backend...
if not exist "%BACKEND%\node_modules\" (
    pushd "%BACKEND%"
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias do backend.
        pause
        exit /b 1
    )
    popd
)

echo Verificando dependencias do frontend...
if not exist "%FRONTEND%\node_modules\" (
    pushd "%FRONTEND%"
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias do frontend.
        pause
        exit /b 1
    )
    popd
)

echo.
echo Iniciando backend...
start "KFKA - Backend" /D "%BACKEND%" cmd /k "npm start"

echo Iniciando frontend...
start "KFKA - Frontend" /D "%FRONTEND%" cmd /k "npm run dev"

echo.
echo Aguardando inicializacao...
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

echo.
echo KFKA iniciado!
echo Mantenha as janelas dos servidores abertas.
echo.
pause
