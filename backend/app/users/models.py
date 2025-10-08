from django.db import models
from django.contrib.auth.models import AbstractUser


ROLE_CHOICES = [
    ("student", "Student"),
    ("organization", "Organization"),
    ("admin", "Admin"),
]


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="student_profile"
    )
    full_name = models.CharField(max_length=255)
    notifications_enabled = models.BooleanField(default=True)


class OrganizationProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="organization_profile"
    )
    organization_name = models.CharField(max_length=255)


class UserLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
