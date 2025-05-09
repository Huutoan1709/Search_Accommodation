from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from .views import UserViewSet, ReviewViewSet, PostTypeViewset , ResetPasswordViewSet, SupportRequestsViewSet, RoomViewSet, RoomTypeViewSet, PriceViewSet, PostViewSet, AmenitiesViewSet, RecommendationViewSet, SearchHistoryViewSet, PhoneResetPasswordViewSet, VNPayViewSet
router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
router.register('room', RoomViewSet, 'room')
router.register('post', PostViewSet, 'post')
router.register('review', ReviewViewSet, 'review')
router.register('roomtype', RoomTypeViewSet, 'roomtype')
router.register('room/prices', PriceViewSet, 'price')
router.register('amenities', AmenitiesViewSet, 'amenities')
router.register('reset-password', ResetPasswordViewSet, basename='reset-password')
router.register('support-request', SupportRequestsViewSet, 'support-request')
router.register('recommendations', RecommendationViewSet, basename='recommendations')
router.register('search-history', SearchHistoryViewSet, basename='search-history')
router.register('phone-reset-password', PhoneResetPasswordViewSet, basename='phone-reset-password')
router.register('post-type', PostTypeViewset, basename='post-type')
router.register('payment', VNPayViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    
]