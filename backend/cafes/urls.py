from django.urls import path
from . import views

urlpatterns = [
    path("cafes/map", views.CafeMapView.as_view()),
    path("cafes", views.CafeListView.as_view()),
    path("cafes/<str:pk>", views.CafeDetailView.as_view()),
    path("bookings", views.bookings_stub),
    path("bookings/<str:pk>", views.bookings_stub),
    path("bookings/<str:pk>/cancel", views.bookings_stub),
]
