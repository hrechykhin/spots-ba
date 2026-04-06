"""
Google Places API (New) client.

Docs: https://developers.google.com/maps/documentation/places/web-service/overview
"""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

PLACES_BASE = "https://places.googleapis.com/v1"

# Fields requested for every place — controls billing tier.
# "Basic" fields are cheapest; "Contact" and "Atmosphere" cost more.
DETAIL_FIELDS = ",".join([
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "rating",
    "userRatingCount",
    "nationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "googleMapsUri",
    "addressComponents",
])

SEARCH_FIELDS = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "nextPageToken",
])


def _api_key():
    key = getattr(settings, "GOOGLE_PLACES_API_KEY", None)
    if not key:
        raise RuntimeError("GOOGLE_PLACES_API_KEY is not set in settings / environment.")
    return key


def search_cafes(query: str = "cafes in Bratislava Slovakia", max_results: int = 60) -> list[dict]:
    """
    Text-search Google Places and return raw place dicts.
    Handles pagination up to max_results.
    """
    url = f"{PLACES_BASE}/places:searchText"
    headers = {
        "X-Goog-Api-Key": _api_key(),
        "X-Goog-FieldMask": SEARCH_FIELDS,
        "Content-Type": "application/json",
    }

    results = []
    page_token = None

    while len(results) < max_results:
        body = {"textQuery": query, "languageCode": "en", "maxResultCount": 20}
        if page_token:
            body["pageToken"] = page_token

        resp = requests.post(url, json=body, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        places = data.get("places", [])
        results.extend(places)

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return results[:max_results]


def get_place_details(place_id: str) -> dict:
    """Fetch full details for a single place by its Places API ID."""
    url = f"{PLACES_BASE}/places/{place_id}"
    headers = {
        "X-Goog-Api-Key": _api_key(),
        "X-Goog-FieldMask": DETAIL_FIELDS,
    }
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# Converters
# ---------------------------------------------------------------------------

_WEEKDAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def _parse_opening_hours(place: dict) -> dict | None:
    hours_data = place.get("regularOpeningHours", {})
    descriptions = hours_data.get("weekdayDescriptions", [])
    if not descriptions:
        return None

    result = {}
    for desc in descriptions:
        # desc format: "Monday: 8:00 AM – 9:00 PM"  or  "Monday: Closed"
        if ":" not in desc:
            continue
        day_raw, _, times = desc.partition(":")
        day = day_raw.strip().lower()
        result[day] = times.strip()

    return result or None


def _extract_district(place: dict) -> str | None:
    """Best-effort: pull the sublocality or neighborhood component."""
    for component in place.get("addressComponents", []):
        types = component.get("types", [])
        if "sublocality" in types or "neighborhood" in types:
            return component.get("longText")
    return None


def place_to_cafe_fields(place: dict) -> dict:
    """
    Convert a Google Places API place dict to a dict of Cafe model field values.
    Only includes fields that have a non-None value.
    """
    loc = place.get("location", {})
    name = place.get("displayName", {}).get("text", "")

    fields = {
        "google_place_id": place.get("id"),
        "name": name,
        "address": place.get("formattedAddress", ""),
        "latitude": loc.get("latitude"),
        "longitude": loc.get("longitude"),
        "google_rating": place.get("rating"),
        "google_review_count": place.get("userRatingCount"),
        "phone": place.get("nationalPhoneNumber"),
        "website": place.get("websiteUri"),
        "google_maps_url": place.get("googleMapsUri"),
        "opening_hours": _parse_opening_hours(place),
        "district": _extract_district(place),
    }

    return {k: v for k, v in fields.items() if v is not None}
