from django.contrib import admin
from django.contrib import messages
from django.utils.text import slugify
from .models import Cafe, Booking
from . import google_places


@admin.action(description="Sync selected cafes with Google Places")
def sync_google_data(modeladmin, request, queryset):
    updated = skipped = 0
    for cafe in queryset:
        if not cafe.google_place_id:
            modeladmin.message_user(
                request,
                f"'{cafe.name}' has no google_place_id — skipped.",
                level=messages.WARNING,
            )
            skipped += 1
            continue
        try:
            detail = google_places.get_place_details(cafe.google_place_id)
            fields = google_places.place_to_cafe_fields(detail)
            fields.pop("slug", None)  # never overwrite slug from Google
            for attr, val in fields.items():
                setattr(cafe, attr, val)
            cafe.save()
            updated += 1
        except Exception as exc:
            modeladmin.message_user(request, f"Error syncing '{cafe.name}': {exc}", level=messages.ERROR)

    if updated:
        modeladmin.message_user(request, f"{updated} cafe(s) synced from Google Places.")


@admin.register(Cafe)
class CafeAdmin(admin.ModelAdmin):
    list_display = ["name", "district", "google_rating", "google_review_count",
                    "is_published", "accepts_bookings", "updated_at"]
    actions = [sync_google_data]
    list_filter = ["district", "is_published", "accepts_bookings"]
    list_editable = ["is_published"]
    search_fields = ["name", "address", "district"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = [
        ("Basic Info", {"fields": [
            "name", "slug", "description", "is_published", "accepts_bookings",
        ]}),
        ("Location", {"fields": [
            "address", "district", "latitude", "longitude", "google_maps_url",
        ]}),
        ("Contact", {"fields": [
            "phone", "website", "instagram",
        ]}),
        ("Google Data", {"fields": [
            "google_place_id", "google_rating", "google_review_count",
        ]}),
        ("Hours & Tags", {"fields": [
            "opening_hours", "tags", "photos",
        ]}),
        ("Timestamps", {"fields": [
            "created_at", "updated_at",
        ], "classes": ["collapse"]}),
    ]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["guest_name", "cafe", "party_size", "scheduled_at", "status", "created_at"]
    list_filter = ["status", "cafe"]
    search_fields = ["guest_name", "guest_email", "cafe__name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["scheduled_at"]
