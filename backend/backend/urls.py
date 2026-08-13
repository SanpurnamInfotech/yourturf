from django.contrib import admin

from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [


    path("admin/", admin.site.urls),

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

]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)