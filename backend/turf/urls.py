from django.urls import path
from .views import *

urlpatterns = [

    path(
        'turf/',
        TurfAPIView.as_view(),
        name='turf'
    ),

    path(
        'gallery/',
        TurfGalleryAPIView.as_view(),
        name='gallery'
    ),

    path(
        'upload-image/',
        TurfImageUploadAPIView.as_view(),
        name='upload-image'
    ),

    path(
        'delete-image/<int:image_id>/',
        TurfImageDeleteAPIView.as_view(),
        name='delete-image'
    ),

]