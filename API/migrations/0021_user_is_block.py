# Generated by Django 5.1 on 2024-10-04 07:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0020_reviews_unique_customer_landlord_review'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_block',
            field=models.BooleanField(default=False),
        ),
    ]
