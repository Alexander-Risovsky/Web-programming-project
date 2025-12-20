"""
ASGI config for app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from pathlib import Path

from dotenv import load_dotenv

from django.core.asgi import get_asgi_application

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2].parent / ".env", override=False)
load_dotenv(override=False)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

application = get_asgi_application()
