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
from django.db.models import UniqueConstraint


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
    is_block = models.BooleanField(default=False)
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

class PostVideo(BaseModel):
    video = CloudinaryField(resource_type='video', null=True, blank=True)
    post = models.OneToOneField('Post', related_name='Post_Video', on_delete=models.CASCADE)

    def __str__(self):
        return f"Video for Post: {self.post.title}"


class Post(BaseModel):
    title = models.CharField(max_length=400)
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    is_block = models.BooleanField(default=False) 
    user = models.ForeignKey('User', related_name='User_Post', on_delete=models.CASCADE)
    room = models.ForeignKey('Rooms', related_name='Room_Post', on_delete=models.CASCADE)
    is_paid = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    post_type = models.ForeignKey('PostType', on_delete=models.SET_NULL, null=True)
    is_expired = models.BooleanField(default=False)  # Thêm trường mới

    def save(self, *args, **kwargs):
        # Kiểm tra trạng thái hết hạn khi lưu
        if self.expires_at and self.is_paid:
            self.is_expired = timezone.now() > self.expires_at
        super().save(*args, **kwargs)

    @property
    def check_expired(self):
        # Property để kiểm tra trạng thái hết hạn realtime
        if self.expires_at and self.is_paid:
            return timezone.now() > self.expires_at
        return False

    def __str__(self):
        return f'{self.title} + {self.room}'


class PostType(BaseModel):
    NORMAL = 'NORMAL'
    VIP = 'VIP'
    TYPE_CHOICES = [
        (NORMAL, 'Normal'),
        (VIP, 'VIP')
    ]
    name = models.CharField(max_length=50, choices=TYPE_CHOICES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Thời hạn đăng bài (ngày)")
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.price}đ"



class Payment(BaseModel):
    PENDING = 'PENDING'
    COMPLETED = 'COMPLETED'
    FAILED = 'FAILED'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'), 
        (FAILED, 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    post_type = models.ForeignKey(PostType, on_delete=models.CASCADE, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    payment_url = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Payment {self.id} - {self.status}"
    
    
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
    landlord = models.ForeignKey('User', related_name='Landlord_Reviews', on_delete=models.CASCADE, null=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])  # Số sao chung
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    selected_criteria = models.ManyToManyField('ReviewCriterion', blank=True, related_name='Selected_Reviews')

    def __str__(self):
        return f"Đánh giá từ {self.customer} cho {self.landlord}"

    class Meta:
        constraints = [
            UniqueConstraint(fields=['customer', 'landlord'], name='unique_customer_landlord_review')
        ]



class ReviewCriterion(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class SupportRequests(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField()
    is_handle = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Support', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Yêu cầu {self.subject}"


User = get_user_model()


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        self.save()

    def __str__(self):
        return f"OTP for {self.user.email}"


class PhoneOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        super().save(*args, **kwargs)

    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        self.save()

        
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('POST_APPROVED', 'Bài đăng được duyệt'),
        ('NEW_REVIEW', 'Đánh giá mới'),
        ('NEW_FOLLOWER', 'Người theo dõi mới'),
        ('NEW_MESSAGE', 'Tin nhắn mới')
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


class SearchHistory(BaseModel):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    room_type = models.ForeignKey('RoomType', null=True, on_delete=models.SET_NULL)
    min_price = models.FloatField(null=True, db_index=True)
    max_price = models.FloatField(null=True, db_index=True)
    min_area = models.FloatField(null=True, db_index=True)
    max_area = models.FloatField(null=True, db_index=True)
    city = models.CharField(max_length=255, blank=True, db_index=True)
    district = models.CharField(max_length=255, blank=True)
    ward = models.CharField(max_length=255, blank=True)
    search_count = models.IntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-search_count', '-last_searched']
        indexes = [
            models.Index(fields=['user', '-last_searched']),
            models.Index(fields=['room_type', 'city']),
        ]


class UserPreference(BaseModel):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    feature_vector = models.JSONField()
    vector_size = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_updated']