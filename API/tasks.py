from celery import shared_task
from django.db import transaction
from .models import User, UserPreference
from .views import RecommendationViewSet

@shared_task
def update_user_preferences():
    """Cập nhật vectors đặc trưng của users định kỳ"""
    rec_viewset = RecommendationViewSet()
    
    with transaction.atomic():
        for user in User.objects.all():
            vector = rec_viewset._build_feature_vector(user)
            if vector is not None:
                UserPreference.objects.update_or_create(
                    user=user,
                    defaults={'feature_vector': vector.tolist()}
                )