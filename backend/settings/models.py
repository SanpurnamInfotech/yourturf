from django.db import models


class TurfSettings(models.Model):

    turf = models.ForeignKey(
        "turf.Turf",
        on_delete=models.CASCADE,
        related_name="turf_settings",
        null=True,
        blank=True
    )

    day_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=800
    )

    night_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1000
    )

    holiday_from = models.DateField(
        null=True,
        blank=True
    )

    holiday_to = models.DateField(
        null=True,
        blank=True
    )

    holiday_reason = models.CharField(
        max_length=200,
        blank=True
    )

    updated_on = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Turf Settings"
        verbose_name_plural = "Turf Settings"

    def __str__(self):
        turf_name = self.turf.name if self.turf else "Default"
        return f"{turf_name} Turf Settings"


class Holiday(models.Model):

    turf = models.ForeignKey(
        "turf.Turf",
        on_delete=models.CASCADE,
        related_name="turf_holidays",
        null=True,
        blank=True
    )

    holiday_from = models.DateField()

    holiday_to = models.DateField()

    reason = models.CharField(
        max_length=200
    )

    created_on = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-holiday_from"]

    def __str__(self):
        return f"{self.holiday_from} - {self.holiday_to}"


class WebsiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default="YourTurf")
    logo = models.ImageField(upload_to="branding/", null=True, blank=True)
    hero_image = models.ImageField(upload_to="branding/", null=True, blank=True)
    about_image = models.ImageField(upload_to="branding/", null=True, blank=True)
    contact_phone = models.CharField(max_length=30, default="1234567890", blank=True)
    contact_email = models.CharField(max_length=100, default="support@yourturf.com", blank=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website Settings"
        verbose_name_plural = "Website Settings"

    def __str__(self):
        return f"{self.site_name} Website Settings"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(
            id=1,
            defaults={
                "site_name": "YourTurf",
                "contact_phone": "1234567890",
                "contact_email": "support@yourturf.com",
            }
        )
        return obj


class OperatingCity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Operating City"
        verbose_name_plural = "Operating Cities"

    def __str__(self):
        return self.name

