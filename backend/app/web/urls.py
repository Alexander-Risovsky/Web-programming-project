from django.urls import path, include
from rest_framework.routers import DefaultRouter

from web.views import EventViewSet, PostViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
]