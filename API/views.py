from .models import User
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer, UserSerializer, RoomsSerializer, RoomTypeSerializer, RoomImageSerializer, \
    DetailRoomSerializer
from rest_framework import viewsets, generics, response, status, permissions, filters
from rest_framework.decorators import action
from API.models import User, Follow, Rooms, RoomType, RoomImage


# from django_filters.rest_framework import DjangoFilterBackend


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = UserInfoSerializer
    queryset = User.objects.filter(is_active=True)
    pagination_class = paginators.BasePaginator

    @action(methods=['get'], detail=False, url_path='list-user')
    def list_users(self, request):
        users = self.queryset
        serializer = self.get_serializer(users, many=True)
        return response.Response(serializer.data)

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
        following = Follow.objects.filter(follower=self.get_object(), is_active=True).all()
        serializer = serializers.UserSerializer([follow.following for follow in following], many=True)

        return response.Response(serializer.data, status.HTTP_200_OK)

    @action(methods=['get'], url_path='followers', detail=True)
    def get_follower(self, request, pk):
        followers = Follow.objects.filter(following=self.get_object(), is_active=True).all()
        serializer = serializers.UserSerializer([follow.follower for follow in followers], many=True)

        return response.Response(serializer.data, status.HTTP_200_OK)


class RoomViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveDestroyAPIView):
    serializer_class = RoomsSerializer
    queryset = Rooms.objects.all()
    pagination_class = paginators.BasePaginator
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action.__eq__('list'):
            return RoomsSerializer
        return DetailRoomSerializer

    @action(methods=['post'], detail=True, url_path='images')
    def create_images(self, request, pk):
        if request.method.__eq__('POST'):
            images = request.FILES.getlist('images')
            uploaded_images = []
            for image in images:
                i = RoomImage.objects.create(url=image, room=self.get_object())
                uploaded_images.append(i)

            return response.Response(serializers.RoomImageSerializer(uploaded_images, many=True).data,
                                     status=status.HTTP_200_OK)

        return response.Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['patch'], url_path='update-room')
    def update_room(self, request, pk=None):
        room = self.get_object()
        serializer = RoomsSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_200_OK)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomImageViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    serializer_class = RoomImageSerializer
    queryset = RoomImage.objects.all()


class RoomTypeViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    serializer_class = RoomTypeSerializer
    queryset = RoomType.objects.all()
