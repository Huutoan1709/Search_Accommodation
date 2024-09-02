from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import UserViewSet,RoomViewSet,RoomTypeViewSet,PriceViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
router.register('room', RoomViewSet, 'room')
router.register('room/roomtype',RoomTypeViewSet,'roomtype')
router.register('room/prices', PriceViewSet, 'price')
router.register('room/Amenities', PriceViewSet, 'amenities')
urlpatterns = [
    path('', include(router.urls))
]