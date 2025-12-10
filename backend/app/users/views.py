from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiExample

from .serializers import (
    ClubSerializer,
    RegisterClubSerializer,
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
)


@extend_schema(
    request=RegisterSerializer,
    responses={201: UserSerializer},
    examples=[
        OpenApiExample(
            'Register example',
            value={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "strongpassword123",
                "student_name": "Иван",
                "student_surname": "Иванов",
            },
            request_only=True,
        )
    ],
)
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema(
    request=RegisterClubSerializer,
    responses={201: ClubSerializer},
    examples=[
        OpenApiExample(
            'Register club example',
            value={
                "username": "clubuser",
                "email": "club@example.com",
                "password": "strongpassword123",
                "name": "Chess Club",
                "description": "Club description",
            },
            request_only=True,
        )
    ],
)
class RegisterClubView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterClubSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        club = serializer.save()

        # serializer sets `created_user` when creating the club
        created_user = getattr(serializer, "created_user", None)
        if created_user is None:
            # fallback: try to find a user by username in request
            created_user = None

        refresh = RefreshToken.for_user(created_user) if created_user is not None else None

        data = {
            "club": ClubSerializer(club).data,
            "access": str(refresh.access_token) if refresh is not None else None,
            "refresh": str(refresh) if refresh is not None else None,
        }

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema(
    request=LoginSerializer,
    responses={200: UserSerializer},
    examples=[
        OpenApiExample(
            'Login example',
            value={
                "username": "existinguser",
                "password": "strongpassword123",
            },
            request_only=True,
        )
    ],
)
class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return Response(data, status=status.HTTP_200_OK)
