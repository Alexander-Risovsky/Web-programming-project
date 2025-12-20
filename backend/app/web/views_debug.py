import os
import importlib.util

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class StorageDebugView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        if not getattr(settings, "DEBUG", False):
            return Response({"detail": "Not found"}, status=404)

        return Response(
            {
                "USE_S3": bool(getattr(settings, "USE_S3", False)),
                "default_storage": f"{default_storage.__class__.__module__}.{default_storage.__class__.__name__}",
                "settings_module": os.getenv("DJANGO_SETTINGS_MODULE"),
                "storages_available": bool(importlib.util.find_spec("storages")),
                "boto3_available": bool(importlib.util.find_spec("boto3")),
                "bucket": getattr(settings, "AWS_STORAGE_BUCKET_NAME", None),
                "endpoint": getattr(settings, "AWS_S3_ENDPOINT_URL", None),
                "addressing_style": getattr(settings, "AWS_S3_ADDRESSING_STYLE", None),
                "region": getattr(settings, "AWS_S3_REGION_NAME", None),
                "querystring_auth": bool(getattr(settings, "AWS_QUERYSTRING_AUTH", True)),
                "has_access_key": bool(os.getenv("S3_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")),
                "has_secret_key": bool(os.getenv("S3_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")),
            }
        )

    def post(self, request):
        if not getattr(settings, "DEBUG", False):
            return Response({"detail": "Not found"}, status=404)

        try:
            key = default_storage.save(
                "debug/storage_test.txt",
                ContentFile(b"ok"),
            )
            url = None
            try:
                url = default_storage.url(key)
            except Exception:
                url = None
            return Response({"saved_key": key, "url": url})
        except Exception as exc:
            return Response({"detail": str(exc)}, status=500)
