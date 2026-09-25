@echo off
title KFKA - Plataforma de Acompanhamento Escolar

echo ==========================================
echo          INICIANDO O KFKA
echo ==========================================
echo.

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao foi encontrado.
    echo Instale o Node.js para executar o projeto.
    pause
    exit
)

if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Iniciando a plataforma KFKA...
echo.

start "" http://localhost:5173
call npm run dev

pause