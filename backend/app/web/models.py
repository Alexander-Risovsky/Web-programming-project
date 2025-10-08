from django.db import models


class Post(models.Model):
    EVENT_TYPES = [
        ("event", "Event"),
        ("info", "Information"),
    ]

    organization = models.ForeignKey("users.OrganizationProfile", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Event(models.Model):
    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name="event")
    event_date = models.DateTimeField()
    location = models.CharField(max_length=255)


class RegistrationForm(models.Model):
    organization = models.ForeignKey("users.OrganizationProfile", on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    fields = models.JSONField()
    is_active = models.BooleanField(default=True)


class Registration(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE)
    form = models.ForeignKey(RegistrationForm, on_delete=models.CASCADE)
    form_data = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")


class Subscription(models.Model):
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "users.OrganizationProfile", on_delete=models.CASCADE
    )
    subscribed_at = models.DateTimeField(auto_now_add=True)
