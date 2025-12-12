from django.urls import path
from .views import ClubViewSet, LoginClubView, RegisterClubView, RegisterView, LoginStudentView, StudentViewSet
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"clubs", ClubViewSet, basename="club")
router.register(r"students", StudentViewSet, basename="student")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register-club/", RegisterClubView.as_view(), name="register-club"),
    path("login/", LoginStudentView.as_view(), name="login"),
    path("login-club/", LoginClubView.as_view(), name="login-club"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]
urlpatterns += router.urls