import uuid
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Cafe


def make_cafe(**kwargs) -> Cafe:
    defaults = dict(
        name=f"Cafe {uuid.uuid4().hex[:6]}",
        slug=f"cafe-{uuid.uuid4().hex[:6]}",
        address="Test Street 1",
        latitude=48.1486,
        longitude=17.1077,
        google_rating=4.5,
        google_review_count=100,
        is_published=True,
    )
    defaults.update(kwargs)
    return Cafe.objects.create(**defaults)


class CafeListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_returns_only_published_cafes(self):
        make_cafe(name="Published")
        make_cafe(name="Draft", is_published=False)
        resp = self.client.get("/cafes")
        self.assertEqual(resp.status_code, 200)
        names = [c["name"] for c in resp.json()["results"]]
        self.assertIn("Published", names)
        self.assertNotIn("Draft", names)

    def test_response_has_total_and_results(self):
        make_cafe()
        resp = self.client.get("/cafes")
        data = resp.json()
        self.assertIn("total", data)
        self.assertIn("results", data)

    def test_total_reflects_full_count_not_page(self):
        for _ in range(12):
            make_cafe()
        resp = self.client.get("/cafes?limit=9&offset=0")
        data = resp.json()
        self.assertEqual(len(data["results"]), 9)
        self.assertGreaterEqual(data["total"], 12)

    def test_filter_by_district(self):
        make_cafe(name="Old Town", district="Staré Mesto")
        make_cafe(name="Ruzinov", district="Ružinov")
        resp = self.client.get("/cafes?district=Star%C3%A9+Mesto")
        names = [c["name"] for c in resp.json()["results"]]
        self.assertIn("Old Town", names)
        self.assertNotIn("Ruzinov", names)

    def test_filter_by_min_rating(self):
        make_cafe(name="High", google_rating=4.8)
        make_cafe(name="Low", google_rating=3.5)
        resp = self.client.get("/cafes?min_rating=4.5")
        names = [c["name"] for c in resp.json()["results"]]
        self.assertIn("High", names)
        self.assertNotIn("Low", names)

    def test_filter_by_name_search(self):
        make_cafe(name="Urban House")
        make_cafe(name="Foxford")
        resp = self.client.get("/cafes?q=urban")
        names = [c["name"] for c in resp.json()["results"]]
        self.assertIn("Urban House", names)
        self.assertNotIn("Foxford", names)

    def test_pagination_offset(self):
        for i in range(5):
            make_cafe(name=f"Cafe {i}")
        resp_p1 = self.client.get("/cafes?limit=3&offset=0")
        resp_p2 = self.client.get("/cafes?limit=3&offset=3")
        ids_p1 = {c["id"] for c in resp_p1.json()["results"]}
        ids_p2 = {c["id"] for c in resp_p2.json()["results"]}
        self.assertEqual(len(ids_p1 & ids_p2), 0)  # no overlap


class CafeDetailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cafe = make_cafe(name="Detail Cafe", slug="detail-cafe")

    def test_fetch_by_slug(self):
        resp = self.client.get("/cafes/detail-cafe")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["name"], "Detail Cafe")

    def test_fetch_by_uuid(self):
        resp = self.client.get(f"/cafes/{self.cafe.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["name"], "Detail Cafe")

    def test_unpublished_returns_404(self):
        cafe = make_cafe(name="Hidden", slug="hidden-cafe", is_published=False)
        resp = self.client.get(f"/cafes/{cafe.slug}")
        self.assertEqual(resp.status_code, 404)

    def test_nonexistent_returns_404(self):
        resp = self.client.get("/cafes/does-not-exist")
        self.assertEqual(resp.status_code, 404)

    def test_detail_includes_opening_hours(self):
        hours = {"monday": "8:00 AM – 6:00 PM"}
        cafe = make_cafe(slug="hours-cafe", opening_hours=hours)
        resp = self.client.get(f"/cafes/{cafe.slug}")
        self.assertEqual(resp.json()["opening_hours"], hours)


class CafeMapViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_returns_map_pins(self):
        make_cafe()
        resp = self.client.get("/cafes/map")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)

    def test_map_pins_have_required_fields(self):
        make_cafe()
        resp = self.client.get("/cafes/map")
        pin = resp.json()[0]
        for field in ("id", "name", "latitude", "longitude", "google_rating"):
            self.assertIn(field, pin)

    def test_excludes_unpublished_from_map(self):
        published = make_cafe(name="Visible")
        make_cafe(name="Hidden", is_published=False)
        resp = self.client.get("/cafes/map")
        names = [p["name"] for p in resp.json()]
        self.assertIn("Visible", names)
        self.assertNotIn("Hidden", names)
