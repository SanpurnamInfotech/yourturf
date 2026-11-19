from django.urls import path

from .views import (
    TurfSettingsAPIView,
    HolidayAPIView,
    HolidayDetailAPIView,
    WebsiteSettingsAPIView,
    OperatingCityAPIView,
    OperatingCityDetailAPIView,
)

urlpatterns = [
    path(
        "",
        TurfSettingsAPIView.as_view(),
        name="turf-settings"
    ),
    path(
        "website/",
        WebsiteSettingsAPIView.as_view(),
        name="website-settings"
    ),
    path(
        "cities/",
        OperatingCityAPIView.as_view(),
        name="operating-cities"
    ),
    path(
        "cities/<int:pk>/",
        OperatingCityDetailAPIView.as_view(),
        name="operating-city-detail"
    ),
    path(
        "holidays/",
        HolidayAPIView.as_view(),
        name="holidays"
    ),
    path(
        "holidays/<int:pk>/",
        HolidayDetailAPIView.as_view(),
        name="holiday-detail"
    ),
]
