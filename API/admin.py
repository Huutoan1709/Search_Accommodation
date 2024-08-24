from django.contrib import admin
from .models import User, Rooms, Bookings, Reviews, Payment, Contract, SupportRequests, Locations, RoomType, RoomImage



admin.site.register(User)
admin.site.register(Rooms)
admin.site.register(Bookings)
admin.site.register(Reviews)
admin.site.register(Payment)
admin.site.register(Contract)
admin.site.register(SupportRequests)
admin.site.register(Locations)
admin.site.register(RoomType)
admin.site.register(RoomImage)
