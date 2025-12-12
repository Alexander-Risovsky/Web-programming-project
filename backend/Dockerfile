FROM python:3.12-bookworm

WORKDIR /app

# Установка PostgreSQL 16 клиента (только версия 16!)
RUN apt-get update && \
    apt-get install -y wget gnupg lsb-release gcc build-essential python3-dev && \
    echo "deb http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main 16" > /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg && \
    sed -i 's/deb /deb [signed-by=\/usr\/share\/keyrings\/postgresql-keyring.gpg] /' /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && \
    apt-get install -y postgresql-client-16 libpq-dev=16* libpq5=16* && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend проект
COPY ./app ./app

# Переключаемся в папку с manage.py
WORKDIR /app/app

EXPOSE 8000

# Запуск Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
