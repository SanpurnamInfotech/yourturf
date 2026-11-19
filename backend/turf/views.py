from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Turf, TurfImage, TurfClosure
from .serializers import (
    TurfSerializer,
    TurfImageSerializer,
    TurfImageUploadSerializer,
    TurfClosureSerializer,
)


class TurfListCreateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        include_inactive = request.GET.get("all", "false").lower() == "true"
        if include_inactive:
            turfs = Turf.objects.all().order_by("id")
        else:
            turfs = Turf.objects.filter(is_active=True).order_by("id")

        serializer = TurfSerializer(
            turfs,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = TurfSerializer(
            data=request.data,
            context={"request": request}
        )
        if serializer.is_valid():
            turf = serializer.save()
            return Response(
                TurfSerializer(turf, context={"request": request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TurfDetailAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, pk):
        turf = get_object_or_404(Turf, pk=pk)
        serializer = TurfSerializer(turf, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        turf = get_object_or_404(Turf, pk=pk)
        serializer = TurfSerializer(
            turf,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        turf = get_object_or_404(Turf, pk=pk)
        # Toggle or deactivate rather than hard delete if bookings exist
        if turf.bookings.exists():
            turf.is_active = False
            turf.save()
            return Response({
                "message": f"Turf '{turf.name}' has historical bookings, so it was deactivated."
            })
        turf.delete()
        return Response({"message": "Turf deleted successfully."})


class TurfAPIView(APIView):
    """
    Backward-compatible single turf endpoint.
    Accepts ?turf_id=X, otherwise defaults to the first active turf.
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        turf_id = request.GET.get("turf_id")
        if turf_id:
            turf = get_object_or_404(Turf, id=turf_id)
        else:
            turf = Turf.objects.filter(is_active=True).first() or Turf.objects.first()

        if not turf:
            return Response(
                {"error": "No turf found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TurfSerializer(turf, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        turf_id = request.data.get("turf_id") or request.GET.get("turf_id")
        if turf_id:
            turf = get_object_or_404(Turf, id=turf_id)
        else:
            turf = Turf.objects.first()

        if not turf:
            return Response(
                {"error": "Turf information not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TurfSerializer(
            turf,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TurfGalleryAPIView(APIView):
    def get(self, request):
        turf_id = request.GET.get("turf_id")
        if turf_id:
            images = TurfImage.objects.filter(turf_id=turf_id).order_by("-uploaded_on")
        else:
            images = TurfImage.objects.all().order_by("-uploaded_on")

        serializer = TurfImageSerializer(
            images,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)


class TurfImageUploadAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data.copy()
        # If turf not specified, default to primary turf
        if not data.get("turf") and not data.get("turf_id"):
            default_turf = Turf.objects.first()
            if default_turf:
                data["turf"] = default_turf.id
        elif data.get("turf_id") and not data.get("turf"):
            data["turf"] = data.get("turf_id")

        serializer = TurfImageUploadSerializer(data=data)
        if serializer.is_valid():
            image_obj = serializer.save()
            return Response(
                {
                    "message": "Image Uploaded Successfully",
                    "image": TurfImageSerializer(image_obj, context={"request": request}).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TurfImageDeleteAPIView(APIView):
    def delete(self, request, image_id):
        image = get_object_or_404(TurfImage, id=image_id)
        image.delete()
        return Response({"message": "Image Deleted Successfully"})


class TurfClosureAPIView(APIView):
    def get(self, request):
        turf_id = request.GET.get("turf_id")
        if turf_id:
            closures = TurfClosure.objects.filter(turf_id=turf_id).order_by("date", "start_time")
        else:
            closures = TurfClosure.objects.all().order_by("date", "start_time")

        serializer = TurfClosureSerializer(closures, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        # If turf not in payload, check turf_id or default to primary
        if not data.get("turf"):
            if data.get("turf_id"):
                data["turf"] = data.get("turf_id")
            else:
                default_turf = Turf.objects.first()
                if default_turf:
                    data["turf"] = default_turf.id

        serializer = TurfClosureSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TurfClosureDeleteAPIView(APIView):
    def delete(self, request, closure_id):
        closure = get_object_or_404(TurfClosure, id=closure_id)
        closure.delete()
        return Response({"message": "Closure Deleted Successfully"})