from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet
from .models import StudentProfile, OrganizationProfile, CustomUser
from .serializers import (
    OrganizationProfileSerializer,
    StudentProfileSerializer,
    UserRegistrationSerializer,
)
from drf_spectacular.utils import extend_schema, extend_schema_view


class UserRegistrationView(generics.CreateAPIView):
    """
    Эндпоинт для регистрации новых пользователей.
    Принимает username, email, password и role.
    """
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer


@extend_schema(tags=["Профили студентов"])
@extend_schema_view(
    list=extend_schema(description="Возвращает лист профилей студентов"),
    retrieve=extend_schema(description="Возвращает конкретный профиль студента по id"),
    create=extend_schema(description="Создает новый профиль студента"),
    update=extend_schema(description="Обновляет существующий профиль студента по id"),
    partial_update=extend_schema(
        description="Partially update an existing student profile"
    ),
    destroy=extend_schema(description="Delete a student profile"),
)
class StudentProfileViewSet(ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer


@extend_schema(tags=["Профили организаций"])
@extend_schema_view(
    list=extend_schema(description="Возвращает лист профилей организаций"),
    retrieve=extend_schema(description="Возвращает конкретный профиль организации по id"),
    create=extend_schema(description="Создает новый профиль организации"),
    update=extend_schema(description="Обновляет существующий профиль организации"),
    partial_update=extend_schema(
        description="Partially update an existing organization profile"
    ),
    destroy=extend_schema(description="Delete an organization profile"),
)
class OrganizationProfileViewSet(ModelViewSet):
    queryset = OrganizationProfile.objects.all()
    serializer_class = OrganizationProfileSerializer


