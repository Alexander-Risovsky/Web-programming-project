FROM python:3.12-bookworm

WORKDIR /app

# Минимальные зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc python3-dev libpq-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
