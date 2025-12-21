from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view

from web.models import (
    Club,
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
from web.serializers import (
    FormSerializer,
    NotificationSerializer,
    PostSerializer,
    RegistrationAnswerSerializer,
    RegistrationFieldSerializer,
    RegistrationFormSerializer,
    RegistrationSerializer,
    RegistrationSubmissionSerializer,
    SubscriptionSerializer,
)



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
    queryset = Post.objects.all().select_related("club")
    serializer_class = PostSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        qs = Post.objects.all().select_related("club")

        club_id = self.request.query_params.get("club")
        if club_id:
            qs = qs.filter(club_id=club_id)

        event_like = self.request.query_params.get("event_like")
        if event_like in {"1", "true", "True"}:
            qs = qs.filter(Q(type="event") | Q(is_form=True))

        post_type = self.request.query_params.get("type")
        if post_type:
            qs = qs.filter(type=post_type)

        is_form = self.request.query_params.get("is_form")
        if is_form in {"1", "true", "True"}:
            qs = qs.filter(is_form=True)
        elif is_form in {"0", "false", "False"}:
            qs = qs.filter(is_form=False)

        qs = qs.order_by("-published_at", "-id")

        limit = self.request.query_params.get("limit")
        if limit:
            try:
                limit_int = int(limit)
            except (TypeError, ValueError):
                limit_int = None
            if limit_int is not None and limit_int > 0:
                qs = qs[: min(limit_int, 200)]

        return qs

    def perform_create(self, serializer):
        post = serializer.save()
        subscriptions = Subscription.objects.filter(
            club=post.club, notifications_enabled=True
        ).select_related("user")
        notifications = [
            Notification(
                user=sub.user,
                club=post.club,
                post=post,
                text=f"Новый пост: {post.title}",
            )
            for sub in subscriptions
        ]
        if notifications:
            Notification.objects.bulk_create(notifications)


@extend_schema(tags=["Регистрации"])
class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer


@extend_schema(tags=["Формы регистрации"])
class RegistrationFormViewSet(viewsets.ModelViewSet):
    queryset = RegistrationForm.objects.all()
    serializer_class = RegistrationFormSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        post_id = self.request.query_params.get("post")
        if post_id:
            qs = qs.filter(post_id=post_id)
        return qs


@extend_schema(tags=["Поля форм регистрации"])
class RegistrationFieldViewSet(viewsets.ModelViewSet):
    queryset = RegistrationField.objects.all()
    serializer_class = RegistrationFieldSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        form_id = self.request.query_params.get("form")
        if form_id:
            qs = qs.filter(form_id=form_id)
        active = self.request.query_params.get("active")
        if active in {"1", "true", "True"}:
            qs = qs.filter(is_active=True)
        return qs


@extend_schema(tags=["Отправки форм регистрации"])
class RegistrationSubmissionViewSet(viewsets.ModelViewSet):
    queryset = RegistrationSubmission.objects.all()
    serializer_class = RegistrationSubmissionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        form_id = self.request.query_params.get("form")
        if form_id:
            qs = qs.filter(form_id=form_id)
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs


@extend_schema(tags=["Ответы на поля форм"])
class RegistrationAnswerViewSet(viewsets.ModelViewSet):
    queryset = RegistrationAnswer.objects.all()
    serializer_class = RegistrationAnswerSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        submission_id = self.request.query_params.get("submission")
        if submission_id:
            qs = qs.filter(submission_id=submission_id)
        field_id = self.request.query_params.get("field")
        if field_id:
            qs = qs.filter(field_id=field_id)
        return qs


@extend_schema(tags=["Подписки"])
class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema(tags=["Уведомления"])
class NotificationViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
