# Generated by Django 5.1 on 2024-09-04 14:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0007_alter_reviews_rating'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reviews',
            name='review_quality',
        ),
    ]
