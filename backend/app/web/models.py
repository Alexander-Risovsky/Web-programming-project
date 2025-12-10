from django.conf import settings
from django.db import models


class Club(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    avatar_url = models.ImageField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "clubs"
        verbose_name = "Клуб"
        verbose_name_plural = "Клубы"

    def __str__(self) -> str:
        return self.name


class Form(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="forms")
    post = models.OneToOneField(
        "Post", on_delete=models.SET_NULL, null=True, blank=True, related_name="form_entry"
    )
    config_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forms"
        verbose_name = "Форма"
        verbose_name_plural = "Формы"

    def __str__(self) -> str:
        return f"Форма {self.id} клуба {self.club_id}"


class Post(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="posts")
    type = models.CharField(max_length=50, blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(blank=True)
    is_form = models.BooleanField(default=False)
    form = models.OneToOneField(
        Form, on_delete=models.SET_NULL, null=True, blank=True, related_name="post_form"
    )
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "posts"
        verbose_name = "Пост"
        verbose_name_plural = "Посты"

    def __str__(self) -> str:
        return self.title


class RegistrationForm(models.Model):
    post = models.OneToOneField(
        Post, on_delete=models.CASCADE, related_name="registration_form"
    )
    title = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "registration_forms"
        verbose_name = "Форма регистрации"
        verbose_name_plural = "Формы регистрации"

    def __str__(self) -> str:
        return self.title or f"Форма для поста {self.post_id}"


class RegistrationField(models.Model):
    FIELD_TYPES = [
        ("text", "Text"),
        ("number", "Number"),
        ("date", "Date"),
        ("select", "Select"),
        ("email", "Email"),
        ("phone", "Phone"),
    ]

    form = models.ForeignKey(
        RegistrationForm, on_delete=models.CASCADE, related_name="fields"
    )
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    is_required = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    options = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "registration_fields"
        ordering = ["sort_order", "id"]
        verbose_name = "Поле формы регистрации"
        verbose_name_plural = "Поля форм регистрации"

    def __str__(self) -> str:
        return f"{self.label} ({self.field_type})"


class RegistrationSubmission(models.Model):
    form = models.ForeignKey(
        RegistrationForm, on_delete=models.CASCADE, related_name="submissions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="registration_submissions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "registration_submissions"
        verbose_name = "Отправка формы регистрации"
        verbose_name_plural = "Отправки форм регистрации"

    def __str__(self) -> str:
        return f"Submission {self.id} for form {self.form_id}"


class RegistrationAnswer(models.Model):
    submission = models.ForeignKey(
        RegistrationSubmission, on_delete=models.CASCADE, related_name="answers"
    )
    field = models.ForeignKey(
        RegistrationField, on_delete=models.CASCADE, related_name="answers"
    )
    value_text = models.TextField(blank=True)

    class Meta:
        db_table = "registration_answers"
        verbose_name = "Ответ на поле формы"
        verbose_name_plural = "Ответы на поля форм"

    def __str__(self) -> str:
        return f"Answer {self.id} to field {self.field_id}"


class Registration(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="registrations"
    )
    data_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "registrations"
        verbose_name = "Регистрация на событие"
        verbose_name_plural = "Регистрации на события"
        unique_together = ("form", "user")

    def __str__(self) -> str:
        return f"{self.user_id} -> форма {self.form_id}"


class Subscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions"
    )
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="subscriptions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subscriptions"
        verbose_name = "Подписка"
        verbose_name_plural = "Подписки"
        unique_together = ("user", "club")

    def __str__(self) -> str:
        return f"{self.user_id} -> клуб {self.club_id}"
