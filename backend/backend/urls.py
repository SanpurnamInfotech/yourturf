from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Keep Django Admin off /admin/ so the React SPA can own /admin/* routes
# (e.g. /admin, /admin/gallery, /admin/bookings, etc.). Override with DJANGO_ADMIN_PATH in .env if needed.
_admin_path = getattr(settings, 'DJANGO_ADMIN_PATH', 'django-admin/').strip('/') + '/'

urlpatterns = [
    path(_admin_path, admin.site.urls),

    path(
        "api/token/",
        TokenObtainPairView.as_view()
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view()
    ),

    # Booking APIs
    path(
        "api/",
        include("bookings.urls")
    ),

    # Turf APIs
    path(
        "api/",
        include("turf.urls")
    ),

    # Admin Settings APIs
    path(
        "api/settings/",
        include("settings.urls")
    ),

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )