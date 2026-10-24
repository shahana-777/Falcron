@echo off
echo ============================================================
echo   FALCRON MQTT Setup - Password and Broker Configuration
echo ============================================================
echo.

REM Check if mosquitto_passwd exists
where mosquitto_passwd >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] mosquitto_passwd not found in PATH.
    echo     Add "C:\Program Files\mosquitto" to your system PATH
    echo     OR run this from the Mosquitto install directory.
    echo.
    set MQTT_PASSWD="C:\Program Files\mosquitto\mosquitto_passwd"
) else (
    set MQTT_PASSWD=mosquitto_passwd
)

set PASSWD_FILE=C:\Users\shaha\Downloads\FALCRON\mqtt\passwd_file

echo [1/5] Creating password file...
echo.

REM Create password file with all users
REM -c creates new file, -b sets password non-interactively
echo Creating user: falcron_monitor (Python backend - reads all topics)
%MQTT_PASSWD% -c -b "%PASSWD_FILE%" falcron_monitor monitor123
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create falcron_monitor. Trying full path...
    "C:\Program Files\mosquitto\mosquitto_passwd" -c -b "%PASSWD_FILE%" falcron_monitor monitor123
)

echo Creating user: falcron_sensor (IoT devices - publishes sensor data)
%MQTT_PASSWD% -b "%PASSWD_FILE%" falcron_sensor sensor123

echo Creating user: falcron_admin (Full access)
%MQTT_PASSWD% -b "%PASSWD_FILE%" falcron_admin admin123

echo Creating user: falcron_tester (Labeeba - limited test access)
%MQTT_PASSWD% -b "%PASSWD_FILE%" falcron_tester tester123

echo.
echo [2/5] Password file created at: %PASSWD_FILE%
echo.
echo ============================================================
echo   Users Created:
echo   +-----------------+-------------+---------------------------+
echo   ^| Username        ^| Password    ^| Role                      ^|
echo   +-----------------+-------------+---------------------------+
echo   ^| falcron_monitor ^| monitor123  ^| Python backend (read all) ^|
echo   ^| falcron_sensor  ^| sensor123   ^| IoT devices (write only)  ^|
echo   ^| falcron_admin   ^| admin123    ^| Full access               ^|
echo   ^| falcron_tester  ^| tester123   ^| Attack testing only       ^|
echo   +-----------------+-------------+---------------------------+
echo ============================================================
echo.
echo [3/5] Config file: C:\Users\shaha\Downloads\FALCRON\mqtt\mosquitto.conf
echo [4/5] ACL file:    C:\Users\shaha\Downloads\FALCRON\mqtt\acl_file
echo.
echo ============================================================
echo   TO START MOSQUITTO WITH THIS CONFIG:
echo ============================================================
echo.
echo   Run this command in a NEW terminal (as Administrator):
echo.
echo   mosquitto -c "C:\Users\shaha\Downloads\FALCRON\mqtt\mosquitto.conf" -v
echo.
echo   OR if mosquitto is not in PATH:
echo.
echo   "C:\Program Files\mosquitto\mosquitto" -c "C:\Users\shaha\Downloads\FALCRON\mqtt\mosquitto.conf" -v
echo.
echo ============================================================
echo [5/5] Setup complete! 
echo ============================================================
pause
