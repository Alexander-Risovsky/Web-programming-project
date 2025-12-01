from django.db import models
from django.contrib.auth.models import AbstractUser


ROLE_CHOICES = [
    ("student", "Student"),
    ("organization", "Organization"),
    ("admin", "Admin"),
]


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="student_profile"
    )
    full_name = models.CharField(max_length=255)
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Профиль студента"
        verbose_name_plural = "Профили студентов"

    def __str__(self):
        return self.full_name


class OrganizationProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="organization_profile"
    )
    organization_name = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Профиль организации"
        verbose_name_plural = "Профили организаций"

    def __str__(self):
        return self.organization_name


class UserLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
