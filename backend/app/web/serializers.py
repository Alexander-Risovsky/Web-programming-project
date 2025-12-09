from django.contrib.auth import get_user_model
from rest_framework import serializers

from web.models import Club, Form, Post, Registration, Subscription


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = "__all__"


class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = "__all__"


class RegistrationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = Registration
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = Subscription
        fields = "__all__"