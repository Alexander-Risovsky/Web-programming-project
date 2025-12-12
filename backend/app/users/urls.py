from django.urls import path
from .views import ClubViewSet, LoginClubView, RegisterClubView, RegisterView, LoginStudentView, StudentViewSet
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register-club/", RegisterClubView.as_view(), name="register-club"),
    path("login/", LoginStudentView.as_view(), name="login"),
    path("login-club/", LoginClubView.as_view(), name="login-club"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]
