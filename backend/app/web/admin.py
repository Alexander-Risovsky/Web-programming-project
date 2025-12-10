from django.contrib import admin

from web.models import (
    Form,
    Post,
    Registration,
    RegistrationAnswer,
    RegistrationField,
    RegistrationForm,
    RegistrationSubmission,
    Subscription,
)


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ("id", "club", "post", "created_at")
    list_filter = ("club",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "type", "club", "is_form", "published_at")
    list_filter = ("club", "type", "is_form")
    search_fields = ("title", "content")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "user", "created_at")
    list_filter = ("form", "user")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "club", "created_at")
    list_filter = ("club",)


@admin.register(RegistrationForm)
class RegistrationFormAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "title", "created_at")
    search_fields = ("title",)


@admin.register(RegistrationField)
class RegistrationFieldAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "label", "field_type", "is_required", "sort_order")
    list_filter = ("field_type", "is_required")
    search_fields = ("label",)


@admin.register(RegistrationSubmission)
class RegistrationSubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "user", "created_at")
    list_filter = ("form",)


@admin.register(RegistrationAnswer)
class RegistrationAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "submission", "field")
    list_filter = ("field",)