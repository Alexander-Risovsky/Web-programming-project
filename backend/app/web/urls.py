from django.urls import include, path
from rest_framework.routers import DefaultRouter

from web.views import (
    ClubViewSet,
    FormViewSet,
    PostViewSet,
    RegistrationViewSet,
    SubscriptionViewSet,
)

router = DefaultRouter()
router.register(r"clubs", ClubViewSet, basename="club")
router.register(r"forms", FormViewSet, basename="form")
router.register(r"posts", PostViewSet, basename="post")
router.register(r"registrations", RegistrationViewSet, basename="registration")
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")

urlpatterns = [
    path("", include(router.urls)),
]