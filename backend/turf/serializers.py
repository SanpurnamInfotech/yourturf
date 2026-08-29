from rest_framework import serializers
from .models import Turf, TurfImage, TurfClosure


class TurfSerializer(serializers.ModelSerializer):

    main_image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    about_image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Turf
        fields = "__all__"

    def to_representation(self, instance):

        data = super().to_representation(instance)

        request = self.context.get("request")


        # Main Website Image
        if instance.main_image:

            if request:

                data["main_image"] = request.build_absolute_uri(
                    instance.main_image.url
                )

            else:

                data["main_image"] = instance.main_image.url

        else:

            data["main_image"] = None


        # About Section Image
        if instance.about_image:

            if request:

                data["about_image"] = request.build_absolute_uri(
                    instance.about_image.url
                )

            else:

                data["about_image"] = instance.about_image.url

        else:

            data["about_image"] = None


        return data


# For displaying images
class TurfImageSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    class Meta:
        model = TurfImage
        fields = ["id", "image", "uploaded_on"]

    def get_image(self, obj):

        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.image.url
            )

        return obj.image.url


# For uploading images
class TurfImageUploadSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = TurfImage
        fields = ["image"]


class TurfClosureSerializer(serializers.ModelSerializer):

    class Meta:
        model = TurfClosure
        fields = [
            "id",
            "turf",
            "date",
            "start_time",
            "end_time",
            "is_full_day",
            "reason",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]