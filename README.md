# Smart Home System

Система розумного дому з веб-інтерфейсом для керування освітленням, вікнами та моніторингу датчиків.

## Технології

### Фронтенд
- React
- CSS для стилізації
- Axios для HTTP запитів

### Бекенд
- Node.js
- Express
- Axios для комунікації з ESP8266

### Апаратна частина
- ESP8266
- DHT22 (температура та вологість)
- PIR (датчик руху)
- Реле для керування освітленням
- Сервопривід для керування вікнами

## Структура проекту

```
smart-home/
├── client/                 # React фронтенд
│   ├── src/
│   │   ├── components/    # React компоненти
│   │   └── ...
│   └── package.json
├── server/                # Node.js бекенд
│   ├── index.js          # Головний файл сервера
│   └── package.json
└── README.md
```

## Налаштування проекту

### Попередні вимоги
- Node.js >= 14.0.0
- npm або yarn
- ESP8266 з налаштованим Wi-Fi з'єднанням

### Встановлення

1. Клонуйте репозиторій:
```bash
git clone https://github.com/your-username/smart-home.git
cd smart-home
```

2. Встановіть залежності для сервера:
```bash
cd server
npm install
```

3. Встановіть залежності для клієнта:
```bash
cd ../client
npm install
```

4. Створіть файл `.env` в папці server:
```
PORT=3001
FRONTEND_URL=http://localhost:3000
ESP_IP=your_esp8266_ip
ESP_PORT=80
```

### Запуск проекту локально

1. Запустіть сервер:
```bash
cd server
npm run dev
```

2. Запустіть клієнт:
```bash
cd client
npm start
```

## Деплой

Проект налаштований для деплою на Render.com:

1. Створіть акаунт на Render.com
2. Підключіть GitHub репозиторій
3. Налаштуйте змінні середовища в Render Dashboard
4. Задеплойте проект

## API Endpoints

### Сервер
- `GET /api/sensor-data` - отримання даних з датчиків
- `POST /api/control` - керування пристроями

### ESP8266
- `GET /sensor-data` - отримання даних з датчиків
- `POST /control` - керування пристроями

## Ліцензія

MIT 