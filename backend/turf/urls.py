from django.urls import path
from .views import (
    TurfAPIView,
    TurfListCreateAPIView,
    TurfDetailAPIView,
    TurfGalleryAPIView,
    TurfImageUploadAPIView,
    TurfImageDeleteAPIView,
    TurfClosureAPIView,
    TurfClosureDeleteAPIView,
)

urlpatterns = [
    # Multi-turf endpoints
    path("turfs/", TurfListCreateAPIView.as_view(), name="turfs-list-create"),
    path("turfs/<int:pk>/", TurfDetailAPIView.as_view(), name="turf-detail"),

    # Backward-compatible single-turf endpoint (supports ?turf_id=X)
    path("turf/", TurfAPIView.as_view(), name="turf"),

    # Gallery endpoints
    path("gallery/", TurfGalleryAPIView.as_view(), name="gallery"),
    path("upload-image/", TurfImageUploadAPIView.as_view(), name="upload-image"),
    path("delete-image/<int:image_id>/", TurfImageDeleteAPIView.as_view(), name="delete-image"),

    # Closures endpoints
    path("closures/", TurfClosureAPIView.as_view(), name="closures"),
    path("closures/<int:closure_id>/", TurfClosureDeleteAPIView.as_view(), name="delete-closure"),
]