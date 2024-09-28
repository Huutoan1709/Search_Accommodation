from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import UserViewSet,ReviewViewSet,ResetPasswordViewSet,RoomViewSet,RoomTypeViewSet,PriceViewSet,PostViewSet,AmenitiesViewSet,SupportRequestsViewSet

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
# router.register('user/supports', SupportRequestsViewSet, 'support')
router.register('room', RoomViewSet, 'room')
router.register('post', PostViewSet, 'post')
router.register('review', ReviewViewSet, 'review')
router.register('roomtype',RoomTypeViewSet,'roomtype')
router.register('room/prices', PriceViewSet, 'price')
router.register('amenities', AmenitiesViewSet, 'amenities')
router.register('reset-password', ResetPasswordViewSet, basename='reset-password')
router.register('support-request', SupportRequestsViewSet,'support-request')

urlpatterns = [
    path('', include(router.urls))
]