from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import UserViewSet,RoomViewSet,RoomImageViewSet,RoomTypeViewSet,SupportRequestsViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
router.register('room', RoomViewSet, 'room')
router.register('room/images',RoomImageViewSet,'roomimage')
router.register('room/roomtype',RoomTypeViewSet,'roomtype')
router.register('support',SupportRequestsViewSet,'support')

urlpatterns = [
    path('', include(router.urls))
]