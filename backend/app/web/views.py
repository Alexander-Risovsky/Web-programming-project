from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from web.models import (
    Club,
    Form,
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
    queryset = Post.objects.all()
    serializer_class = PostSerializer


@extend_schema(tags=["Регистрации"])
class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer


@extend_schema(tags=["Формы регистрации"])
class RegistrationFormViewSet(viewsets.ModelViewSet):
    queryset = RegistrationForm.objects.all()
    serializer_class = RegistrationFormSerializer


@extend_schema(tags=["Поля форм регистрации"])
class RegistrationFieldViewSet(viewsets.ModelViewSet):
    queryset = RegistrationField.objects.all()
    serializer_class = RegistrationFieldSerializer


@extend_schema(tags=["Отправки форм регистрации"])
class RegistrationSubmissionViewSet(viewsets.ModelViewSet):
    queryset = RegistrationSubmission.objects.all()
    serializer_class = RegistrationSubmissionSerializer


@extend_schema(tags=["Ответы на поля форм"])
class RegistrationAnswerViewSet(viewsets.ModelViewSet):
    queryset = RegistrationAnswer.objects.all()
    serializer_class = RegistrationAnswerSerializer


@extend_schema(tags=["Подписки"])
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
