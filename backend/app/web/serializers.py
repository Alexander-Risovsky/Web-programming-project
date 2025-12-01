from rest_framework import serializers
from web.models import Event, Post


class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = '__all__'