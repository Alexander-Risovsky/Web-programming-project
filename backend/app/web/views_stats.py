from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from web.models import Club, Post


class PlatformStatsView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        User = get_user_model()
        data = {
            "clubs": Club.objects.count(),
            "posts": Post.objects.count(),
            "events": Post.objects.filter(Q(type="event") | Q(is_form=True)).count(),
            "users": User.objects.count(),
        }
        return Response(data)
