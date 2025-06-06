import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-hcir*ovge^5yd#1kijji1tf44@!zaa@c$l1w87lz7_1x4edos&'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
ALLOWED_HOSTS = ['*', '.onrender.com']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'API.apps.ApiConfig',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider',
    'social_django',
    'cloudinary_storage',
    'cloudinary',
    'django_filters',
    'corsheaders',
    'django.contrib.humanize',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Thêm ngay sau security middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Search_accommodation.urls'
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-domain.vercel.app"  # Thêm domain frontend của bạn
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Cấu hình Whitenoise đơn giản hơn
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
WSGI_APPLICATION = 'Search_accommodation.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
import pymysql

pymysql.install_as_MySQLdb()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'accommodationdb',
        'USER': 'root',
        'PASSWORD': 'Huutoan123@',
        'HOST': 'localhost',
        'PORT': '3306',
        }
    }

# Password validati
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Configure Django Filter Backend
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    # 'DEFAULT_PERMISSION_CLASSES': (
    #     'rest_framework.permissions.IsAuthenticated',
    # ),
}
# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_TZ = True
USE_I18N = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = "API.User"

import cloudinary

cloudinary.config(
    cloud_name='daf0utpgr',
    api_key='289778753498617',
    api_secret='zby6hktt9jdExd3hxriUakdhrqQ',
    secure=True
)
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'


# Settings send_emails
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'nguyenhuutoan010@gmail.com'
EMAIL_HOST_PASSWORD = 'vosoawnodgzbcqzk'

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2', 
    'django.contrib.auth.backends.ModelBackend',
)

TWILIO_ACCOUNT_SID = 'ACbc16b89dcec68c049959fc4e19308a1d'
TWILIO_AUTH_TOKEN = 'c76450bf2cad3c6f9ea4d4c1428c7957'
TWILIO_PHONE_NUMBER = '+18382312114'


# VNPay Configuration
VNPAY_TMN_CODE = "WGJBLJR3"  
VNPAY_HASH_SECRET = "U3LUJWFRKPKVXYIM0R1V5OF8R6TLVCZ4" 
VNPAY_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL = "http://localhost:3000/payment/vnpay-return"



RECAPTCHA_SECRET_KEY = '6Lf8S1YrAAAAADWdTOYdaXMH1a86b165PyKj2JVV'


CLIENT_ID = '7gS8oCrdq9x2rfSnqgPG27zdPWsPbA82erZThYH0'
CLIENT_SECRET = 'NwUGjlwU12WU7wxyWjv6tbbEK7oV8dl3CHoXNRIBruwT3cPZc8lpc5RJzJhBCdfKQKpy2F6xUzIxlVgb9m0gBphmVHLSupWIFTBkdWU6R8hNrJNOacOA6tEH220Hk9i0'

