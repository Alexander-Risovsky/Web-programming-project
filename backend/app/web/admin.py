from django.contrib import admin
from web.models import Post
# Register your models here.



@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    pass