from rest_framework import serializers
from .models import User, Follow, PostImage, Post, Price, Rooms, RoomType, Reviews, FavoritePost, Amenities, \
    SupportRequests
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from datetime import datetime
from django.utils import timezone
from django.utils.timesince import timesince
from django.db.models import Avg
class UserSerializer(ModelSerializer):
    followed = SerializerMethodField()
    reputation = SerializerMethodField()
    average_rating = SerializerMethodField()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Check if avatar has a URL attribute
        if hasattr(instance.avatar, 'url') and instance.avatar:
            rep['avatar'] = instance.avatar.url
        else:
            # Provide a default image URL in case avatar does not have a URL
            rep[
                'avatar'] = "https://res.cloudinary.com/daf0utpgr/image/upload/v1725727571/avatar_default.webp"  # Replace with your default image URL

        return rep

    def get_followed(self, obj):
        if self.context.get('request') and self.context['request'].user.id:
            return Follow.objects.filter(follower=self.context['request'].user, following=obj,
                                         is_active=True).first() is not None
        return False

    def get_reputation(self, obj):
        landlord_reviews = Reviews.objects.filter(landlord=obj, is_active=True)


        total_rating = landlord_reviews.aggregate(average_rating=Avg('rating'))['average_rating']

        if total_rating and total_rating >= 4.0:
            return True
        return False

    def get_average_rating(self, obj):
        landlord_reviews = Reviews.objects.filter(landlord=obj, is_active=True)
        average_rating = landlord_reviews.aggregate(average_rating=Avg('rating'))['average_rating']
        return average_rating if average_rating is not None else 0
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'first_name', 'last_name', 'role', 'followed','reputation','average_rating','is_superuser','is_active']


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
        fields = UserSerializer.Meta.fields + ['id', 'gender', 'date_joined', 'last_login', 'email', 'phone','address',
                                               'follower_count', 'following_count', 'password']
        extra_kwargs = {
            'password':
                {'write_only': True},
        }


class RoomTypeSerializer(ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'description','created_at','is_active']


class PriceSerializer(ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'


class AmenitiesSerializer(ModelSerializer):
    class Meta:
        model = Amenities
        fields = ['id', 'name', 'description', 'is_active']


class RoomsSerializer(ModelSerializer):
    created_at_humanized = serializers.SerializerMethodField()
    room_type = RoomTypeSerializer()
    has_post = serializers.SerializerMethodField()

    def get_created_at_humanized(self, obj):
        return timesince(obj.created_at) + ' trước'

    def get_has_post(self, obj):
        return Post.objects.filter(room=obj).exists()

    class Meta:
        model = Rooms
        fields = ['id', 'price', 'ward', 'district', 'city', 'other_address', 'area', 'landlord',
                  'created_at_humanized', 'room_type', 'has_post', 'is_active']
        extra_kwargs = {
            'landlord': {'read_only': True},
        }

class DetailRoomSerializer(RoomsSerializer):
    prices = SerializerMethodField()
    amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenities.objects.all())
    landlord = UserSerializer()
    room_type = RoomTypeSerializer(read_only=True)

    def get_prices(self, obj):
        active_prices = obj.prices.filter(is_active=True)
        return PriceSerializer(active_prices, many=True).data

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude', 'prices', 'amenities', 'landlord','created_at','room_type', 'has_post']


class WriteRoomSerializer(RoomsSerializer):
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.filter(is_active=True))
    landlord = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta(RoomsSerializer.Meta):
        fields = RoomsSerializer.Meta.fields + ['latitude', 'longitude', 'room_type', 'landlord', 'amenities']


class PostImageSerializer(ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['url'] = instance.url.url
        return rep

    class Meta:
        model = PostImage
        fields = ['id', 'url']


class UserPostSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'phone']


class PostSerializer(ModelSerializer):
    images = SerializerMethodField()
    user = UserInfoSerializer()
    room = RoomsSerializer()
    created_at_humanized = SerializerMethodField()
    def get_created_at_humanized(self, obj):
        return timesince(obj.created_at) + ' trước'

    def get_images(self, obj):
        active_images = obj.Post_Images.filter(is_active=True)
        return PostImageSerializer(active_images, many=True).data

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'images', 'room','created_at_humanized','is_active','is_approved','is_block']
        extra_kwargs = {
            'user': {'read_only': True},
        }


class DetailPostSerializer(PostSerializer):
    room = DetailRoomSerializer()

    class Meta(PostSerializer.Meta):
        model = Post
        fields = PostSerializer.Meta.fields+['is_approved',]


class CreatePostSerializer(ModelSerializer):
    images = SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    room = serializers.PrimaryKeyRelatedField(queryset=Rooms.objects.all())

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Post.objects.create(**validated_data)

    def get_images(self, obj):
        active_images = obj.Post_Images.filter(is_active=True)
        return PostImageSerializer(active_images, many=True).data

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'images', 'room']
        extra_kwargs = {
            'user': {'read_only': True},
        }


class FavoritePostSerializer(ModelSerializer):
    class Meta:
        model = FavoritePost
        fields = ['user', 'post']


#
class SupportRequestsSerializer(ModelSerializer):
    user = UserInfoSerializer()

    class Meta:
        model = SupportRequests
        fields = ['id', 'subject', 'description', 'is_handle', 'user', 'created_at', 'updated_at']


#####APi review ,support,FavoritePost

class ReviewSerializer(serializers.ModelSerializer):
    customer = UserInfoSerializer()
    landlord = UserInfoSerializer()
    class Meta:
        model = Reviews
        fields = ['id', 'customer', 'landlord', 'rating', 'comment', 'selected_criteria', 'created_at']

class CreateReviewSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta(ReviewSerializer.Meta):
        model = ReviewSerializer.Meta.model


    def validate(self, data):
        customer = data.get('customer')
        landlord = data.get('landlord')

        if customer == landlord:
            raise serializers.ValidationError("Bạn không thể tự đánh giá chính mình.")

        if customer.role != 'CUSTOMER':
            raise serializers.ValidationError("Chỉ người dùng có vai trò 'CUSTOMER' mới có thể thực hiện đánh giá.")

        if landlord.role != 'LANDLORD':
            raise serializers.ValidationError("Chỉ người dùng có vai trò 'LANDLORD' mới có thể nhận đánh giá.")

        return data

