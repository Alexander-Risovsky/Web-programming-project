FROM node:22-bullseye-slim

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ .
RUN npm run build

RUN npm install -g serve

# Amvera ожидает порт 80
EXPOSE 80

# Запускаем на порту 80
CMD ["serve", "-s", "dist", "-l", "80"]