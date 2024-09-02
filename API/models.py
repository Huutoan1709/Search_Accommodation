from django.db import models
from datetime import datetime, timedelta
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from enum import Enum
from django.conf import settings
from django.utils import timezone

EXPIRATION_BOOKING = 2


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


# User model

class User(AbstractUser):
    ROLES = (
        ('CUSTOMER', 'customer'),
        ('LANDLORD', 'landlord'),
        ('WEBMASTER', 'webmaster'),
    )
    GENDER = (
        ('MALE', 'Nam'),
        ('FEMALE', 'Nu'),
        ('OTHER', 'Khac'),
    )
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(max_length=100, unique=True, null=True)
    gender = models.CharField(max_length=6, choices=GENDER)
    role = models.CharField(max_length=30, null=False, choices=ROLES)
    avatar = CloudinaryField(null=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', through='Follow')
    # booking = models.ManyToManyField('Rooms', through='Bookings', related_name='booked_users')
    review = models.ManyToManyField('Post', through='Reviews', related_name='reviewed_users')

    def __str__(self):
        return str(self.get_full_name())


class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_user')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_following')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('follower', 'following')


class RoomType(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.name)


class PostImage(BaseModel):
    url = CloudinaryField()
    post = models.ForeignKey('Post', related_name='Post_Images', on_delete=models.CASCADE)


class Post(BaseModel):
    title = models.CharField(max_length=400)
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Post', on_delete=models.CASCADE)
    room = models.ForeignKey('Rooms', related_name='Room_Post', on_delete=models.CASCADE)

class Amenities(BaseModel):
    name = models.CharField(max_length=50)
    description = models.TextField(blank = True)

    def __str__(self):
        return self.name


class Rooms(BaseModel):
    price = models.FloatField()
    ward = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    area = models.FloatField()
    other_address = models.CharField(max_length=255, default ='',blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    landlord = models.ForeignKey('User', related_name='landlord', on_delete=models.CASCADE)
    room_type = models.ForeignKey('RoomType', related_name='Room_Type', on_delete=models.CASCADE)
    amenities= models.ManyToManyField('Amenities', blank=True, related_name='Room_Amenities')

    def __str__(self):
        return f'Trọ {self.ward} - {self.district} - {self.city}'


class Price(BaseModel):
    PRICE_LABEL_CHOICES = [
        ('WATER', 'Nuoc'),
        ('ELECTRICITY', 'Dien'),
        ('INTERNET', 'Internet'),
        ('OTHER', 'Khac'),
    ]
    label = models.CharField(
        max_length=20,
        choices=PRICE_LABEL_CHOICES,
        default='OTHER'
    )
    name = models.CharField(max_length=100)
    value = models.FloatField()
    room = models.ForeignKey('Rooms', related_name='prices', on_delete=models.CASCADE)


class FavoritePost(BaseModel):
    user = models.ForeignKey(User, related_name='favorite_post', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='favorited_by', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Favorite Post'
        verbose_name_plural = 'Favorite Post'


class Reviews(BaseModel):
    customer = models.ForeignKey('User', related_name='Customer_Reviews', on_delete=models.CASCADE)
    post = models.ForeignKey('Post', related_name='Post_Reviews', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    review_quality = models.IntegerField(default=0)

class SupportRequests(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField()
    is_handle = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Support', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Yêu cầu {self.subject} Từ {str(self.user.get_full_name())}"

