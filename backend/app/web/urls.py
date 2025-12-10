from django.urls import include, path
from rest_framework.routers import DefaultRouter

from web.views import (
    ClubViewSet,
    FormViewSet,
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
router.register(r"forms", FormViewSet, basename="form")
router.register(r"posts", PostViewSet, basename="post")
router.register(r"registrations", RegistrationViewSet, basename="registration")
router.register(r"registration-forms", RegistrationFormViewSet, basename="registration-form")
router.register(r"registration-fields", RegistrationFieldViewSet, basename="registration-field")
router.register(r"registration-submissions", RegistrationSubmissionViewSet, basename="registration-submission")
router.register(r"registration-answers", RegistrationAnswerViewSet, basename="registration-answer")
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")

urlpatterns = [
    path("", include(router.urls)),
]