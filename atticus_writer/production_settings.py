import os
from .settings import *

# Security Settings for Production
DEBUG = False  # Set to False for production
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
ALLOWED_HOSTS = [
    '.railway.app',
    'web-production-42009.up.railway.app',
    '.up.railway.app',
    '.onrender.com',
    '.herokuapp.com',
    'localhost',
    '127.0.0.1',
    '*'  # Temporary for debugging
]

# Add your domain when you have it
if os.environ.get('DOMAIN'):
    ALLOWED_HOSTS.append(os.environ.get('DOMAIN'))

# Database - Use PostgreSQL in production
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# Static files (CSS, JavaScript, Images)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security - Disabled temporarily for debugging
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = [
    'https://web-production-42009.up.railway.app',
    'https://*.up.railway.app',
    'https://*.railway.app',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# Add whitenoise middleware for static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')