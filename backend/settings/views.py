from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import *
from .serializers import *


class TurfSettingsAPIView(APIView):

    def get(self, request):

        settings = TurfSettings.objects.first()

        if not settings:
            settings = TurfSettings.objects.create()

        serializer = TurfSettingsSerializer(settings)

        return Response(serializer.data)

    def put(self, request):

        settings = TurfSettings.objects.first()

        if not settings:
            settings = TurfSettings.objects.create()

        holiday_from = request.data.get("holiday_from")
        holiday_to = request.data.get("holiday_to")

        if (
            holiday_from
            and holiday_to
            and holiday_from > holiday_to
        ):
            return Response(
                {
                    "error": "Holiday From cannot be after Holiday To."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TurfSettingsSerializer(
            settings,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

          serializer.save()

          return Response({
        "message": "Settings Updated Successfully",
        "settings": serializer.data
    })

        print(serializer.errors)

        return Response(
    serializer.errors,
    status=status.HTTP_400_BAD_REQUEST
)


class HolidayAPIView(APIView):

    def get(self, request):

        holidays = Holiday.objects.all()

        serializer = HolidaySerializer(
            holidays,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = HolidaySerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)


class HolidayDetailAPIView(APIView):

    def put(self, request, pk):

        holiday = Holiday.objects.get(id=pk)

        serializer = HolidaySerializer(
            holiday,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)

    def delete(self, request, pk):

        Holiday.objects.filter(
            id=pk
        ).delete()

        return Response({
            "message": "Holiday deleted successfully."
        })    