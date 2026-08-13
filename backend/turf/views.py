from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser , FormParser

from .models import *
from .serializers import *

from django.shortcuts import get_object_or_404


class TurfAPIView(APIView):

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):

        turf = Turf.objects.first()

        serializer = TurfSerializer(
            turf,
            context={
                "request": request
            }
        )

        return Response(serializer.data)

    def put(self, request):

        turf = Turf.objects.first()

        if not turf:
            return Response(
            {
                "error": "Turf information not found."
            },
            status=404
            )

        serializer = TurfSerializer(
    turf,
    data=request.data,
    partial=True,
    context={
        "request": request
    }
)

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
        )

        return Response(
            serializer.errors,
            status=400
       )
    
class TurfGalleryAPIView(APIView):

    def get(self, request):

        images = TurfImage.objects.all()

        serializer = TurfImageSerializer(
            images,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data
        )

class TurfImageUploadAPIView(APIView):

    parser_classes = [MultiPartParser]

    def post(self, request):

        serializer = (
            TurfImageUploadSerializer(
                data=request.data
            )
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "message":
                "Image Uploaded Successfully"
            })

        return Response(
            serializer.errors,
            status=400
        )


class TurfImageDeleteAPIView(APIView):

    def delete(self, request, image_id):

        image = get_object_or_404(
            TurfImage,
            id=image_id
        )

        image.delete()

        return Response({
            "message": "Image Deleted Successfully"
        })