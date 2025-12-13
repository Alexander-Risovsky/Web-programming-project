#!/bin/sh
# Заменяем плейсхолдер на реальное значение во всех JS файлах
find /app/dist/assets -type f -name "*.js" -exec sed -i "s|__VITE_BACKEND_URL__|${VITE_BACKEND_URL}|g" {} \;
exec serve -s /app/dist -l 80
