from django.contrib.auth import get_user_model
from rest_framework import serializers

from web.models import Club

from .models import Student


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    student_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    student_surname = serializers.CharField(write_only=True, required=False, allow_blank=True)
    course = serializers.CharField(write_only=True, required=False, allow_blank=True)
    group = serializers.CharField(write_only=True, required=False, allow_blank=True)
    major = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "student_name", "student_surname", "course", "group", "major")

    def create(self, validated_data):
        student_name = validated_data.pop("student_name", None)
        student_surname = validated_data.pop("student_surname", None)

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )

        if student_name or student_surname:
            Student.objects.create(
                user=user, name=student_name or "", surname=student_surname or ""
            )

        return user


class RegisterClubSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )

        club = Club.objects.create(
            user=user,
            name=validated_data["name"],
            description=validated_data.get("description", ""),
            avatar_url=validated_data.get("avatar_url", None),
        )

        self.created_user = user
        return club


class StudentSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ("id", "name", "surname", "course", "group", "major", "avatar_url")

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar_url:
            url = obj.avatar_url.url
            return request.build_absolute_uri(url) if request else url
        return None


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "student_profile")


class ClubSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ("id", "name", "description", "avatar_url", "created_at")

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar_url:
            url = obj.avatar_url.url
            return request.build_absolute_uri(url) if request else url
        return None

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
