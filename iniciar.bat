
@echo off
setlocal EnableExtensions
title KFKA - Inicializador
cd /d "%~dp0"

set "BACKEND=%~dp0src\FullStack\Backend"
set "FRONTEND=%~dp0src\FullStack\Frontend"

echo ==========================================
echo             INICIANDO KFKA
echo ==========================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale o Node.js e tente novamente.
    goto erro
)

:: Verificar npm
where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado.
    goto erro
)

:: Verificar pastas do projeto
if not exist "%BACKEND%\package.json" (
    echo [ERRO] Pasta do backend nao encontrada.
    goto erro
)

if not exist "%FRONTEND%\package.json" (
    echo [ERRO] Pasta do frontend nao encontrada.
    goto erro
)

:: Verificar configuracao do backend
if not exist "%BACKEND%\.env" (
    echo [ERRO] Arquivo .env nao encontrado.
    echo Configure o .env do backend primeiro.
    goto erro
)

:: Instalar/verificar dependencias
echo [1/4] Verificando dependencias do backend...
pushd "%BACKEND%"
call npm ci
if errorlevel 1 (
    popd
    echo [ERRO] Falha nas dependencias do backend.
    goto erro
)
popd

echo.
echo [2/4] Verificando dependencias do frontend...
pushd "%FRONTEND%"
call npm ci
if errorlevel 1 (
    popd
    echo [ERRO] Falha nas dependencias do frontend.
    goto erro
)
popd

:: Iniciar servidores
echo.
echo [3/4] Iniciando backend...
start "KFKA - Backend" /D "%BACKEND%" cmd /k "npm start"

echo [4/4] Iniciando frontend...
start "KFKA - Frontend" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

:: Aguardar frontend responder
echo.
echo Aguardando o frontend ficar disponivel...

powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){try{$r=Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){$ok=$true;break}}catch{};Start-Sleep -Seconds 1};if(-not $ok){exit 1}"

if errorlevel 1 (
    echo [AVISO] Frontend nao respondeu na porta 5173.
    echo Confira a janela KFKA - Frontend.
    goto fim
)

echo.
echo Abrindo KFKA no navegador...
start "" "http://127.0.0.1:5173"

:fim
echo.
echo ==========================================
echo Inicializacao concluida.
echo Mantenha os servidores abertos.
echo ==========================================
echo.
pause
exit /b 0

:erro
echo.
echo Inicializacao interrompida.
pause
exit /b 1
