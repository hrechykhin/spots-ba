from rest_framework import serializers
from .models import Cafe

_MAP_PIN_FIELDS = ["id", "name", "latitude", "longitude", "google_rating"]
_LIST_FIELDS = [*_MAP_PIN_FIELDS,
                "slug", "address", "district", "tags", "photos",
                "accepts_bookings", "google_review_count"]
_DETAIL_FIELDS = [*_LIST_FIELDS,
                  "description", "phone", "website", "instagram",
                  "google_maps_url", "google_place_id", "opening_hours"]


class CafeMapPinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = _MAP_PIN_FIELDS


class CafeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = _LIST_FIELDS


class CafeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = _DETAIL_FIELDS
