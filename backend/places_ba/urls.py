from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok", "version": "1.0.0", "service": "Places BA API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", health_check),
    path("", include("cafes.urls")),
]
