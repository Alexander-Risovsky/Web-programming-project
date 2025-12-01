from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import StudentProfileViewSet, OrganizationProfileViewSet, UserRegistrationView
router = DefaultRouter()
router.register(r'students', StudentProfileViewSet, basename='student-profile')
router.register(r'organizations', OrganizationProfileViewSet, basename='organization-profile')

urlpatterns = [
    path('', include(router.urls)),
    path("register/", UserRegistrationView.as_view(), name="user-registration"),
]