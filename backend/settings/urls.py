from django.urls import path

from .views import *


urlpatterns = [

    path(
        "",
        TurfSettingsAPIView.as_view(),
        name="turf-settings"
    ),

    path(
    "holidays/",
    HolidayAPIView.as_view(),
    ),

    path(
        "holidays/<int:pk>/",
         HolidayDetailAPIView.as_view(),
    ),

]