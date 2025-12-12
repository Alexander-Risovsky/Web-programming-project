FROM python:3.12-bookworm

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc python3-dev libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем Python зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем приложение
COPY backend/ .

# Собираем статические файлы
RUN python manage.py collectstatic --noinput --clear

# Порт для Amvera
EXPOSE 8000

# Production запуск: миграции + gunicorn
CMD python manage.py migrate --noinput && \
    gunicorn app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
