from rest_framework import permissions
from .models import User


class IsAdminUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsWebmaster(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'WEBMASTER'


class IsCustomer(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CUSTOMER'


class IsRoomLandlord(permissions.IsAuthenticated):
    def has_permission(self, request, view):  # đăng nhập với role chủ trọ
        return super().has_permission(request, view) and request.user.role == 'LANDLORD'


class IsOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj == request.user


class OwnerAuthenticated(permissions.IsAuthenticated):
    #Người dùng chức thực là người dùng hiện tại
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj.user == request.user


class RoomLandlordAuthenticated(IsRoomLandlord):
    # Đối tượng user là chủ trọ của đối tượng room
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj.landlord == request.user

class PostLandlordAuthenticated(IsRoomLandlord):
    # Đối tượng user là chủ bài đăng của đối tượng post
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj.user == request.user
