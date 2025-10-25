@echo off
echo Building Personnel Tracker APK...

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install JDK 17 and set JAVA_HOME
    pause
    exit /b 1
)

REM Check if Android SDK is available
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME is not set
    echo Please install Android Studio and set ANDROID_HOME
    pause
    exit /b 1
)

echo Java version:
java -version

echo.
echo Android SDK location: %ANDROID_HOME%

REM Navigate to android directory
cd android

echo.
echo Cleaning project...
call gradlew clean

echo.
echo Building debug APK...
call gradlew assembleDebug

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS! APK created at:
    echo app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo To install on device:
    echo adb install app\build\outputs\apk\debug\app-debug.apk
) else (
    echo.
    echo ERROR: Build failed
    echo Check the error messages above
)

pause
