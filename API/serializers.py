from rest_framework import serializers
from .models import User, Follow, Rooms, RoomImage, RoomType, Reviews, Locations
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from datetime import datetime


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

    class Meta:
        model = UserSerializer.Meta.model
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


class LocationSerializer(ModelSerializer):
    class Meta:
        model = Locations
        fields = ['address', 'city', 'district', 'latitude', 'longitude']


class RoomsSerializer(ModelSerializer):
    is_reserved = SerializerMethodField()

    def get_is_reserved(self, obj):
        active_booking = Bookings.objects.filter(room=obj, status='CONFIRMED', end_date__gte=timezone.now()).exists()
        return active_booking

    # images = RoomImageSerializer(many=True, read_only=True, source='Room_Images')
    # location = LocationSerializer(read_only=True)
    # room_type = RoomTypeSerializer(read_only=True)
    # landlord = UserSerializer(read_only=True)

    class Meta:
        model = Rooms
        fields = ['id', 'title', 'description', 'price', 'max_people', 'area','status','is_reserved','is_approved']
                  # 'status', 'landlord', 'location', 'room_type', 'images','is_reserved' ]
        extra_kwargs = {
            'landlord': {'read_only': True},
            'status': {'read_only': True},
            'is_approved': {'read_only': True},
        }
