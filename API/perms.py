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
        # Check if the user is authenticated, is the owner, or is a webmaster or superuser
        return (
            super().has_permission(request, view) and
            (obj == request.user or request.user.is_superuser or request.user.role in ['WEBMASTER'])
        )


class OwnerAuthenticated(permissions.IsAuthenticated):
    #Người dùng chức thực là người dùng hiện tại
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj.user == request.user


class RoomLandlordAuthenticated(IsRoomLandlord):
    # Đối tượng user là chủ trọ của đối tượng room
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and obj.landlord == request.user

class PostLandlordAuthenticated(permissions.BasePermission):
    # Đối tượng user là chủ bài đăng của đối tượng post
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                (request.user.role in ['ADMIN', 'WEBMASTER', 'LANDLORD']))

    def has_object_permission(self, request, view, obj):
        # Kiểm tra xem người dùng có phải là ADMIN, WEBMASTER hoặc chủ bài đăng không
        return (request.user.role in ['ADMIN', 'WEBMASTER'] or obj.user == request.user)
class IsAdminWebmasterOrLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                (request.user.role in ['ADMIN', 'WEBMASTER', 'LANDLORD']))
