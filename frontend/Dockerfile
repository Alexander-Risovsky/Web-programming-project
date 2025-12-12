FROM node:22-bullseye-slim

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем остальной фронт
COPY . .

# Собираем production build
RUN npm run build

# Устанавливаем serve для production
RUN npm install -g serve

# Amvera ожидает порт 80
EXPOSE 80

# Запускаем на порту 80
CMD ["serve", "-s", "dist", "-l", "80"]
