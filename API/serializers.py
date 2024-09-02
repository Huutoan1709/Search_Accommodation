from rest_framework import serializers
from .models import User, Follow, PostImage, Post, Price, Rooms, RoomType, Reviews, FavoritePost, Amenities, \
    SupportRequests
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from datetime import datetime
from django.utils import timezone


class UserSerializer(ModelSerializer):
    followed = SerializerMethodField()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep

    def get_followed(self, obj):
        if self.context.get('request') and self.context['request'].user.id:
            return Follow.objects.filter(follower=self.context['request'].user, following=obj,
                                         is_active=True).first() is not None
        return False

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'first_name', 'last_name', 'role', 'followed']


class UserInfoSerializer(UserSerializer):
    follower_count = SerializerMethodField()
    following_count = SerializerMethodField()

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()
        return user

    def get_follower_count(self, obj):
        return Follow.objects.filter(following=obj, is_active=True).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj, is_active=True).count()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['gender', 'date_joined', 'last_login', 'email', 'phone',
                                               'follower_count', 'following_count', 'password']
        extra_kwargs = {
            'password':
                {'write_only': True},
            'is_active':
                {'write_only': True}
        }


class PostImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['url'] = instance.url.url
        return rep

    class Meta:
        model = PostImage
        fields = ['id', 'url']


class RoomTypeSerializer(ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id','name', 'description']


class RoomsSerializer(ModelSerializer):
    # is_reserved = SerializerMethodField()
    #
    # def get_is_reserved(self, obj):
    #     active_booking = Bookings.objects.filter(
    #         room=obj, status='CONFIRMED', expiration__gte=timezone.now()
    #     ).exists()
    #     return active_booking
    landlord = UserInfoSerializer()
    room_type = RoomTypeSerializer()

    class Meta:
        model = Rooms
        fields = ['id', 'price', 'ward',
                  'district', 'city', 'other_address', 'area', 'landlord','room_type']
        extra_kwargs = {
            'landlord':
                {'read_only': True},
        }


class PriceSerializer(ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'


class AmenitiesSerializer(ModelSerializer):
    class Meta:
        model = Amenities
        fields = ['id', 'name', 'description']


class DetailRoomSerializer(RoomsSerializer):
    prices = SerializerMethodField()
    amenities = SerializerMethodField()

    def get_amenities(self, obj):
        active_amenities = obj.amenities.filter(is_active=True)
        return AmenitiesSerializer(active_amenities, many=True).data

    def get_prices(self, obj):
        active_prices = obj.prices.filter(is_active=True)
        return PriceSerializer(active_prices, many=True).data

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude', 'prices', 'amenities']


class WriteRoomSerializer(RoomsSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        room = Rooms(**data)
        room.landlord = self.context['request'].user
        room.save()

        return room

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude']


class PostSerializer(ModelSerializer):
    images = SerializerMethodField()

    def get_images(self, obj):
        active_images = obj.PostImage.filter(is_active=True)
        return PostImageSerializer(active_images, many=True).data

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at','images','is_approved']
        extra_kwargs = {
            'user':
                {'read_only': True},
        }

class FavoritePostSerializer(ModelSerializer):
    class Meta:
        model = FavoritePost
        fields = ['user', 'post']


#
class SupportRequestsSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SupportRequests
        fields = ['id', 'subject', 'description', 'status', 'user', 'created_at', 'updated_at']
