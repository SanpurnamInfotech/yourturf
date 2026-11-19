from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import TurfSettings, Holiday, WebsiteSettings, OperatingCity
from .serializers import (
    TurfSettingsSerializer,
    HolidaySerializer,
    WebsiteSettingsSerializer,
    OperatingCitySerializer,
)
from turf.models import Turf


class TurfSettingsAPIView(APIView):

    def get(self, request):
        turf_id = request.GET.get("turf_id")
        if turf_id:
            turf = get_object_or_404(Turf, id=turf_id)
            settings_obj = TurfSettings.objects.filter(turf=turf).first()
            if not settings_obj:
                settings_obj = TurfSettings.objects.create(
                    turf=turf,
                    day_price=turf.day_price,
                    night_price=turf.night_price,
                )
        else:
            settings_obj = TurfSettings.objects.first()
            if not settings_obj:
                first_turf = Turf.objects.first()
                settings_obj = TurfSettings.objects.create(
                    turf=first_turf,
                    day_price=first_turf.day_price if first_turf else 800,
                    night_price=first_turf.night_price if first_turf else 1000,
                )

        serializer = TurfSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        turf_id = request.data.get("turf_id") or request.GET.get("turf_id")
        if turf_id:
            turf = get_object_or_404(Turf, id=turf_id)
            settings_obj = TurfSettings.objects.filter(turf=turf).first()
            if not settings_obj:
                settings_obj = TurfSettings.objects.create(turf=turf)
        else:
            settings_obj = TurfSettings.objects.first()
            if not settings_obj:
                first_turf = Turf.objects.first()
                settings_obj = TurfSettings.objects.create(turf=first_turf)

        holiday_from = request.data.get("holiday_from")
        holiday_to = request.data.get("holiday_to")

        if holiday_from and holiday_to and str(holiday_from) > str(holiday_to):
            return Response(
                {"error": "Holiday From cannot be after Holiday To."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TurfSettingsSerializer(
            settings_obj,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            saved_settings = serializer.save()

            # Sync day_price & night_price to Turf model if linked
            target_turf = saved_settings.turf or (Turf.objects.filter(id=turf_id).first() if turf_id else Turf.objects.first())
            if target_turf:
                target_turf.day_price = saved_settings.day_price
                target_turf.night_price = saved_settings.night_price
                target_turf.save()

            return Response({
                "message": "Settings Updated Successfully",
                "settings": serializer.data
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class HolidayAPIView(APIView):

    def get(self, request):
        turf_id = request.GET.get("turf_id")
        if turf_id:
            holidays = Holiday.objects.filter(turf_id=turf_id)
        else:
            holidays = Holiday.objects.all()

        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        if not data.get("turf") and data.get("turf_id"):
            data["turf"] = data.get("turf_id")
        elif not data.get("turf"):
            first_turf = Turf.objects.first()
            if first_turf:
                data["turf"] = first_turf.id

        serializer = HolidaySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HolidayDetailAPIView(APIView):

    def put(self, request, pk):
        holiday = get_object_or_404(Holiday, id=pk)
        serializer = HolidaySerializer(holiday, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        holiday = get_object_or_404(Holiday, id=pk)
        holiday.delete()
        return Response({"message": "Holiday deleted successfully."})


class WebsiteSettingsAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        obj = WebsiteSettings.get_settings()
        serializer = WebsiteSettingsSerializer(obj, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)

    def patch(self, request):
        obj = WebsiteSettings.get_settings()
        serializer = WebsiteSettingsSerializer(
            obj,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Website settings updated successfully.",
                "settings": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OperatingCityAPIView(APIView):
    def get(self, request):
        cities = OperatingCity.objects.all().order_by("name")
        serializer = OperatingCitySerializer(cities, many=True)
        return Response(serializer.data)

    def post(self, request):
        raw_name = request.data.get("name", "").strip()
        if not raw_name:
            return Response(
                {"error": "City name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Title case the city name e.g. "pune" -> "Pune"
        formatted_name = raw_name.title()

        if OperatingCity.objects.filter(name__iexact=formatted_name).exists():
            return Response(
                {"error": f"City '{formatted_name}' already exists in operating cities."},
                status=status.HTTP_400_BAD_REQUEST
            )

        city = OperatingCity.objects.create(name=formatted_name)
        serializer = OperatingCitySerializer(city)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OperatingCityDetailAPIView(APIView):
    def put(self, request, pk):
        city = get_object_or_404(OperatingCity, id=pk)
        raw_name = request.data.get("name", "").strip()
        if not raw_name:
            return Response(
                {"error": "City name cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        formatted_name = raw_name.title()

        if OperatingCity.objects.filter(name__iexact=formatted_name).exclude(id=city.id).exists():
            return Response(
                {"error": f"City '{formatted_name}' already exists in operating cities."},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_name = city.name
        city.name = formatted_name
        city.save()

        # Update existing turfs that had the old city name to keep them in sync
        if old_name and old_name.lower() != formatted_name.lower():
            Turf.objects.filter(city__iexact=old_name).update(city=formatted_name)

        serializer = OperatingCitySerializer(city)
        return Response({
            "message": f"City updated to '{formatted_name}' successfully.",
            "city": serializer.data
        })

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        city = get_object_or_404(OperatingCity, id=pk)
        city_name = city.name
        city.delete()
        return Response({"message": f"City '{city_name}' removed successfully."})

