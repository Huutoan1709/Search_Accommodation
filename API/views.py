
from .models import User
from API import serializers, perms, paginators
from .serializers import UserInfoSerializer,UserSerializer
from rest_framework import viewsets, generics, response, status, permissions, filters
from rest_framework.decorators import action
from API.models import User,Follow,Rooms,RoomType,RoomImage


class UserViewSet(viewsets.ViewSet,generics.CreateAPIView,generics.RetrieveAPIView):
    serializer_class = UserInfoSerializer
    queryset = User.objects.filter(is_active =True)
    pagination_class = paginators.BasePaginator

    @action(methods=['get'], detail=False)
    def list_users(self, request):
        users = self.queryset
        serializer = self.get_serializer(users, many=True)
        return response.Response(serializer.data)

    @action(methods=['get', 'patch', 'delete'], url_path='current_user', detail=False)
    def current_user(self,request):
        if request.method.__eq__('DELETE'):
            user = request.user
            user.is_active = False
            user.save()
            return response.Respone(status=status.HTTP_204_NO_CONTENT)
        elif request.method.__eq__('PATCH'):
            user = request.user
            for key,value in request.data.items():
                setattr(user, key, value)
            user.save()
        return response.Respone(UserInfoSerializer(request.user).data)

    # @action(method='get',url_path='followers',detail=True)
    # def get_follower(self,request, pk):
    #     followers = Follows.objects.filter(following=self.get_object(), is_active=True).all()
    #     serializer = serializers.UserSerializer([follow.follower for follow in followers], many=True)
    #
    #     return response.Response(serializer.data, status.HTTP_200_OK)


