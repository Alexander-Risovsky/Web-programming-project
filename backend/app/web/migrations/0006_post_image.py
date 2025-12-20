from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("web", "0005_alter_club_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="post_images/"),
        ),
    ]

