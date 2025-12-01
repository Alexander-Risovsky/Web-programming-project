from django.shortcuts import render
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from web.models import Event, Post
from web.serializers import EventSerializer, PostSerializer
# Create your views here.

@extend_schema(tags=["Посты"])
@extend_schema_view(
    list=extend_schema(description="Возвращает лист постов"),
    retrieve=extend_schema(description="Возвращает конкретный пост по id"),
    create=extend_schema(description="Создает новый пост"),
    update=extend_schema(description="Обновляет существующий пост"),
    partial_update=extend_schema(
        description="Частично обновляет существующий пост"
    ),
    destroy=extend_schema(description="Удаляет пост"),
)
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer

    class Meta:
        model = Post
        fields = '__all__'


@extend_schema(tags=["События"])
@extend_schema_view(
    list=extend_schema(description="Возвращает лист событий"),
    retrieve=extend_schema(description="Возвращает конкретное событие по id"),
    create=extend_schema(description="Создает новое событие"),
    update=extend_schema(description="Обновляет существующее событие"),
    partial_update=extend_schema(
        description="Частично обновляет существующее событие"
    ),
    destroy=extend_schema(description="Удаляет событие"),
)
class EventViewSet(viewsets.ModelViewSet):  
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    class Meta:
        model = Event
        fields = '__all__'