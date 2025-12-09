from django.contrib import admin

from web.models import Club, Form, Post, Registration, Subscription


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ("id", "club", "post", "created_at")
    list_filter = ("club",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "club", "is_form", "published_at")
    list_filter = ("club", "is_form")
    search_fields = ("title", "content")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "user", "created_at")
    list_filter = ("form", "user")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "club", "created_at")
    list_filter = ("club",)