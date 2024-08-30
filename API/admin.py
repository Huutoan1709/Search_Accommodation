from django.contrib import admin
from .models import User, Rooms, Bookings, Reviews, Contract, SupportRequests, RoomType, RoomImage,FavoriteRoom



admin.site.register(User)
admin.site.register(Rooms)
admin.site.register(Bookings)
admin.site.register(Reviews)
admin.site.register(Contract)
admin.site.register(SupportRequests)
admin.site.register(RoomType)
admin.site.register(RoomImage)
admin.site.register(FavoriteRoom)
