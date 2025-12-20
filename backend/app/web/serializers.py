from django.contrib.auth import get_user_model
from rest_framework import serializers

from web.models import (
    Form,
    Notification,
    Post,
    Registration,
    RegistrationAnswer,
    RegistrationField,
    RegistrationForm,
    RegistrationSubmission,
    Subscription,
)


class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    image_file = serializers.ImageField(source="image", write_only=True, required=False)
    club_name = serializers.CharField(source="club.name", read_only=True)
    club_avatar_url = serializers.ImageField(source="club.avatar_url", read_only=True)

    class Meta:
        model = Post
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source="club.name", read_only=True)
    club_avatar_url = serializers.ImageField(source="club.avatar_url", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = Notification
        fields = "__all__"


class RegistrationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = Registration
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Subscription
        fields = "__all__"


class RegistrationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationForm
        fields = "__all__"


class RegistrationFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationField
        fields = "__all__"


class RegistrationSubmissionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = RegistrationSubmission
        fields = "__all__"


class RegistrationAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationAnswer
        fields = "__all__"
