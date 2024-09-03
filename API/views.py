from .models import User
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer, RoomTypeSerializer, RoomsSerializer, DetailRoomSerializer, PriceSerializer, \
    SupportRequestsSerializer, WriteRoomSerializer, AmenitiesSerializer, PostSerializer, DetailPostSerializer, \
    CreatePostSerializer,PostImageSerializer
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

    @action(methods=['get', 'patch', 'delete'], url_path='current_user', detail=False)
    def current_user(self, request):
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

    # MYPOST

    # Mysupport

    # Myreview


class RoomViewSet(viewsets.ViewSet, UpdatePartialAPIView, generics.ListCreateAPIView, generics.RetrieveDestroyAPIView):
    # serializer_class = RoomsSerializer
    # queryset = Rooms.objects.all()
    pagination_class = paginators.BasePaginator
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['price', 'ward', 'district', 'city', 'other_address', 'description']
    filterset_fields = ['price', 'ward', 'district', 'city', 'other_address', 'area']
    ordering_fields = ['price', 'area']
    ordering = ['price']

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
        request.data['landlord'] = request.user.id
        serializer = WriteRoomSerializer(data=request.data, context={'request': request})
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

    # @action(methods=['post'], detail=True)
    # def add_amenities(self, request, pk=None):
    #     room = self.get_object()
    #     amenities_data = request.data.get('amenities', [])
    #     amenities_objects = []
    #
    #     for amenity_id in amenities_data:
    #         try:
    #             amenity = Amenities.objects.get(id=amenity_id)
    #             amenities_objects.append(amenity)
    #         except Amenities.DoesNotExist:
    #             return response.Response({'error': f'Amenity with id {amenity_id} not found'},
    #                                      status=status.HTTP_404_NOT_FOUND)
    #
    #     room.amenities.set(amenities_objects)
    #     room.save()
    #
    #     serializer = DetailRoomSerializer(room)
    #     return response.Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        motel = self.get_object()
        motel.is_active = False
        motel.save()
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class PostViewSet(viewsets.ViewSet, generics.ListCreateAPIView, UpdatePartialAPIView):
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    def get_serializer_class(self):
        if self.action.__eq__('list'):
            return PostSerializer
        if self.action.__eq__('post'):
            return CreatePostSerializer
        return DetailPostSerializer

    def create(self, request, *args, **kwargs):
        data = QueryDict('', mutable=True)
        data.update(request.data)

        data['user'] = request.user.id

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='images')
    def images(self, request, pk):
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
