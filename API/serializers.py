from rest_framework import serializers
from .models import User, Follow, Rooms, RoomImage, RoomType, Reviews, Bookings, SupportRequests,FavoriteRoom
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


class RoomImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['url'] = instance.url.url
        return rep

    class Meta:
        model = RoomImage
        fields = ['id', 'url']


class RoomTypeSerializer(ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['name', 'description']


class RoomsSerializer(ModelSerializer):
    is_reserved = SerializerMethodField()

    def get_is_reserved(self, obj):
        active_booking = Bookings.objects.filter(
            room=obj, status='CONFIRMED', expiration__gte=timezone.now()
        ).exists()
        return active_booking

    class Meta:
        model = Rooms
        fields = ['id', 'title', 'description', 'price', 'max_people', 'ward', 'district', 'city',
                  'area', 'is_active','is_approved','is_reserved']
        extra_kwargs = {
            'is_approved': {'read_only': True},
        }


class DetailRoomSerializer(RoomsSerializer):
    landlord = UserSerializer(read_only=True)
    images = SerializerMethodField()
    room_type = RoomTypeSerializer()

    def get_images(self, obj):
        active_images = obj.Room_Images.all()
        return RoomImageSerializer(active_images, many=True).data

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['other_address','latitude', 'longitude', 'landlord', 'room_type', 'images']


class BookingSerializer(ModelSerializer):
    class Meta:
        model = Bookings
        fields = ['id', 'customer', 'room', 'deposit_amount', 'total_amount', 'status']


class ReviewSerializer(ModelSerializer):
    customer = SerializerMethodField()

    def get_customer(self, obj):
        customer = obj.filter(is_active=True)
        return ImageSerializer(customer, many=True).data

    class Meta:
        model = Reviews
        fields = ['id', 'customer', 'room', 'rating', 'comment', 'created_at']

class SupportRequestsSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SupportRequests
        fields = ['id', 'subject', 'description', 'status', 'user', 'created_at', 'updated_at']
class FavoriteRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteRoom
        fields = ['user', 'room']