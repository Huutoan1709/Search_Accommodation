from rest_framework import permissions
from .models import User

class IsWebmaster(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'WEBMASTER'