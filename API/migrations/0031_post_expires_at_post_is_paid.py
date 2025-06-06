# Generated by Django 5.0.3 on 2025-05-02 14:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0030_phoneotp'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='post',
            name='is_paid',
            field=models.BooleanField(default=False),
        ),
    ]
