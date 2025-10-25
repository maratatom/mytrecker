# Настройка Android для сборки APK

## Предварительные требования

### 1. Установка Java Development Kit (JDK)

**Скачайте и установите JDK 17:**
- Перейдите на https://adoptium.net/
- Скачайте JDK 17 для Windows
- Установите в папку по умолчанию (обычно `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot\`)

**Настройте переменные окружения:**
```bash
# Добавьте в переменные окружения:
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
PATH=%JAVA_HOME%\bin;%PATH%
```

### 2. Установка Android Studio

**Скачайте и установите Android Studio:**
- Перейдите на https://developer.android.com/studio
- Скачайте Android Studio для Windows
- Установите с настройками по умолчанию

**Настройте Android SDK:**
1. Откройте Android Studio
2. Перейдите в File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Установите:
   - Android SDK Platform 33 (или новее)
   - Android SDK Build-Tools 33.0.0 (или новее)
   - Android SDK Platform-Tools
   - Android SDK Tools

**Настройте переменные окружения:**
```bash
# Добавьте в переменные окружения:
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%
```

### 3. Проверка установки

Откройте новое окно PowerShell и выполните:
```bash
java -version
javac -version
adb version
```

## Сборка APK

### 1. Очистка проекта
```bash
cd PersonnelTracker
cd android
./gradlew clean
```

### 2. Сборка Debug APK
```bash
./gradlew assembleDebug
```

APK файл будет создан в: `app/build/outputs/apk/debug/app-debug.apk`

### 3. Сборка Release APK (для публикации)

**Создание ключа подписи:**
```bash
keytool -genkey -v -keystore personnel-tracker-key.keystore -alias personnel-tracker -keyalg RSA -keysize 2048 -validity 10000
```

**Настройка gradle.properties:**
```bash
# Добавьте в android/gradle.properties:
MYAPP_RELEASE_STORE_FILE=personnel-tracker-key.keystore
MYAPP_RELEASE_KEY_ALIAS=personnel-tracker
MYAPP_RELEASE_STORE_PASSWORD=your-store-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

**Сборка Release APK:**
```bash
./gradlew assembleRelease
```

## Установка APK на устройство

### Через ADB (Android Debug Bridge):
```bash
# Подключите устройство по USB
# Включите "Отладка по USB" в настройках разработчика
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Через файловый менеджер:
1. Скопируйте APK файл на устройство
2. Откройте файл на устройстве
3. Разрешите установку из неизвестных источников
4. Установите приложение

## Альтернативный способ - Expo

Если возникают проблемы с настройкой Android SDK, можно использовать Expo:

```bash
# Установка Expo CLI
npm install -g @expo/cli

# Создание Expo проекта
npx create-expo-app PersonnelTrackerExpo --template blank-typescript

# Установка зависимостей
cd PersonnelTrackerExpo
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios @react-native-async-storage/async-storage

# Запуск
npx expo start

# Сборка APK
npx expo build:android
```

## Устранение проблем

### Ошибка "JAVA_HOME is not set"
- Убедитесь, что JDK установлен
- Проверьте переменные окружения
- Перезапустите PowerShell

### Ошибка "Android SDK not found"
- Убедитесь, что Android Studio установлен
- Проверьте переменную ANDROID_HOME
- Убедитесь, что SDK установлен через Android Studio

### Ошибка "Gradle build failed"
- Очистите проект: `./gradlew clean`
- Удалите папку `.gradle` в проекте
- Попробуйте снова: `./gradlew assembleDebug`

### Проблемы с эмулятором
- Убедитесь, что эмулятор запущен
- Проверьте, что устройство подключено: `adb devices`
- Перезапустите Metro: `npx react-native start --reset-cache`
