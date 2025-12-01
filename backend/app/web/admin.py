from django.contrib import admin
from web.models import Event, Post
# Register your models here.


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    pass


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    pass