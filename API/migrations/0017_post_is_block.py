# Generated by Django 5.1 on 2024-09-22 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0016_passwordresetotp'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='is_block',
            field=models.BooleanField(default=False),
        ),
    ]
