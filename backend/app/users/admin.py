from django.contrib import admin
from .models import CustomUser, StudentProfile, OrganizationProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    pass


@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    pass


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    pass