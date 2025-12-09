from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self) -> str:
        return self.username


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")
    name = models.CharField(max_length=150, null=True)
    surname = models.CharField(max_length=150, null=True)
    major = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "students"
        verbose_name = "Студент"
        verbose_name_plural = "Студенты"

    def __str__(self) -> str:
        return f"{self.user.username} "
