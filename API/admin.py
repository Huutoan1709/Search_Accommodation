from django.contrib import admin
from .models import User, Rooms, RoomType, Reviews, Payment, FavoritePost,Post, PostType ,PostImage,PostVideo, SupportRequests, Price, Amenities, ReviewCriterion, SearchHistory
from django.utils.translation import gettext_lazy as _
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import path
from django.views.generic import TemplateView

from django.contrib import admin
from django.contrib.staticfiles.storage import staticfiles_storage
from django.utils.safestring import mark_safe
from django.contrib.auth.hashers import make_password

class MyAdminSite(admin.AdminSite):
    site_header = _("My Admin")
    site_title = _("My Admin Portal")
    index_title = _("Welcome to My Admin")

    def get_urls(self):
        urls = super().get_urls()
        return urls

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['custom_style'] = mark_safe(f'<link rel="stylesheet" type="text/css" href="{staticfiles_storage.url("css/custom_admin.css")}"/>')
        return super().index(request, extra_context=extra_context)

admin_site = MyAdminSite(name='myadmin')


class UserAdmin(admin.ModelAdmin):
    list_display = ('id','username', 'email', 'phone', 'role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('role', 'is_active')
    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get('password'):
            # Hash the password if it's provided in the form
            obj.password = make_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)

class PostAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'user', 'status', 'created_at')
    list_filter = ( 'user', 'created_at')
    search_fields = ('title', 'user__username')

    def status(self, obj):
        if obj.is_block:
            return "Khóa"
        elif obj.is_approved and obj.is_active:
            return "Hoạt động"
        elif not obj.is_active:
            return "Ẩn"
        elif obj.is_active and not obj.is_approved:
            return "Chờ duyệt"


class RoomsAdmin(admin.ModelAdmin):
    list_display = ( 'landlord','price','area','full_address','is_active')
    search_fields = ('district', 'city', 'price')
    list_filter = ('city', 'price', 'area','landlord')


    def full_address(self,obj):
        return f"{obj.other_address},{obj.ward}, {obj.district}, {obj.city}"

class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name', 'id')

admin_site.register(Rooms, RoomsAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Post, PostAdmin)
admin_site.register(Reviews)
admin_site.register(SupportRequests)
admin_site.register(RoomType, RoomTypeAdmin)
admin_site.register(FavoritePost)
admin_site.register(PostImage)
admin_site.register(PostVideo)
admin_site.register(Price)
admin_site.register(Amenities)
admin_site.register(ReviewCriterion)
admin_site.register(SearchHistory)
admin_site.register(PostType)
admin_site.register(Payment)