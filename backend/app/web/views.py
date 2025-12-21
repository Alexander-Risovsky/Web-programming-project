import re
import urllib.parse
from functools import lru_cache

from django.contrib.postgres.search import TrigramSimilarity, TrigramWordSimilarity
from django.db import connection
from django.db.models import Q
from django.db.models import Case, ExpressionWrapper, F, FloatField, Value, When
from django.db.models.expressions import RawSQL
from django.db.models.functions import Greatest
from rest_framework.response import Response
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



@lru_cache(maxsize=1)
def _pg_trgm_available() -> bool:
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'")
            return cursor.fetchone() is not None
    except Exception:
        return False


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

    def _base_queryset(self):
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

        return qs

    @staticmethod
    def _trigram_similarity(a: str, b: str) -> float:
        a = f"  {a} "
        b = f"  {b} "
        if len(a) < 3 or len(b) < 3:
            return 0.0
        ta = {a[i : i + 3] for i in range(len(a) - 2)}
        tb = {b[i : i + 3] for i in range(len(b) - 2)}
        if not ta or not tb:
            return 0.0
        return len(ta & tb) / max(len(ta), len(tb))

    @classmethod
    def _match_score(cls, similarity: float) -> float:
        if similarity <= 0:
            return 0.0
        return (2.0 * similarity) / (1.0 + similarity)

    @classmethod
    def _python_search_score(cls, query: str, title: str | None, content: str | None) -> float:
        q = (query or "").casefold().strip()
        if not q:
            return 0.0

        tokens = [t for t in re.split(r"\s+", q) if t][:6]
        if not tokens:
            return 0.0

        text = f"{title or ''} {content or ''}"
        text_cf = text.casefold()

        # Quick exact containment shortcut.
        for t in tokens:
            if t and t in text_cf:
                return 1.0

        punct = ".,;:!?\"'()[]{}«»<>"
        words = []
        for raw in re.split(r"\s+", text_cf[:3000]):
            w = raw.strip(punct)
            if w:
                words.append(w)

        best = 0.0
        for t in tokens:
            if not t:
                continue
            for w in words:
                s = cls._trigram_similarity(t, w)
                if s > best:
                    best = s
                    if best >= 0.9:
                        return best
        return best

    def get_queryset(self):
        qs = self._base_queryset()

        q = (self.request.query_params.get("q") or "").strip()
        if q and re.search(r"%(?:[0-9A-Fa-f]{2})", q):
            # If the query got double-encoded somewhere, decode one more time.
            decoded = urllib.parse.unquote_plus(q).strip()
            if decoded:
                q = decoded
        if q:
            variants = {q, q.lower(), q.upper(), q[:1].upper() + q[1:].lower()}
            contains_q = Q()
            for variant in variants:
                contains_q |= Q(title__icontains=variant) | Q(content__icontains=variant)

            if _pg_trgm_available():
                tokens = [t for t in re.split(r"\s+", q) if t][:6]
                similarities = []
                for token in tokens:
                    token_variants = {
                        token,
                        token.lower(),
                        token.upper(),
                        token[:1].upper() + token[1:].lower(),
                    }
                    for variant in token_variants:
                        literal = Value(variant)
                        similarities.append(TrigramWordSimilarity("title", literal))
                        similarities.append(TrigramWordSimilarity("content", literal))
                        similarities.append(TrigramSimilarity("title", literal))
                        similarities.append(TrigramSimilarity("content", literal))
                        # Fallback for DB locales where pg_trgm word boundary detection
                        # doesn't recognize Cyrillic as alnum: compute max similarity
                        # across whitespace-delimited tokens.
                        similarities.append(
                            RawSQL(
                                "(SELECT COALESCE(MAX(similarity(%s, w)), 0) "
                                "FROM unnest(regexp_split_to_array(title, E'\\\\s+')) AS w)",
                                [variant],
                            )
                        )
                        similarities.append(
                            RawSQL(
                                "(SELECT COALESCE(MAX(similarity(%s, w)), 0) "
                                "FROM unnest(regexp_split_to_array(left(content, 3000), E'\\\\s+')) AS w)",
                                [variant],
                            )
                        )
                if similarities:
                    similarity_expr = (
                        similarities[0]
                        if len(similarities) == 1
                        else Greatest(*similarities)
                    )
                    qs = qs.annotate(
                        raw_similarity=Case(
                            When(contains_q, then=Value(1.0)),
                            default=similarity_expr,
                            output_field=FloatField(),
                        )
                    ).annotate(
                        match_score=ExpressionWrapper(
                            (Value(2.0) * F("raw_similarity"))
                            / (Value(1.0) + F("raw_similarity")),
                            output_field=FloatField(),
                        )
                    ).filter(match_score__gt=0.5)
                    qs = qs.order_by("-match_score", "-published_at", "-id")
            else:
                qs = qs.filter(contains_q)

        if not qs.query.order_by:
            qs = qs.order_by("-published_at", "-id")

        limit = self.request.query_params.get("limit")
        if limit:
            try:
                limit_int = int(limit)
            except (TypeError, ValueError):
                limit_int = None
            if limit_int is not None and limit_int > 0:
                # Don't slice early when we might need Python-side scoring fallback.
                if not (q and not _pg_trgm_available()):
                    qs = qs[: min(limit_int, 200)]

        return qs

    def list(self, request, *args, **kwargs):
        q = (request.query_params.get("q") or "").strip()
        if not q:
            return super().list(request, *args, **kwargs)

        # First try DB trigram path if available (fast). If it returns nothing,
        # fall back to Python scoring to handle edge cases (e.g., locale quirks).
        if _pg_trgm_available():
            response = super().list(request, *args, **kwargs)
            try:
                data = response.data
                if isinstance(data, list) and len(data) > 0:
                    return response
            except Exception:
                return response

        base_qs = self._base_queryset().order_by("-published_at", "-id")[:500]
        scored = []
        for post in base_qs:
            sim = self._python_search_score(q, getattr(post, "title", ""), getattr(post, "content", ""))
            score = self._match_score(sim)
            if score > 0.5:
                scored.append((score, post.published_at, post.id, post))

        scored.sort(key=lambda x: (x[0], x[1] or 0, x[2]), reverse=True)
        posts = [p for *_rest, p in scored]

        limit = request.query_params.get("limit")
        if limit:
            try:
                limit_int = int(limit)
            except (TypeError, ValueError):
                limit_int = None
            if limit_int is not None and limit_int > 0:
                posts = posts[: min(limit_int, 200)]

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

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
