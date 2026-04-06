import uuid
from django.db import models


class Cafe(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=500)
    district = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    instagram = models.CharField(max_length=255, blank=True, null=True)
    google_maps_url = models.URLField(max_length=1000, blank=True, null=True)
    google_rating = models.FloatField(blank=True, null=True)
    google_review_count = models.IntegerField(blank=True, null=True)
    google_place_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    opening_hours = models.JSONField(blank=True, null=True)
    photos = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    accepts_bookings = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-google_rating"]

    def __str__(self):
        return self.name


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No Show"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name="bookings")
    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=50, blank=True, null=True)
    party_size = models.PositiveSmallIntegerField()
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at"]

    def __str__(self):
        return f"{self.guest_name} @ {self.cafe.name} on {self.scheduled_at:%Y-%m-%d %H:%M}"
