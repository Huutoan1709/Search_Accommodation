from django.contrib import admin
from .models import User, Rooms,RoomType,Reviews,FavoritePost,Post,PostImage,SupportRequests,Price,Amenities,ReviewCriterion
from django.utils.translation import gettext_lazy as _

class MyAdminSite(admin.AdminSite):
    site_header = _("My Admin")
    site_title = _("My Admin Portal")
    index_title = _("Welcome to My Admin")

admin_site = MyAdminSite(name='myadmin')
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'phone', 'role', 'is_active')
    search_fields = ('username', 'email', 'phone')

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_approved','is_block', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('title', 'user__username')

class RoomsAdmin(admin.ModelAdmin):
    list_display = ('is_active', 'price', 'area','district' ,'city')
    search_fields = ('district', 'city','price')

class RoomTypeAdmin(admin.ModelAdmin):
    list_display =('id','name')
    search_fields = ('name','id')

admin.site.register(Rooms, RoomsAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Reviews)
admin.site.register(SupportRequests)
admin.site.register(RoomType,RoomTypeAdmin)
admin.site.register(FavoritePost)
admin.site.register(PostImage)
admin.site.register(Price)
admin.site.register(Amenities)
admin.site.register(ReviewCriterion)