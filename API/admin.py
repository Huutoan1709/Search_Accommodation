from django.contrib import admin
from .models import User, Rooms,RoomType,Reviews,FavoritePost,Post,PostImage,SupportRequests,Price,Amenities,ReviewCriterion



admin.site.register(User)
admin.site.register(Rooms)
admin.site.register(Reviews)
admin.site.register(SupportRequests)
admin.site.register(RoomType)
admin.site.register(FavoritePost)
admin.site.register(Post)
admin.site.register(PostImage)
admin.site.register(Price)
admin.site.register(Amenities)
admin.site.register(ReviewCriterion)