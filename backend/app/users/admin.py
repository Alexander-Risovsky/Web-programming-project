from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import CustomUser, Student
from web.models import Club


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Дополнительно", {"fields": ("created_at",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {"fields": ("avatar_url",)}),)
    list_display = ("username", "email", "is_staff", "is_active")
    search_fields = ("username", "email")

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "major")
    search_fields = ("user__username", "major")


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_at")
    search_fields = ("name",)
