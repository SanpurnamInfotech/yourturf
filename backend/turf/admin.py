from django.contrib import admin
from .models import Turf, TurfImage


@admin.register(Turf)
class TurfAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "location",
        "phone",
    )

    search_fields = (
        "name",
        "location",
        "phone",
    )


@admin.register(TurfImage)
class TurfImageAdmin(admin.ModelAdmin):

    list_display = (
        "image",
        "uploaded_on",
    )

    ordering = (
        "-uploaded_on",
    )