FROM node:22-bullseye-slim

WORKDIR /app

# Принимаем переменную как ARG
ARG VITE_BACKEND_URL
# Превращаем в ENV, чтобы Vite её увидел
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Копируем package.json из frontend/
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем весь код frontend
COPY frontend/ .

# Собираем production build - Vite ТЕПЕРЬ видит VITE_BACKEND_URL
RUN npm run build

# Устанавливаем serve для production
RUN npm install -g serve

# Amvera ожидает порт 80
EXPOSE 80

# Запускаем на порту 80
CMD ["serve", "-s", "dist", "-l", "80"]
