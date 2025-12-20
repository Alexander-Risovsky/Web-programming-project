"""
WSGI config for app project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path

from dotenv import load_dotenv

from django.core.wsgi import get_wsgi_application

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2].parent / ".env", override=False)
load_dotenv(override=False)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

application = get_wsgi_application()
