# Personnel Tracker - Мобильное приложение

Мобильное приложение для учета времени прибытия и убытия персонала, созданное с помощью React Native.

## 📱 Функциональность

- 🔐 **Аутентификация** - Вход по паролю
- 👥 **Управление персоналом** - Просмотр списка сотрудников
- ➕ **Добавление персонала** - Создание новых профилей
- ⏰ **Учет времени** - Отметка прибытия/убытия с замечаниями
- 📱 **Мобильный интерфейс** - Адаптивный дизайн для Android

## 🚀 Быстрый старт

### Предварительные требования

1. **Node.js** (версия 16 или выше)
2. **Java Development Kit (JDK) 17**
3. **Android Studio** с Android SDK
4. **Android устройство** или эмулятор

### Установка

1. **Клонирование репозитория:**
```bash
git clone https://github.com/maratatom/mytrecker.git
cd mytrecker/PersonnelTracker
```

2. **Установка зависимостей:**
```bash
npm install
```

3. **Настройка Android SDK:**
   - Установите Android Studio
   - Настройте переменные окружения (см. ANDROID_SETUP.md)
   - Убедитесь, что эмулятор запущен или устройство подключено

### Запуск приложения

1. **Запуск Metro сервера:**
```bash
npx react-native start
```

2. **Запуск на Android (в новом терминале):**
```bash
npx react-native run-android
```

## 📦 Сборка APK

### Автоматическая сборка (Windows):
```bash
# Запустите скрипт сборки
build-apk.bat
```

### Ручная сборка:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

APK файл будет создан в: `android/app/build/outputs/apk/debug/app-debug.apk`

### Установка APK на устройство:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🏗️ Архитектура приложения

```
PersonnelTracker/
├── src/
│   ├── screens/           # Экраны приложения
│   │   ├── LoginScreen.tsx
│   │   ├── PersonnelListScreen.tsx
│   │   ├── TimeTrackingScreen.tsx
│   │   └── AddPersonnelScreen.tsx
│   ├── navigation/         # Навигация
│   │   └── AppNavigator.tsx
│   └── assets/            # Ресурсы
├── android/               # Android конфигурация
├── App.tsx               # Главный компонент
└── package.json         # Зависимости
```

## 🔧 Настройка сервера

Приложение подключается к серверу по адресу `http://10.0.2.2:5000` (для Android эмулятора).

**Для реального устройства измените URL в файлах:**
- `src/screens/LoginScreen.tsx`
- `src/screens/PersonnelListScreen.tsx`
- `src/screens/TimeTrackingScreen.tsx`
- `src/screens/AddPersonnelScreen.tsx`

Замените `http://10.0.2.2:5000` на IP адрес вашего сервера.

## 📱 Экраны приложения

### 1. Экран входа
- Ввод пароля для доступа к приложению
- Автоматическое сохранение сессии

### 2. Список персонала
- Отображение всех сотрудников
- Возможность добавления новых
- Переход к учету времени

### 3. Учет времени
- Отметка прибытия/убытия
- Добавление замечаний
- Отображение текущего статуса

### 4. Добавление персонала
- Создание нового профиля сотрудника
- Ввод имени, должности и описания

## 🛠️ Разработка

### Структура проекта:
- **React Native 0.82.1** - Основной фреймворк
- **TypeScript** - Типизация
- **React Navigation** - Навигация между экранами
- **Axios** - HTTP запросы к серверу
- **AsyncStorage** - Локальное хранение данных

### Основные зависимости:
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/stack": "^6.x",
  "react-native-screens": "^3.x",
  "react-native-safe-area-context": "^4.x",
  "axios": "^1.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "moment": "^2.x"
}
```

## 🚀 Развертывание

### 1. Подготовка к релизу:
```bash
# Создание ключа подписи
keytool -genkey -v -keystore personnel-tracker-key.keystore -alias personnel-tracker -keyalg RSA -keysize 2048 -validity 10000

# Настройка gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=personnel-tracker-key.keystore" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_ALIAS=personnel-tracker" >> android/gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=your-password" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=your-password" >> android/gradle.properties
```

### 2. Сборка релизной версии:
```bash
cd android
./gradlew assembleRelease
```

### 3. Установка на устройства:
- Скопируйте APK файл на устройство
- Разрешите установку из неизвестных источников
- Установите приложение

## 🔍 Отладка

### Просмотр логов:
```bash
# Логи React Native
npx react-native log-android

# Логи ADB
adb logcat
```

### Очистка кэша:
```bash
npx react-native start --reset-cache
```

### Переустановка приложения:
```bash
adb uninstall com.personneltracker
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Чек-лист для публикации

- [ ] Приложение протестировано на реальном устройстве
- [ ] Все функции работают корректно
- [ ] Сервер настроен и доступен
- [ ] APK подписан и готов к установке
- [ ] Документация обновлена

## 🆘 Устранение проблем

### Частые ошибки:

1. **"JAVA_HOME is not set"**
   - Установите JDK 17
   - Настройте переменную JAVA_HOME

2. **"Android SDK not found"**
   - Установите Android Studio
   - Настройте переменную ANDROID_HOME

3. **"Metro bundler not found"**
   - Запустите `npx react-native start`
   - Очистите кэш: `npx react-native start --reset-cache`

4. **"Device not found"**
   - Включите отладку по USB
   - Проверьте подключение: `adb devices`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `npx react-native log-android`
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки Android SDK
4. Очистите кэш и перезапустите проект

---

**Версия:** 1.0.0  
**Платформа:** Android  
**Минимальная версия Android:** 6.0 (API 23)