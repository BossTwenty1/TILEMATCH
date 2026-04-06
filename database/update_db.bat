@echo off
SETLOCAL enabledelayedexpansion

:: 1. Check if 'mysql' is already in the System PATH
where mysql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] MySQL found in System PATH. Launching...
    mysql -u root -p
) else (
    echo [WARN] MySQL not found in PATH. Checking default install directory...

    :: 2. Set conf variables
    set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"
    set "PW=admin"

    :: 3. Check if mysql.exe exists then run update
    if exist "!MYSQL_PATH!" (
        echo [INFO] Found MySQL at: !MYSQL_PATH!
        echo Updating TileMatch database...
        "!MYSQL_PATH!" -u root -p"!PW!" tilematch_db < tilematch_update.sql
    ) else (
        echo "!MYSQL_PATH!"
        echo [ERROR] MySQL could not be found in PATH or at the default location.
        echo Please verify your installation path and update this script.
        pause
    )
)
ENDLOCAL