from django.db import models


class Turf(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    city = models.CharField(max_length=100, blank=True, default="")
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True,null=True)
    main_image = models.ImageField(upload_to="turf_main/",blank=True,null=True)
    about_image = models.ImageField(upload_to="turf_about/",blank=True,null=True)

    is_active = models.BooleanField(default=True)
    day_price = models.DecimalField(max_digits=10, decimal_places=2, default=800)
    night_price = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    opening_time = models.TimeField(default="06:00:00", null=True, blank=True)
    closing_time = models.TimeField(default="23:00:00", null=True, blank=True)

    def __str__(self):
        return self.name


class TurfImage(models.Model):

    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name="gallery_images",
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="turf_images/"
    )

    uploaded_on = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        turf_name = self.turf.name if self.turf else "Unassigned"
        return f"{turf_name} - {self.image.name}"

class TurfClosure(models.Model):

    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name="closures"
    )

    date = models.DateField()

    start_time = models.TimeField(
        null=True,
        blank=True
    )

    end_time = models.TimeField(
        null=True,
        blank=True
    )

    is_full_day = models.BooleanField(
        default=False
    )

    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):

        if self.is_full_day:
            return f"{self.turf.name} - {self.date} - Full Day"

        return (
            f"{self.turf.name} - "
            f"{self.date} - "
            f"{self.start_time} to {self.end_time}"
        )