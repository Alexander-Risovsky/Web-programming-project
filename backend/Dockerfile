FROM python:3.12-bookworm

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc python3-dev libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем requirements из КОРНЯ проекта (где amvera.yml)
# Копируем requirements из КОРНЯ проекта (где amvera.yml)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем папку app из backend/
COPY backend/app/ ./app/
# Копируем папку app из backend/
COPY backend/app/ ./app/

# Переключаемся в папку с manage.py
WORKDIR /app/app

RUN python manage.py collectstatic --noinput --clear || echo "Collectstatic skipped"

EXPOSE 8000

CMD python manage.py migrate --noinput && \
    gunicorn app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
