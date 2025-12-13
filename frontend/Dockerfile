FROM node:22-bullseye-slim

WORKDIR /app

COPY frontend/package*.json ./


RUN npm install --legacy-peer-deps


COPY frontend/ .


RUN npm run build


RUN npm install -g serve


EXPOSE 80


CMD ["serve", "-s", "dist", "-l", "80"]
