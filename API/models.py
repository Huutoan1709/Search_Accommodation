from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from enum import Enum
from django.conf import settings
from django.utils import timezone

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        abstract = True
#User model

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
    email = models.EmailField(max_length=100, unique=True)
    gender = models.CharField(max_length=6, choices=GENDER)
    role = models.CharField(max_length=30, null=False, choices=ROLES)
    avatar = CloudinaryField(null = True)
    address = models.CharField(max_length=255)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', through='Follow')
    booking = models.ManyToManyField('Rooms', through='Bookings',related_name='booked_users')
    review = models.ManyToManyField('Rooms', through='Reviews',related_name='reviewed_users')

    def __str__(self):
        return str(self.get_full_name())

class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_user')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_following')

    class Meta:
        unique_together = ('follower', 'following')


class RoomType(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

class RoomImage(BaseModel):
    url = CloudinaryField()
    room = models.ForeignKey('Rooms',related_name='Room_Images',on_delete=models.CASCADE)


class Rooms(BaseModel):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('BOOKED', 'Booked'),
        ('UNAVAILABLE', 'Unavailable'),
    ]
    title = models.CharField(max_length=400)
    description = models.TextField()
    price = models.FloatField()
    max_people = models.IntegerField(default=1)
    area = models.FloatField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AVAILABLE')
    landlord = models.ForeignKey(User, related_name='landlord', on_delete=models.CASCADE)
    location = models.ForeignKey('Locations', related_name='Room_Location', on_delete=models.CASCADE)
    room_type = models.ForeignKey('RoomType', related_name='Room_Type', on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)  # Admin approval

    def __str__(self):
        return f"Room: {self.title} by {self.landlord.username}"

class Locations(models.Model):
    address = models.TextField()
    city = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

class Notifications(BaseModel):
    message = models.TextField()
    user = models.ForeignKey('User', related_name='User_Notifications', on_delete=models.SET_NULL, null=True)
    is_read = models.BooleanField(default=False)


class SupportRequests(BaseModel):
    subject = models.CharField(max_length = 255)
    description = models.TextField()
    status = models.BooleanField(default=False)
    user = models.ForeignKey('User', related_name='User_Support', on_delete=models.SET_NULL, null=True)

class Bookings(BaseModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    customer = models.ForeignKey(User, related_name='customer_booking', on_delete=models.CASCADE)
    room = models.ForeignKey('Rooms', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Booking {self.id} by {self.customer.username} - Status: {self.get_status_display()}"
class Reviews(BaseModel):
    customer = models.ForeignKey(User, related_name='Customer_Reviews', on_delete=models.CASCADE)
    room = models.ForeignKey(Rooms, related_name='Room_Reviews', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()

class Contract(BaseModel):
    start_date = models.DateField()
    end_date = models.DateField()
    terms = models.TextField()
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='landlord_contracts')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_contracts')
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE)

class Payment(BaseModel):
    PAYMENT_METHOD_CHOICES = [
        ('VNPay', 'VNPay'),
        ('Momo', 'Momo'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    payment_date = models.DateTimeField(default=timezone.now)
    additional_info = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    def __str__(self):
        return f"Payment {self.transaction_id} by {self.user.username} - {self.get_status_display()}"


