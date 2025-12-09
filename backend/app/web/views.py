from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from web.models import Club, Form, Post, Registration, Subscription
from web.serializers import (
    ClubSerializer,
    FormSerializer,
    PostSerializer,
    RegistrationSerializer,
    SubscriptionSerializer,
)


@extend_schema(tags=["Клубы"])
class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer


@extend_schema(tags=["Формы"])
class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer


@extend_schema(tags=["Посты"])
@extend_schema_view(
    list=extend_schema(description="Возвращает список постов"),
    retrieve=extend_schema(description="Возвращает пост по id"),
)
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


@extend_schema(tags=["Регистрации"])
class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer


@extend_schema(tags=["Подписки"])
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
