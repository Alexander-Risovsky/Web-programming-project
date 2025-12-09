from django.conf import settings
from django.db import models


class Club(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
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
