FROM node:22-bullseye-slim

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ .
RUN npm run build

RUN npm install -g serve

# Копируем скрипт
COPY frontend/env.sh /app/env.sh
RUN chmod +x /app/env.sh

EXPOSE 80

# Запускаем скрипт, который заменит переменные и запустит serve
CMD ["/app/env.sh"]