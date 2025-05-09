from .models import SearchHistory, User, UserPreference, Payment
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer, RoomTypeSerializer, RoomsSerializer, DetailRoomSerializer, PriceSerializer, \
    SupportRequestsSerializer, WriteRoomSerializer, SearchHistorySerializer ,AmenitiesSerializer, PostSerializer, DetailPostSerializer, \
    CreatePostSerializer, PostImageSerializer, ReviewSerializer, CreateReviewSerializer,PaymentSerializer ,PostVideoSerializer, PostTypeSerializer
from rest_framework import viewsets, generics, response, status, permissions, filters
from rest_framework.decorators import action, api_view
from API.models import User, Follow, Rooms, RoomType, Reviews, SupportRequests, FavoritePost, Price, Post, PostType, PostImage, \
    Amenities, PasswordResetOTP, PostVideo,SearchHistory
from django_filters.rest_framework import DjangoFilterBackend
from django.http import QueryDict
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone
from .models import PasswordResetOTP
from django.conf import settings
from django.template.loader import render_to_string
from django.shortcuts import render, redirect
from django.db.models import Q, Count, Avg, StdDev, Max, Case, When
from django.db import models
import jwt
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import numpy as np
import hashlib
import hmac
import urllib.parse

# from django_filters.rest_framework import DjangoFilterBackend
class UpdatePartialAPIView(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        # Chỉ cho phép PATCH
        if not request.method == 'PATCH':
            return response.Response({"message": "Only PATCH method is allowed"},
                                     status=status.HTTP_405_METHOD_NOT_ALLOWED)

        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return response.Response(serializer.data)


class DestroySoftAPIView(generics.DestroyAPIView):
    def destroy(self, request, *args, **kwargs):
        image = self.get_object()
        image.is_active = False
        image.save()
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserInfoSerializer
    queryset = User.objects.all()
    pagination_class = paginators.UserPagination

    def get_permissions(self):
        if self.action in ['get_follower', 'get_following', 'follow', 'current_user', 'my_rooms', 'my_post',
                           'favorite_post', 'my_review', 'my_favorites']:
            return [permissions.IsAuthenticated()]

        if self.action in ['update', 'partial_update']:
            return [perms.IsOwner()]

        return [permissions.AllowAny()]

    @action(methods=['post'], detail=False, url_path='change-password',
            permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not check_password(old_password, user.password):
            return response.Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password:
            return response.Response({'error': 'New password is not provided'}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()
        return response.Response({'success': 'Đổi mật khẩu thành công'}, status=status.HTTP_200_OK)

    @action(methods=['get', 'patch', 'delete'], url_path='current_user', detail=False)
    def current_user(self, request):
        self.check_object_permissions(request, request.user)
        if request.method.__eq__('DELETE'):
            user = request.user
            user.is_active = False
            user.save()
            return response.Response(status=status.HTTP_204_NO_CONTENT)
        elif request.method.__eq__('PATCH'):
            user = request.user
            for key, value in request.data.items():
                setattr(user, key, value)
            user.save()
        return response.Response(UserInfoSerializer(request.user).data)

    @action(methods=['get'], url_path='following', detail=True)
    def get_following(self, request, pk):
        user = self.get_object()
        following = Follow.objects.filter(follower=user, is_active=True).all()
        serializer = serializers.UserSerializer([follow.following for follow in following], many=True)

        return response.Response(serializer.data, status.HTTP_200_OK)

    @action(methods=['get'], url_path='followers', detail=True)
    def get_follower(self, request, pk):
        user = self.get_object()
        followers = Follow.objects.filter(following=user, is_active=True).all()
        serializer = serializers.UserSerializer([follow.follower for follow in followers], many=True)

        return response.Response(serializer.data, status.HTTP_200_OK)

    @action(methods=['get'], url_path='posts', detail=True)
    def get_post(self, request, pk):
        user = self.get_object()  # Lấy đối tượng người dùng

        posts = Post.objects.filter(user=user, is_active=True)

        if request.user != user:
            posts = posts.filter(is_approved=True)

        return response.Response(serializers.DetailPostSerializer(posts, many=True).data,
                                 status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='my-rooms', detail=False)
    def my_rooms(self, request):
        user = request.user
        rooms = Rooms.objects.filter(landlord=user, is_active=True).all()
        serializer = DetailRoomSerializer(rooms, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='my-post')
    def my_post(self, request):
        user = request.user
        post = Post.objects.filter(user=user).all()
        serializer = DetailPostSerializer(post, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='follow', detail=True)
    def follow(self, request, pk):

        f, created = Follow.objects.get_or_create(follower=request.user, following=self.get_object())

        if not created:
            f.is_active = not f.is_active
            f.save()

        return response.Response(status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='favorite-post', detail=False)
    def favorite_post(self, request):
        post_id = request.data.get('post_id')
        if not post_id:
            return response.Response({"error": "Post ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return response.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Tạo hoặc lấy bản ghi yêu thích
        favorite, created = FavoritePost.objects.get_or_create(user=request.user, post=post)

        if not created:
            # Nếu bản ghi đã tồn tại, xóa để bỏ yêu thích
            favorite.delete()
            return response.Response({"message": "Post removed from favorites"}, status=status.HTTP_200_OK)

        return response.Response({"message": "Post added to favorites"}, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=False, url_path='my-favorites')
    def my_favorites(self, request):
        favorites = FavoritePost.objects.filter(user=request.user)
        post_ids = [favorite.post.id for favorite in favorites]
        posts = Post.objects.filter(id__in=post_ids)
        serializer = PostSerializer(posts, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='my-reviews')
    def get_my_reviews(self, request):
        user = request.user  # Lấy user hiện tại

        reviews = Reviews.objects.filter(customer=user).order_by('-created_at')

        # Nếu không có đánh giá nào
        if not reviews.exists():
            return response.Response({"message": "You have no reviews"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(reviews, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True, url_path='review')
    def get_reviews(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return response.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        reviews = Reviews.objects.filter(landlord=user).order_by('-id')

        serializer = ReviewSerializer(reviews, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class RoomViewSet(viewsets.ViewSet, UpdatePartialAPIView, generics.ListCreateAPIView, generics.RetrieveDestroyAPIView):
    # serializer_class = RoomsSerializer
    # queryset = Rooms.objects.all()
    pagination_class = paginators.BasePaginator
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['price', 'ward', 'district', 'city', 'other_address', 'description']
    filterset_fields = ['price', 'ward', 'district', 'city', 'other_address', 'area']
    ordering_fields = ['price', 'area']
    ordering = ['price']

    def get_permissions(self):
        if self.action in ['partial_update', 'destroy', 'add_price']:
            return [perms.RoomLandlordAuthenticated()]

        if self.action in ['create', ]:
            return [perms.IsRoomLandlord()]

        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action.__eq__('list'):
            return RoomsSerializer
        return DetailRoomSerializer

    def get_queryset(self):
        queryset = Rooms.objects.filter(is_active=True)

        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        min_area = self.request.query_params.get('min_area', None)
        max_area = self.request.query_params.get('max_area', None)
        latitude = self.request.query_params.get('latitude', None)
        longitude = self.request.query_params.get('longitude', None)

        if min_price and max_price:
            queryset = queryset.filter(price__range=(min_price, max_price))
        elif min_price:
            queryset = queryset.filter(price__gte=min_price)
        elif max_price:
            queryset = queryset.filter(price__lte=max_price)

        if min_area and max_area:
            queryset = queryset.filter(area__range=(min_area, max_area))
        elif min_area:
            queryset = queryset.filter(area__gte=min_area)
        elif max_area:
            queryset = queryset.filter(area__lte=max_area)
        if latitude and longitude:
            lat = float(latitude)
            lon = float(longitude)
            queryset = queryset.filter(latitude__range=(lat - 0.04, lat + 0.04),
                                       longitude__range=(lon - 0.04, lon + 0.04))

        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['landlord'] = request.user.id
        serializer = WriteRoomSerializer(data=data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], detail=True)
    def edit_room(self, request, pk=None):
        try:
            room = self.get_object()
        except Rooms.DoesNotExist:
            return response.Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        if room.landlord != request.user:
            return response.Response({'error': 'Bạn không có quyền thực hiện hành động này.'},
                                     status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_200_OK)

        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # context = {
    #     'user': self.request.user,
    #     'room': serializer.data
    # }
    # send_motel_news_email(context)

    @action(methods=['post'], url_path='prices', detail=True)
    def add_price(self, request, pk):
        room = self.get_object()
        price_data = request.data.copy()
        price_data['room'] = room.id
        serializer = PriceSerializer(data=price_data)

        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()

        # Kiểm tra xem có bài đăng liên quan đến phòng này không
        if Post.objects.filter(room=room).exists():
            return response.Response(
                {"error": "Phòng này đang được đăng cho thuê, hãy xóa bài đăng trước khi xóa phòng!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Nếu không có bài đăng liên quan, cho phép xóa phòng
        return super().destroy(request, *args, **kwargs)


class PostViewSet(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView, generics.DestroyAPIView,
                  generics.RetrieveAPIView):
    pagination_class = paginators.BasePaginator
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['__all__']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Post.objects.filter(is_active=True, is_approved=True, is_block=False)

        if self.request.query_params.get('all', None) == 'true':
            queryset = Post.objects.all()
        if self.action in ['destroy', 'partial_update', 'update', 'delete_image']:
            queryset = Post.objects.all()
        if (self.action) in ['images','video']:
            queryset = Post.objects.filter(is_active=True)

        # Lấy các giá trị từ query params
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        min_area = self.request.query_params.get('min_area', None)
        max_area = self.request.query_params.get('max_area', None)
        ward = self.request.query_params.get('ward', None)
        district = self.request.query_params.get('district', None)
        city = self.request.query_params.get('city', None)
        room_type = self.request.query_params.get('room_type', None)
        # Tìm kiếm xung quanh bằng cách sử dụng tọa độ
        min_latitude = self.request.query_params.get('min_latitude', None)
        max_latitude = self.request.query_params.get('max_latitude', None)
        min_longitude = self.request.query_params.get('min_longitude', None)
        max_longitude = self.request.query_params.get('max_longitude', None)
        # Lọc theo price
        if min_price and max_price:
            queryset = queryset.filter(room__price__range=(min_price, max_price))
        elif min_price:
            queryset = queryset.filter(room__price__gte=min_price)
        elif max_price:
            queryset = queryset.filter(room__price__lte=max_price)

        # Lọc theo area
        if min_area and max_area:
            queryset = queryset.filter(room__area__range=(min_area, max_area))
        elif min_area:
            queryset = queryset.filter(room__area__gte=min_area)
        elif max_area:
            queryset = queryset.filter(room__area__lte=max_area)

        # Lọc theo ward, district, city (sử dụng exact match)
        if ward:
            queryset = queryset.filter(room__ward__iexact=ward.strip())
        if district:
            queryset = queryset.filter(room__district__iexact=district.strip())
        if city:
            queryset = queryset.filter(room__city__iexact=city.strip())
        if room_type:
            queryset = queryset.filter(room__room_type__name__iexact=room_type.strip())

        # Tìm kiếm xung quanh theo tọa độ (latitude, longitude)
        if min_latitude and max_latitude and min_longitude and max_longitude:
            queryset = queryset.filter(
                Q(room__latitude__gte=min_latitude) & Q(room__latitude__lte=max_latitude) &
                Q(room__longitude__gte=min_longitude) & Q(room__longitude__lte=max_longitude)
            )
        # Chỉ lọc những bài đăng đã duyệt khi action là 'list'
        if self.action == 'list':
            queryset = queryset.filter(is_approved=True)
        # Order by post type (VIP first) and then by creation date
        queryset = queryset.annotate(
            post_type_order=Case(
                When(post_type__name='VIP', then=0),
                default=1,
                output_field=models.IntegerField(),
            )
        ).order_by('post_type_order', '-created_at')

        return queryset

    def get_permissions(self):
        if self.action == 'list':
            # Bất kỳ người dùng nào đều có thể xem danh sách bài đăng
            return [permissions.AllowAny()]

        if self.action in ['create', 'partial_update', 'update', 'destroy']:
            # Sử dụng lớp quyền tùy chỉnh để kiểm tra quyền
            return [perms.IsAdminWebmasterOrLandlord()]

        return [permissions.AllowAny()]

    def get_serializer_class(self):
        serializers = {
            'list': PostSerializer,
            'create': CreatePostSerializer,
            'retrieve': DetailPostSerializer,
            'update': DetailPostSerializer,
            'partial_update': DetailPostSerializer,
        }
        return serializers.get(self.action, PostSerializer)

    def create(self, request, *args, **kwargs):
        # Validate dữ liệu đầu vào
        room_id = request.data.get('room')
        post_type_id = request.data.get('post_type')

        if not room_id:
            return response.Response({'error': 'Room ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not post_type_id:
            return response.Response({'error': 'Post Type ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room = Rooms.objects.get(id=room_id)
            post_type = PostType.objects.get(id=post_type_id)
        except Rooms.DoesNotExist:
            return response.Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        except PostType.DoesNotExist:
            return response.Response({'error': 'Post Type not found'}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra quyền
        if room.landlord.id != request.user.id:
            return response.Response(
                {'error': 'Only the landlord of the room can create a post about it'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Tạo post data
        post_data = {
            'title': request.data.get('title'),
            'content': request.data.get('content'),
            'user': request.user.id,
            'room': room_id,
            'post_type': post_type_id
        }

        serializer = self.get_serializer(data=post_data)
        if serializer.is_valid(raise_exception=True):
            post = serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)

        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        post = self.get_object()

        # Kiểm tra quyền chỉnh sửa
        if request.user.role not in ['ADMIN', 'WEBMASTER', 'LANDLORD']:
            return response.Response(
                {'error': 'Chỉ ADMIN, WEBMASTER hoặc chủ bài đăng mới có thể chỉnh sửa bài viết này.'},
                status=status.HTTP_403_FORBIDDEN)

        # Nếu người dùng không phải là admin hoặc webmaster, không cho phép chỉnh sửa các trường is_approved và is_block
        if 'is_approved' in request.data or 'is_block' in request.data:
            if request.user.role not in ['WEBMASTER', 'ADMIN']:
                return response.Response({'error': 'Chỉ admin và webmaster mới có thể chỉnh sửa các trường này.'},
                                         status=status.HTTP_403_FORBIDDEN)

        # Cập nhật bài viết
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()

        # Kiểm tra quyền xóa bài viết
        if request.user.role not in ['ADMIN', 'WEBMASTER', 'LANDLORD']:
            return response.Response({'error': 'Bạn không có quyền thực hiện hành động này!'},
                                     status=status.HTTP_403_FORBIDDEN)

        # Xóa bài viết vĩnh viễn
        post.delete()
        return response.Response({'message': 'Bài viết đã được xóa thành công.'}, status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get'], detail=False, url_path='wait-approved')
    def get_wait_approved(self, request):
        approved = Post.objects.filter(is_approved=False, is_block=False).all()
        serializer = DetailPostSerializer(approved, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='block')
    def get_block_post(self, request):
        block = Post.objects.filter(isblock=True).all()
        serializer = DetailPostSerializer(block, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='images')
    def images(self, request, pk=None):
        if request.method == 'POST':
            post = self.get_object()
            images = request.FILES.getlist('images')
            if not images:
                return response.Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

            uploaded_images = []
            for image in images:
                post_image = PostImage.objects.create(url=image, post=post)
                uploaded_images.append(post_image)

            return response.Response(PostImageSerializer(uploaded_images, many=True).data, status=status.HTTP_200_OK)

        return response.Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(methods=['delete'], detail=True, url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        try:
            # Lấy bài đăng hiện tại
            post = self.get_object()

            # Kiểm tra quyền xóa (chỉ chủ bài đăng hoặc admin/webmaster mới có thể xóa ảnh)
            if request.user.role not in ['ADMIN', 'WEBMASTER', 'LANDLORD'] or post.user != request.user:
                return response.Response(
                    {'error': 'Chỉ ADMIN, WEBMASTER hoặc chủ bài đăng mới có thể xóa ảnh.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Tìm ảnh theo ID
            post_image = PostImage.objects.get(id=image_id, post=post)

            # Xóa ảnh
            post_image.delete()

            return response.Response({'message': 'Ảnh đã được xóa thành công.'}, status=status.HTTP_204_NO_CONTENT)
        except PostImage.DoesNotExist:
            return response.Response({'error': 'Ảnh không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)


    @action(methods=['post'], detail=True, url_path='video')
    def video(self, request, pk=None):
        post = self.get_object()

        # Kiểm tra nếu không có video trong request
        if 'video' not in request.FILES:
            return response.Response({'error': 'No video file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem bài đăng đã có video chưa
        if hasattr(post, 'Post_Video'):
            return response.Response({'error': 'This post already has a video'}, status=status.HTTP_400_BAD_REQUEST)

        post_video = PostVideo(post=post, video=request.FILES['video'])
        post_video.save()

        return response.Response(PostVideoSerializer(post_video).data, status=status.HTTP_201_CREATED)

    @action(methods=['delete'], detail=True, url_path='deletevideo')
    def delete_video(self, request, pk=None):
        try:
            post = self.get_object()

            # Kiểm tra quyền xóa
            if request.user.role not in ['ADMIN', 'WEBMASTER', 'LANDLORD'] or post.user != request.user:
                return response.Response(
                    {'error': 'Chỉ ADMIN, WEBMASTER hoặc chủ bài đăng mới có thể xóa video.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Kiểm tra xem bài đăng có video không
            try:
                post_video = PostVideo.objects.get(post=post)
            except PostVideo.DoesNotExist:
                return response.Response({'error': 'Bài đăng không có video.'}, status=status.HTTP_404_NOT_FOUND)

            # Xóa video
            post_video.delete()

            return response.Response({'message': 'Video đã được xóa thành công.'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return response.Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PriceViewSet(viewsets.ViewSet, DestroySoftAPIView, UpdatePartialAPIView):
    serializer_class = PriceSerializer
    queryset = Price.objects.all()
    permission_classes = [permissions.IsAuthenticated()]


class AmenitiesViewSet(viewsets.ViewSet, generics.ListCreateAPIView, DestroySoftAPIView, UpdatePartialAPIView):
    serializer_class = AmenitiesSerializer
    queryset = Amenities.objects.all()
    permissions_classes = [permissions.IsAuthenticated()]


class RoomTypeViewSet(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView):
    serializer_class = RoomTypeSerializer
    queryset = RoomType.objects.all()
    # pagination_class = paginators.BasePaginator
    permissions_classes = [permissions.IsAuthenticated()]

class PostTypeViewset(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView):
    serializer_class = serializers.PostTypeSerializer
    queryset = PostType.objects.all()
    permissions_classes = [permissions.IsAuthenticated()]

    

class SupportRequestsViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SupportRequestsSerializer
    queryset = SupportRequests.objects.all()
    pagination_class = paginators.BasePaginator
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Thêm thông tin người dùng hiện tại vào dữ liệu yêu cầu
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Lưu user hiện tại
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action.__eq__('create'):
            return CreateReviewSerializer
        return ReviewSerializer

    def get_queryset(self):
        return Reviews.objects.filter(is_active=True).order_by('-id')

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        customer = request.user  # Người dùng hiện tại (đã đăng nhập)

        data['customer'] = customer.id

        landlord_id = data.get('landlord')
        try:
            landlord = User.objects.get(id=landlord_id)
        except User.DoesNotExist:
            return response.Response({"error": "Chủ trọ không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra vai trò của người dùng
        if customer.role != 'CUSTOMER':
            return response.Response({"error": "Chỉ người dùng có vai trò 'CUSTOMER' mới có thể thực hiện đánh giá."},
                                     status=status.HTTP_403_FORBIDDEN)
        if landlord.role != 'LANDLORD':
            return response.Response({"error": "Chỉ người dùng có vai trò 'LANDLORD' mới có thể nhận đánh giá."},
                                     status=status.HTTP_403_FORBIDDEN)
        if customer == landlord:
            return response.Response({"error": "Bạn không thể tự đánh giá chính mình."},
                                     status=status.HTTP_400_BAD_REQUEST)
        if Reviews.objects.filter(customer=customer, landlord=landlord).exists():
            return response.Response({"error": "Bạn đã đánh giá người cho thuê này rồi."},
                                     status=status.HTTP_400_BAD_REQUEST)

        serializer_class = self.get_serializer_class()  # Gọi phương thức để lấy lớp serializer
        serializer = serializer_class(data=data)  # Sử dụng serializer_class
        if serializer.is_valid():
            serializer.save()
            # Dữ liệu cho email
            context = {
                'landlord': landlord,
                'customer': customer,
                'review': serializer.instance,
            }

            # Render email bằng template HTML
            subject = 'Bạn đã nhận được một đánh giá mới!'
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [landlord.email]

            try:
                html_message = render_to_string('emails/new_review_email.html', context, request=request)
            except Exception as e:
                return response.Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Gọi hàm send_mail với html_message
            send_mail(subject, '', from_email, recipient_list, html_message=html_message, fail_silently=False)
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordViewSet(viewsets.ViewSet):
    def create(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(email=email)

            if otp:
                otp_instance = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).last()

                if not otp_instance:
                    return response.Response({'error': 'OTP không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

                if otp_instance.expires_at < timezone.now():
                    return response.Response({'error': 'OTP đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)

                # Đặt lại mật khẩu
                user.set_password(new_password)
                user.save()

                # Đánh dấu OTP đã sử dụng
                otp_instance.is_used = True
                otp_instance.save()

                return response.Response({'message': 'Mật khẩu đã được đặt lại thành công.'}, status=status.HTTP_200_OK)

            else:  # Nếu chưa có OTP, gửi OTP qua email
                otp_instance = PasswordResetOTP.objects.create(user=user)
                otp_instance.generate_otp()

                send_mail(
                    'TO_ACCOMMODATION OTP RESET PASSWORD',
                    f'Xin Chào'
                    f'Chúng tôi gửi bạn mã OTP dùng để cập nhập mật khẩu,hiệu lực trong 1 phút. Mã OTP của bạn là: {otp_instance.otp}',
                    'noreply@example.com',
                    [email],
                    fail_silently=False,
                )
                return response.Response({'message': 'OTP đã được gửi đến email của bạn.'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return response.Response({'error': 'Email không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)


from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, viewsets
from .models import PhoneOTP
import random
import string
from datetime import timedelta
from django.utils import timezone
from .utils import send_sms, format_phone_number_for_twilio

class PhoneResetPasswordViewSet(viewsets.ViewSet):
    def create(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        # Validate phone number format first
        if not phone:
            return response.Response(
                {'error': 'Số điện thoại là bắt buộc'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Try to format the phone number first
            formatted_phone = format_phone_number_for_twilio(phone)
            user = User.objects.get(phone=phone)

            if otp:
                # Handle OTP verification
                otp_instance = PhoneOTP.objects.filter(
                    user=user,
                    otp=otp,
                    is_used=False,
                    expires_at__gt=timezone.now()
                ).first()

                if not otp_instance:
                    return response.Response(
                        {'error': 'OTP không hợp lệ hoặc đã hết hạn.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                user.set_password(new_password)
                user.save()

                otp_instance.is_used = True
                otp_instance.save()

                return response.Response(
                    {'message': 'Mật khẩu đã được đặt lại thành công.'},
                    status=status.HTTP_200_OK
                )
            else:
                # Generate and send new OTP
                otp_instance = PhoneOTP.objects.create(user=user)
                otp_instance.generate_otp()
                
                # Send SMS with formatted phone number
                message = f"Mã OTP để đặt lại mật khẩu của bạn là: {otp_instance.otp}"
                sms_sent = send_sms(formatted_phone, message)
                
                if not sms_sent:
                    return response.Response(
                        {'error': 'Không thể gửi SMS. Vui lòng thử lại sau.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                return response.Response(
                    {'message': 'OTP đã được gửi đến số điện thoại của bạn.'},
                    status=status.HTTP_200_OK
                )

        except User.DoesNotExist:
            return response.Response(
                {'error': 'Không tìm thấy tài khoản với số điện thoại này.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return response.Response(
                {'error': f'Lỗi: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class SearchHistoryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SearchHistorySerializer

    def create(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = SearchHistorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    WEIGHTS = {
    'price': 0.3,
    'area': 0.2,
    'room_type': 0.3,
    'location': 0.2
}
    
    def _pad_vector(self, vector, size):
        """Đảm bảo vector có kích thước cố định"""
        if len(vector) < size:
            return np.pad(vector, (0, size - len(vector)))
        return vector[:size]

    def _build_feature_vector(self, user):
        """Xây dựng vector đặc trưng cho user"""
        search_history = SearchHistory.objects.filter(user=user)
        
        if not search_history.exists():
            return None

        # Tính toán thống kê về giá
        price_stats = search_history.aggregate(
            avg_price=Avg('min_price'),
            price_std=StdDev('min_price'),
            max_price=Max('max_price')
        )
        
        # Tính toán thống kê về diện tích
        area_stats = search_history.aggregate(
            avg_area=Avg('min_area'), 
            area_std=StdDev('min_area'),
            max_area=Max('max_area')
        )

        # Phân tích loại phòng
        room_type_dist = (
            search_history
            .values('room_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Phân tích khu vực
        location_dist = (
            search_history
            .values('city')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Vector cơ bản
        base_features = [
            float(price_stats['avg_price'] or 0),
            float(price_stats['price_std'] or 0),
            float(price_stats['max_price'] or 0),
            float(area_stats['avg_area'] or 0),
            float(area_stats['area_std'] or 0),
            float(area_stats['max_area'] or 0)
        ]

        # One-hot encoding cho room type
        room_types = RoomType.objects.all()
        room_type_features = [0] * room_types.count()
        for rt in room_type_dist:
            if rt['room_type'] is not None:
                room_type_features[rt['room_type'] - 1] = rt['count']

        # One-hot encoding cho locations
        locations = search_history.values('city').distinct()
        location_features = [0] * locations.count()
        for i, loc in enumerate(location_dist):
            location_features[i] = loc['count']

        # Kết hợp tất cả features
        feature_vector = base_features + room_type_features + location_features
        return np.array(feature_vector, dtype=float)

    def _get_similar_users(self, user_vector, k=5):
        """Tìm k users có vector đặc trưng gần giống nhất"""
        if user_vector is None:
            return []
            
        # Lấy tất cả preferences hiện có
        all_preferences = list(UserPreference.objects.all())  # Convert QuerySet to list
        if not all_preferences:
            return []

        # Xác định kích thước vector lớn nhất
        max_size = max(p.vector_size for p in all_preferences)
        max_size = max(max_size, len(user_vector))

        # Chuẩn bị ma trận features
        X = np.array([
            self._pad_vector(p.feature_vector, max_size) 
            for p in all_preferences
        ])
        
        # Chuẩn hóa vector của user hiện tại
        user_vector = self._pad_vector(user_vector, max_size)

        # Chuẩn hóa dữ liệu
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        user_vector_scaled = scaler.transform(user_vector.reshape(1, -1))

        # Tìm nearest neighbors
        nbrs = NearestNeighbors(n_neighbors=min(k, len(X)), algorithm='auto')
        nbrs.fit(X_scaled)
        
        distances, indices = nbrs.kneighbors(user_vector_scaled)
        
        # Convert numpy.int64 to regular Python int
        similar_users = [all_preferences[int(i)].user for i in indices[0]]
        return similar_users

    @action(methods=['GET'], detail=False, url_path='recommended-rooms')
    def get_recommended_rooms(self, request):
        user = request.user
        
        # 1. Xây dựng vector đặc trưng từ lịch sử tìm kiếm
        user_vector = self._build_feature_vector(user)
        if user_vector is None:
            return self._get_default_recommendations()

        # 2. Lưu vector đặc trưng
        UserPreference.objects.update_or_create(
            user=user,
            defaults={
                'feature_vector': user_vector.tolist(),
                'vector_size': len(user_vector)
            }
        )
        
        # 3. Tìm users tương tự nhưng loại trừ user hiện tại
        similar_users = self._get_similar_users(user_vector)
        if user in similar_users:
            similar_users.remove(user)
        
        if not similar_users:
            return self._get_default_recommendations()

        # 4. Lấy posts dựa trên hành vi tìm kiếm của user hiện tại
        search_history = SearchHistory.objects.filter(user=user).order_by('-last_searched')
        
        if (search_history.exists()):
            recent_search = search_history.first()
            base_query = Q(is_active=True, is_approved=True, is_block=False)
            
            # Lọc theo khoảng giá gần đây
            if recent_search.min_price and recent_search.max_price:
                base_query &= Q(room__price__range=(
                    recent_search.min_price * 0.8,  # Mở rộng range 20%
                    recent_search.max_price * 1.2
                ))
                
            # Lọc theo khoảng diện tích gần đây
            if recent_search.min_area and recent_search.max_area:
                base_query &= Q(room__area__range=(
                    recent_search.min_area * 0.8,
                    recent_search.max_area * 1.2
                ))
                
            # Lọc theo loại phòng
            if recent_search.room_type:
                base_query &= Q(room__room_type=recent_search.room_type)
                
            # Lọc theo khu vực
            if recent_search.city:
                base_query &= Q(room__city=recent_search.city)

            # 5. Kết hợp với posts được yêu thích bởi users tương tự
            recommended_posts = (
                Post.objects
                .filter(base_query)
                .filter(
                    Q(favorited_by__user__in=similar_users) |  # Posts được yêu thích bởi users tương tự
                    Q(user__in=similar_users)                  # Posts được đăng bởi users tương tự
                )
                .distinct()
                .annotate(
                    match_score=Case(
                        # Tăng điểm cho posts phù hợp với tìm kiếm gần đây
                        When(room__room_type=recent_search.room_type, then=3),
                        When(room__city=recent_search.city, then=2),
                        default=1,
                        output_field=models.IntegerField(),
                    ),
                    favorite_count=Count('favorited_by')
                )
                .order_by('-match_score', '-favorite_count', '-created_at')
            )
        else:
            # Nếu không có lịch sử tìm kiếm, lấy posts được yêu thích nhiều
            recommended_posts = (
                Post.objects
                .filter(
                    is_active=True,
                    is_approved=True,
                    is_block=False,
                    favorited_by__user__in=similar_users
                )
                .distinct()
                .annotate(favorite_count=Count('favorited_by'))
                .order_by('-favorite_count', '-created_at')
            )

        # 6. Nếu không đủ đề xuất, bổ sung bằng posts mới
        if not recommended_posts.exists():
            return self._get_default_recommendations()

        serializer = DetailPostSerializer(recommended_posts, many=True)
        return response.Response(serializer.data)

    # def _get_default_recommendations(self):
    #     """Trả về các bài đăng mới nhất khi không có đề xuất phù hợp"""
    #     default_posts = (
    #         Post.objects
    #         .filter(is_active=True, is_approved=True, is_block=False)
    #         .order_by('-created_at')
    #     )
    #     serializer = DetailPostSerializer(default_posts, many=True)
    #     return response.Response(serializer.data)

import hmac
import hashlib
import urllib.parse
class VNPayViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=False, url_path='create_payment')
    def create_payment(self, request):
        post_id = request.data.get('post_id')
        post_type_id = request.data.get('post_type_id') 
        amount = request.data.get('amount')

        if not all([post_id, post_type_id, amount]):
            return response.Response(
                {"error": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create payment record
            post = Post.objects.get(id=post_id)
            post_type = PostType.objects.get(id=post_type_id)
            
            payment = Payment.objects.create(
                user=request.user,
                post=post, 
                post_type=post_type,
                amount=amount,
                payment_method='VNPAY'
            )

            # Format VNPay parameters 
            vnp_params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': settings.VNPAY_TMN_CODE,
                'vnp_Amount': str(int(float(amount) * 100)),
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': str(payment.id),
                'vnp_OrderInfo': 'Thanh toan tin dang',
                'vnp_OrderType': 'billpayment',
                'vnp_Locale': 'vn',
                # URL encode the return URL properly
                'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
                'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),
                'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S')
        }

            # Sort parameters before creating hash
            sorted_params = dict(sorted(vnp_params.items()))
            
            # Create hash data string with URL encoded values
            hash_data = '&'.join([f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in sorted_params.items()])
            
            print("===== DEBUG HASH DATA =====")
            print("Original hash_data:", hash_data)
            print("VNPAY Hash Secret:", settings.VNPAY_HASH_SECRET)

            # Generate secure hash
            secure_hash = hmac.new(
                settings.VNPAY_HASH_SECRET.encode('utf-8'),
                hash_data.encode('utf-8'),
                hashlib.sha512
            ).hexdigest()

            print("Generated secure hash:", secure_hash)
            print("========================")

            # Add secure hash to parameters
            vnp_params['vnp_SecureHash'] = secure_hash

            # Create final payment URL with properly encoded parameters
            encoded_params = '&'.join([f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in vnp_params.items()])
            payment_url = f"{settings.VNPAY_PAYMENT_URL}?{encoded_params}"

            return response.Response({
                "payment_url": payment_url
            })

        except Exception as e:
            return response.Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(methods=['get'], detail=False, url_path='vnpay-return')
    def payment_return(self, request):
        # Kiểm tra kết quả thanh toán từ VNPAY
        vnp_ResponseCode = request.GET.get('vnp_ResponseCode')
        if vnp_ResponseCode == "00":
            # Thanh toán thành công
            payment_id = request.GET.get('vnp_TxnRef').replace('WORD', '')
            try:
                payment = Payment.objects.get(id=payment_id)
                payment.status = Payment.COMPLETED
                payment.transaction_id = request.GET.get('vnp_TransactionNo')
                payment.save()

                # Cập nhật trạng thái đã thanh toán cho bài đăng
                post = payment.post
                post.is_paid = True
                post.save()

                return response.Response({"message": "success"})
            except Payment.DoesNotExist:
                return response.Response(
                    {"message": "failed", "error": "Payment not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Thanh toán thất bại
            return response.Response({"message": "failed"})

    @action(methods=['get'], detail=False, url_path='my-payment')
    def my_payment(self, request):
        try:
            # Get all payments for current user, ordered by creation date descending
            payments = Payment.objects.filter(
                user=request.user
            ).order_by('-created_at')

            # Serialize the payment data
            serializer = PaymentSerializer(payments, many=True)

            return response.Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return response.Response(
                {'error': f'Có lỗi xảy ra: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from django.utils.decorators import method_decorator
from django.views import View
from oauth2_provider.views import TokenView
from rest_framework.decorators import api_view
from django.http import JsonResponse


@api_view(['POST'])
def convert_token_view(request):
    token_view = TokenView.as_view()
    return token_view(request)
