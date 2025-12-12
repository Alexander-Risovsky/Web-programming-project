FROM python:3.12-bookworm

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc python3-dev libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем requirements (он на уровне с Dockerfile)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всю папку app/
COPY app/ ./app/

# Переключаемся в папку с manage.py
WORKDIR /app/app

# Теперь collectstatic найдёт manage.py
RUN python manage.py collectstatic --noinput --clear || echo "Collectstatic skipped"

# Порт для Amvera
EXPOSE 8000

# Production запуск
CMD python manage.py migrate --noinput && \
    gunicorn app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
