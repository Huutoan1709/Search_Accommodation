from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import UserViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')

urlpatterns = [
    path('', include(router.urls))
]