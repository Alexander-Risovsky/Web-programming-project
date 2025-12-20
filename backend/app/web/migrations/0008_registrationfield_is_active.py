from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("web", "0007_notifications_and_subscription_flag"),
    ]

    operations = [
        migrations.AddField(
            model_name="registrationfield",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]

