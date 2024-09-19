from .models import User
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer, RoomTypeSerializer, RoomsSerializer, DetailRoomSerializer, PriceSerializer, \
    SupportRequestsSerializer, WriteRoomSerializer, AmenitiesSerializer, PostSerializer, DetailPostSerializer, \
    CreatePostSerializer, PostImageSerializer, ReviewSerializer
from rest_framework import viewsets, generics, response, status, permissions, filters
from rest_framework.decorators import action
from API.models import User, Follow, Rooms, RoomType, Reviews, SupportRequests, FavoritePost, Price, Post, PostImage, \
    Amenities
from django_filters.rest_framework import DjangoFilterBackend
from django.http import QueryDict


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


class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    serializer_class = UserInfoSerializer
    queryset = User.objects.filter(is_active=True)
    pagination_class = paginators.BasePaginator

    def get_permissions(self):
        if self.action in ['get_follower', 'get_following', 'follow', 'current_user', 'my_rooms', 'my_post',
                           'favorite_post', 'my_review', 'my_favorites']:
            return [permissions.IsAuthenticated()]

        if self.action in ['update', 'partial_update']:
            return [perms.IsOwner()]

        return [permissions.AllowAny()]

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

    # Mysupport
    @action(methods=['get'], detail=False, url_path='my-review')
    def my_review(self, request):
        user = request.user
        review = Reviews.objects.filter(customer=user).all()
        serializer = DetailPostSerializer(review, many=True)
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
            queryset = queryset.filter(latitude__range=(lat - 0.03, lat + 0.03),
                                       longitude__range=(lon - 0.03, lon + 0.03))

        return queryset

    def create(self, request, *args, **kwargs):
        # Sao chép dữ liệu từ request.data vào một từ điển Python thông thường
        data = request.data.copy()
        data['landlord'] = request.user.id
        serializer = WriteRoomSerializer(data=data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
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
        motel = self.get_object()
        motel.is_active = False
        motel.save()
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class PostViewSet(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView, generics.DestroyAPIView,
                  generics.RetrieveAPIView):
    pagination_class = paginators.BasePaginator
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['__all__']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.action == 'list':
            return Post.objects.filter(is_active=True, is_approved=True)
        else:
            return Post.objects.filter(is_active=True)
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
        data = QueryDict('', mutable=True)
        data.update(request.data)

        room_id = data.get('room')
        if not room_id:
            return response.Response({'error': 'Room ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room = Rooms.objects.get(id=room_id)
        except Rooms.DoesNotExist:
            return response.Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if a post for this room already exists
        if Post.objects.filter(room=room).exists():
            return response.Response({'error': 'A post for this room has already been created'},
                                     status=status.HTTP_400_BAD_REQUEST)

        # Ensure the user is the landlord of the room
        if room.landlord.id != request.user.id:
            return response.Response({'error': 'Only the landlord of the room can create a post about it'},
                                     status=status.HTTP_403_FORBIDDEN)

        data['user'] = request.user.id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)

        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ['WEBMASTER', 'ADMIN']:
            return response.Response({'error': 'Only admin and webmaster can update this attribute'},
                                     status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    @action(methods=['get'], detail=False, url_path='wait-approved')
    def wait_approved(self, request):
        approved = Post.objects.filter(is_approved=False).all()
        serializer = DetailPostSerializer(approved, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='images')
    def images(self, request, pk =None):
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

    @action(methods=['get'], detail=True, url_path='reviews')
    def get_review(self, request, pk=None):
        post = self.get_object()
        reviews = post.Post_Reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class PriceViewSet(viewsets.ViewSet, DestroySoftAPIView, UpdatePartialAPIView):
    serializer_class = PriceSerializer
    queryset = Price.objects.all()
    # permission_classes = [perms.HasMotelOwnerAuthenticated]


class AmenitiesViewSet(viewsets.ViewSet, generics.ListCreateAPIView, DestroySoftAPIView, UpdatePartialAPIView):
    serializer_class = AmenitiesSerializer
    queryset = Amenities.objects.all()


class RoomTypeViewSet(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView):
    serializer_class = RoomTypeSerializer
    queryset = RoomType.objects.all()


class SupportRequestsViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SupportRequestsSerializer
    queryset = SupportRequests.objects.all()
    pagination_class = paginators.BasePaginator


class ReviewViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    queryset = Reviews.objects.all()
