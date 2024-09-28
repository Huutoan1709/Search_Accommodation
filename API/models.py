from django.db import models
from datetime import datetime, timedelta
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from enum import Enum
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
import random
import string
from django.core.validators import MinValueValidator, MaxValueValidator

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
    gender = models.CharField(max_length=6, choices=GENDER, default='MALE')
    role = models.CharField(max_length=30, null=False, choices=ROLES, default='CUSTOMER')
    avatar = CloudinaryField(default='avatar_default', blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', through='Follow')
    reviews_landlord = models.ManyToManyField('Reviews', related_name='reviewed_users', blank=True)

    def __str__(self):
        return str(self.get_full_name())


class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_user')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_following')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('follower', 'following')


class RoomType(BaseModel):
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
    is_block = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Post', on_delete=models.CASCADE)
    room = models.ForeignKey('Rooms', related_name='Room_Post', on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.title} + {self.room}'


class Amenities(BaseModel):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    quanlity = models.IntegerField(default=1)

    def __str__(self):
        return self.name


class Rooms(BaseModel):
    price = models.FloatField()
    ward = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    area = models.FloatField()
    other_address = models.CharField(max_length=255, default='', blank=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    landlord = models.ForeignKey('User', related_name='landlord', on_delete=models.CASCADE)
    room_type = models.ForeignKey('RoomType', related_name='Room_Type', on_delete=models.CASCADE)
    amenities = models.ManyToManyField('Amenities', blank=True, related_name='Room_Amenities')

    def has_post(self):
        return self.Room_Post.exists()

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
    landlord = models.ForeignKey('User', related_name='Landlord_Reviews', on_delete=models.CASCADE, null=True)  # Thay đổi ở đây
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])  # Số sao chung
    comment = models.TextField()  # Nội dung đánh giá
    created_at = models.DateTimeField(auto_now_add=True)
    selected_criteria = models.ManyToManyField('ReviewCriterion', blank=True, related_name='Selected_Reviews')  # Chọn tiêu chí

    def __str__(self):
        return f"Đánh giá từ {self.customer} cho {self.landlord}"


class ReviewCriterion(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)  # Mô tả chi tiết về tiêu chí

    def __str__(self):
        return self.name


class SupportRequests(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField()
    is_handle = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Support', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Yêu cầu {self.subject} Từ {str(self.user.get_full_name())}"


User = get_user_model()


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)  # Ví dụ: thiết lập giá trị mặc định
        super().save(*args, **kwargs)

    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        self.save()

    def __str__(self):
        return f"OTP for {self.user.email}"
