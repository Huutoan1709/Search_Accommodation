from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import UserViewSet,RoomViewSet,RoomTypeViewSet,PriceViewSet,PostViewSet,AmenitiesViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
router.register('room', RoomViewSet, 'room')
router.register('post', PostViewSet, 'post')
router.register('roomtype',RoomTypeViewSet,'roomtype')
router.register('room/prices', PriceViewSet, 'price')
router.register('amenities', AmenitiesViewSet, 'amenities')
urlpatterns = [
    path('', include(router.urls))
]