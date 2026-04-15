from django.http import JsonResponse
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from .models import Cafe
from .serializers import CafeMapPinSerializer, CafeListSerializer, CafeDetailSerializer


class CafeMapView(generics.ListAPIView):
    serializer_class = CafeMapPinSerializer
    queryset = Cafe.objects.filter(is_published=True)


class CafeListView(generics.ListAPIView):
    serializer_class = CafeListSerializer

    def _get_filtered_qs(self):
        qs = Cafe.objects.filter(is_published=True)
        params = self.request.query_params

        if district := params.get("district"):
            qs = qs.filter(district=district)
        if min_rating := params.get("min_rating"):
            qs = qs.filter(google_rating__gte=float(min_rating))
        if q := params.get("q"):
            qs = qs.filter(name__icontains=q)
        if tags := params.get("tags"):
            for tag in tags.split(","):
                qs = qs.filter(tags__contains=[tag.strip()])
        ordering = params.get("ordering", "rating")
        if ordering == "reviews":
            qs = qs.order_by("-google_review_count")
        elif ordering == "name":
            qs = qs.order_by("name")
        else:
            qs = qs.order_by("-google_rating")
        return qs

    def list(self, request, *args, **kwargs):
        qs = self._get_filtered_qs()
        total = qs.count()
        params = request.query_params
        limit = min(int(params.get("limit", 9)), 100)
        offset = int(params.get("offset", 0))
        serializer = self.get_serializer(qs[offset: offset + limit], many=True)
        return Response({"total": total, "results": serializer.data})


class CafeDetailView(generics.RetrieveAPIView):
    serializer_class = CafeDetailSerializer

    def get_object(self):
        val = self.kwargs["pk"]
        qs = Cafe.objects.filter(is_published=True)
        try:
            return qs.get(slug=val)
        except Cafe.DoesNotExist:
            pass
        try:
            return qs.get(pk=val)
        except (Cafe.DoesNotExist, Exception):
            raise NotFound("Cafe not found.")


def bookings_stub(request, **kwargs):
    return JsonResponse(
        {"detail": "Booking feature is coming soon. Stay tuned!"},
        status=501,
    )
