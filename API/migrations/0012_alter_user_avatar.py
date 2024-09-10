# Generated by Django 5.1 on 2024-09-07 16:47

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0011_alter_user_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=cloudinary.models.CloudinaryField(blank=True, default='avatar_default', max_length=255),
        ),
    ]
