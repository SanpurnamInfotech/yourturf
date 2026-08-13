from rest_framework import serializers

from .models import *


class TurfSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = TurfSettings

        fields = [
            "id",
            "day_price",
            "night_price",
            "holiday_from",
            "holiday_to",
            "holiday_reason",
            "updated_on",
        ]

class HolidaySerializer(serializers.ModelSerializer):

    class Meta:

        model = Holiday

        fields = "__all__"