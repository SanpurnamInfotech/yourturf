from rest_framework import serializers

from .models import TurfSettings, Holiday, WebsiteSettings, OperatingCity


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


class WebsiteSettingsSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True)
    hero_image = serializers.ImageField(required=False, allow_null=True)
    about_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = WebsiteSettings
        fields = [
            "id",
            "site_name",
            "logo",
            "hero_image",
            "about_image",
            "contact_phone",
            "contact_email",
            "updated_on",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        for img_field in ["logo", "hero_image", "about_image"]:
            field_val = getattr(instance, img_field, None)
            if field_val and hasattr(field_val, "url"):
                if request:
                    data[img_field] = request.build_absolute_uri(field_val.url)
                else:
                    data[img_field] = field_val.url
            else:
                data[img_field] = None

        return data


class OperatingCitySerializer(serializers.ModelSerializer):
    turf_count = serializers.SerializerMethodField()

    class Meta:
        model = OperatingCity
        fields = ["id", "name", "turf_count", "created_at"]

    def get_turf_count(self, obj):
        from turf.models import Turf
        from django.db.models import Q
        return Turf.objects.filter(
            Q(city__iexact=obj.name) | Q(location__icontains=obj.name)
        ).count()

