from .models import User
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer, RoomTypeSerializer, RoomsSerializer, DetailRoomSerializer, PriceSerializer, \
    SupportRequestsSerializer, WriteRoomSerializer, AmenitiesSerializer, PostSerializer, DetailPostSerializer, \
    CreatePostSerializer, PostImageSerializer, ReviewSerializer, CreateReviewSerializer
from rest_framework import viewsets, generics, response, status, permissions, filters
from rest_framework.decorators import action
from API.models import User, Follow, Rooms, RoomType, Reviews, SupportRequests, FavoritePost, Price, Post, PostImage, \
    Amenities, PasswordResetOTP
from django_filters.rest_framework import DjangoFilterBackend
from django.http import QueryDict
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password, make_password


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

    # Mysupport
    @action(methods=['get'], detail=True, url_path='review')
    def get_reviews(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)  # Lấy user theo id từ đường dẫn
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
            queryset = queryset.filter(latitude__range=(lat - 0.03, lat + 0.03),
                                       longitude__range=(lon - 0.03, lon + 0.03))

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
        queryset = Post.objects.filter(is_active = True, is_approved=True,is_block = False)

        # Kiểm tra nếu có param 'all=true' thì bỏ qua các filter mặc định
        if self.request.query_params.get('all', None) == 'true':
            queryset = Post.objects.all()
        if self.action in ['destroy', 'partial_update']:
            queryset = Post.objects.all()
        if(self.action) in ['images']:
            queryset = Post.objects.filter(is_active= True)

        # Lấy các giá trị từ query params
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        min_area = self.request.query_params.get('min_area', None)
        max_area = self.request.query_params.get('max_area', None)
        ward = self.request.query_params.get('ward', None)
        district = self.request.query_params.get('district', None)
        city = self.request.query_params.get('city', None)
        room_type = self.request.query_params.get('room_type', None)
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
        # Chỉ lọc những bài đăng đã duyệt khi action là 'list'
        if self.action == 'list':
            queryset = queryset.filter(is_approved=True)

        return queryset

    def get_permissions(self):
        if self.action == 'list':
            # Bất kỳ người dùng nào đều có thể xem danh sách bài đăng
            return [permissions.AllowAny()]

        if self.action in ['create', 'partial_update', 'update','destroy']:
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
        approved = Post.objects.filter(is_approved=False, is_block = False).all()
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


class ReviewViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]  # Yêu cầu phải đăng nhập

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
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.core.mail import send_mail
from django.utils import timezone
from .models import User, PasswordResetOTP


class ResetPasswordViewSet(viewsets.ViewSet):
    def create(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(email=email)

            if otp:  # Nếu người dùng đã nhập OTP, thực hiện xác thực và reset mật khẩu
                otp_instance = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).last()

                if not otp_instance:
                    return Response({'error': 'OTP không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

                if otp_instance.expires_at < timezone.now():
                    return Response({'error': 'OTP đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)

                # Đặt lại mật khẩu
                user.set_password(new_password)
                user.save()

                # Đánh dấu OTP đã sử dụng
                otp_instance.is_used = True
                otp_instance.save()

                return Response({'message': 'Mật khẩu đã được đặt lại thành công.'}, status=status.HTTP_200_OK)

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
