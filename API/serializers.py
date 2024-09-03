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
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def get_follower_count(self, obj):
        return Follow.objects.filter(following=obj, is_active=True).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj, is_active=True).count()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['id', 'gender', 'date_joined', 'last_login', 'email', 'phone',
                                               'follower_count', 'following_count', 'password']
        extra_kwargs = {
            'password':
                {'write_only': True},
            'is_active':
                {'write_only': True}
        }


class RoomTypeSerializer(ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'description']


class PriceSerializer(ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'


class AmenitiesSerializer(ModelSerializer):
    class Meta:
        model = Amenities
        fields = ['id', 'name', 'description', 'is_active']


class RoomsSerializer(ModelSerializer):
    class Meta:
        model = Rooms
        fields = ['id', 'price', 'ward',
                  'district', 'city', 'other_address', 'area', 'landlord']
        extra_kwargs = {
            'landlord':
                {'read_only': True},
        }


class DetailRoomSerializer(RoomsSerializer):
    prices = SerializerMethodField()
    amenities = AmenitiesSerializer(many=True)
    room_type = RoomTypeSerializer()
    landlord = UserSerializer()

    def get_prices(self, obj):
        active_prices = obj.prices.filter(is_active=True)
        return PriceSerializer(active_prices, many=True).data

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude', 'prices', 'amenities', 'room_type', 'landlord']


class WriteRoomSerializer(RoomsSerializer):
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.filter(is_active=True))
    landlord = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    # amenities = serializers.PrimaryKeyRelatedField(queryset=Amenities.objects.all(), many=True)

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude', 'room_type', 'landlord','amenities']


class PostImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['url'] = instance.url.url
        return rep

    class Meta:
        model = PostImage
        fields = ['id', 'url']


class PostSerializer(ModelSerializer):
    images = SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    room = RoomsSerializer()

    def get_images(self, obj):
        active_images = obj.Post_Images.filter(is_active=True)
        return PostImageSerializer(active_images, many=True).data

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'images', 'is_approved', 'room']
        extra_kwargs = {
            'user': {'read_only': True},
        }


class DetailPostSerializer(PostSerializer):
    room = DetailRoomSerializer()

    class Meta(PostSerializer.Meta):
        model = Post


class CreatePostSerializer(PostSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=Rooms.objects.all())

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Post.objects.create(**validated_data)




class FavoritePostSerializer(ModelSerializer):
    class Meta:
        model = FavoritePost
        fields = ['user', 'post']


#
class SupportRequestsSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SupportRequests
        fields = ['id', 'subject', 'description', 'is_handle', 'user', 'created_at', 'updated_at']
