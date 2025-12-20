from django.urls import include, path
from rest_framework.routers import DefaultRouter

from users.views import ClubViewSet, StudentViewSet

try:
    from web.views_debug import StorageDebugView
except Exception:
    StorageDebugView = None
from web.views import (
    FormViewSet,
    NotificationViewSet,
    PostViewSet,
    RegistrationAnswerViewSet,
    RegistrationFieldViewSet,
    RegistrationFormViewSet,
    RegistrationSubmissionViewSet,
    RegistrationViewSet,
    SubscriptionViewSet,
)

router = DefaultRouter()
router.register(r"clubs", ClubViewSet, basename="club")
router.register(r"students", StudentViewSet, basename="student")
router.register(r"forms", FormViewSet, basename="form")
router.register(r"posts", PostViewSet, basename="post")
router.register(r"registrations", RegistrationViewSet, basename="registration")
router.register(r"registration-forms", RegistrationFormViewSet, basename="registration-form")
router.register(r"registration-fields", RegistrationFieldViewSet, basename="registration-field")
router.register(r"registration-submissions", RegistrationSubmissionViewSet, basename="registration-submission")
router.register(r"registration-answers", RegistrationAnswerViewSet, basename="registration-answer")
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    *( [path("debug/storage/", StorageDebugView.as_view())] if StorageDebugView else [] ),
    path("", include(router.urls)),
]
