from django.contrib import admin

from .models import *


@admin.register(TurfSettings)
class TurfSettingsAdmin(admin.ModelAdmin):

    list_display = (
        "day_price",
        "night_price",
        "holiday_from",
        "holiday_to",
        "updated_on",
    )

    readonly_fields = (
        "updated_on",
    )

    fieldsets = (

        (
            "Pricing Settings",
            {
                "fields": (
                    "day_price",
                    "night_price",
                )
            },
        ),

        (
            "Holiday Settings",
            {
                "fields": (
                    "holiday_from",
                    "holiday_to",
                    "holiday_reason",
                )
            },
        ),

        (
            "System",
            {
                "fields": (
                    "updated_on",
                )
            },
        ),

    )

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):

    list_display = (
        "holiday_from",
        "holiday_to",
        "reason",
    )

    search_fields = (
        "reason",
    )

    list_filter = (
        "holiday_from",
        "holiday_to",
    )

    ordering = (
        "-holiday_from",
    )