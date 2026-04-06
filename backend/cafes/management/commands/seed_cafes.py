from django.core.management.base import BaseCommand
from cafes.models import Cafe

CAFES = [
    {
        "name": "Štúdio Praziarni",
        "slug": "studio-praziarni",
        "description": "A specialty coffee roastery and cafe in the heart of Bratislava, known for exceptional single-origin espresso and pour-overs. The space doubles as a roasting studio with a warm, industrial aesthetic.",
        "address": "Šancová 4, 831 04 Bratislava",
        "district": "Nové Mesto",
        "latitude": 48.1559,
        "longitude": 17.1213,
        "phone": "+421 905 123 456",
        "website": "https://studiopraziarni.sk",
        "instagram": "studiopraziarni",
        "google_maps_url": "https://maps.google.com/?q=Štúdio+Praziarni+Bratislava",
        "google_rating": 4.8,
        "google_review_count": 412,
        "opening_hours": {
            "monday": "08:00–18:00", "tuesday": "08:00–18:00",
            "wednesday": "08:00–18:00", "thursday": "08:00–18:00",
            "friday": "08:00–18:00", "saturday": "09:00–17:00", "sunday": "Closed",
        },
        "tags": ["specialty coffee", "roastery", "pour-over", "single-origin"],
        "is_published": True,
    },
    {
        "name": "Cafe Verne",
        "slug": "cafe-verne",
        "description": "An elegant literary cafe inspired by Jules Verne, located in the Old Town. Beautiful Art Nouveau interior, excellent coffee, and homemade cakes.",
        "address": "Hviezdoslavovo nám. 18, 811 02 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1432,
        "longitude": 17.1075,
        "phone": "+421 2 5443 4514",
        "website": "https://cafeverne.sk",
        "instagram": "cafeverne",
        "google_maps_url": "https://maps.google.com/?q=Cafe+Verne+Bratislava",
        "google_rating": 4.6,
        "google_review_count": 1243,
        "opening_hours": {
            "monday": "08:00–22:00", "tuesday": "08:00–22:00",
            "wednesday": "08:00–22:00", "thursday": "08:00–22:00",
            "friday": "08:00–23:00", "saturday": "09:00–23:00", "sunday": "10:00–22:00",
        },
        "tags": ["literary", "art nouveau", "cakes", "wifi", "outdoor seating"],
        "is_published": True,
    },
    {
        "name": "Gorila Specialty Coffee",
        "slug": "gorila-specialty-coffee",
        "description": "Bratislava's go-to spot for serious coffee geeks. Gorila sources, roasts, and brews exceptional specialty coffees. Minimalist interior with a focus entirely on the cup.",
        "address": "Obchodná 48, 811 06 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1478,
        "longitude": 17.1115,
        "phone": "+421 910 456 789",
        "website": "https://gorila.coffee",
        "instagram": "gorila.coffee",
        "google_maps_url": "https://maps.google.com/?q=Gorila+Specialty+Coffee+Bratislava",
        "google_rating": 4.7,
        "google_review_count": 328,
        "opening_hours": {
            "monday": "08:00–17:00", "tuesday": "08:00–17:00",
            "wednesday": "08:00–17:00", "thursday": "08:00–17:00",
            "friday": "08:00–17:00", "saturday": "09:00–15:00", "sunday": "Closed",
        },
        "tags": ["specialty coffee", "roastery", "minimalist", "single-origin"],
        "is_published": True,
    },
    {
        "name": "Randal Cafe",
        "slug": "randal-cafe",
        "description": "A cozy neighborhood cafe known for its friendly atmosphere, great brunch menu, and consistently good espresso drinks.",
        "address": "Špitálska 8, 811 08 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1505,
        "longitude": 17.1170,
        "phone": "+421 948 234 567",
        "instagram": "randal.cafe",
        "google_maps_url": "https://maps.google.com/?q=Randal+Cafe+Bratislava",
        "google_rating": 4.5,
        "google_review_count": 567,
        "opening_hours": {
            "monday": "08:00–18:00", "tuesday": "08:00–18:00",
            "wednesday": "08:00–18:00", "thursday": "08:00–18:00",
            "friday": "08:00–18:00", "saturday": "09:00–18:00", "sunday": "10:00–16:00",
        },
        "tags": ["brunch", "wifi", "cozy", "dog friendly"],
        "is_published": True,
    },
    {
        "name": "Zeppelin Cafe",
        "slug": "zeppelin-cafe",
        "description": "A spacious, airy cafe popular with students and remote workers. Excellent filter coffee and a relaxed vibe — one of the best spots for working in Bratislava.",
        "address": "Laurinská 13, 811 01 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1449,
        "longitude": 17.1070,
        "phone": "+421 902 345 678",
        "website": "https://zeppelin.cafe",
        "instagram": "zeppelin.cafe.ba",
        "google_maps_url": "https://maps.google.com/?q=Zeppelin+Cafe+Bratislava",
        "google_rating": 4.5,
        "google_review_count": 789,
        "opening_hours": {
            "monday": "07:30–20:00", "tuesday": "07:30–20:00",
            "wednesday": "07:30–20:00", "thursday": "07:30–20:00",
            "friday": "07:30–21:00", "saturday": "09:00–21:00", "sunday": "10:00–19:00",
        },
        "tags": ["wifi", "laptop-friendly", "filter coffee", "spacious"],
        "is_published": True,
    },
    {
        "name": "Cafe Roland",
        "slug": "cafe-roland",
        "description": "Iconic Bratislava institution on the Main Square, right next to the Roland Fountain. A must-visit for its prime location, historical atmosphere, and wide selection of coffee and pastries.",
        "address": "Hlavné nám. 5, 811 01 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1437,
        "longitude": 17.1074,
        "phone": "+421 2 5441 1711",
        "website": "https://caferoland.sk",
        "instagram": "caferoland_bratislava",
        "google_maps_url": "https://maps.google.com/?q=Cafe+Roland+Bratislava",
        "google_rating": 4.4,
        "google_review_count": 2156,
        "opening_hours": {
            "monday": "08:00–22:00", "tuesday": "08:00–22:00",
            "wednesday": "08:00–22:00", "thursday": "08:00–22:00",
            "friday": "08:00–23:00", "saturday": "09:00–23:00", "sunday": "09:00–22:00",
        },
        "tags": ["historic", "main square", "outdoor seating", "tourist-friendly", "pastries"],
        "is_published": True,
    },
    {
        "name": "The Templo",
        "slug": "the-templo",
        "description": "A specialty coffee shop and cocktail bar hybrid. Exceptional espresso by day, creative cocktails by night. Great playlist and a loyal local following.",
        "address": "Ružinovská 1, 821 02 Bratislava",
        "district": "Ružinov",
        "latitude": 48.1494,
        "longitude": 17.1371,
        "phone": "+421 915 567 890",
        "instagram": "thetemplo.ba",
        "google_maps_url": "https://maps.google.com/?q=The+Templo+Bratislava",
        "google_rating": 4.7,
        "google_review_count": 203,
        "opening_hours": {
            "monday": "08:00–22:00", "tuesday": "08:00–22:00",
            "wednesday": "08:00–22:00", "thursday": "08:00–23:00",
            "friday": "08:00–00:00", "saturday": "10:00–00:00", "sunday": "10:00–20:00",
        },
        "tags": ["specialty coffee", "cocktails", "evening", "music"],
        "is_published": True,
    },
    {
        "name": "Kaffee Mayer",
        "slug": "kaffee-mayer",
        "description": "A classic Viennese-style coffeehouse in the Old Town, beloved for its traditional atmosphere, excellent Melange, and homemade strudel. A Bratislava institution.",
        "address": "Hlavné nám. 4, 811 01 Bratislava",
        "district": "Staré Mesto",
        "latitude": 48.1439,
        "longitude": 17.1072,
        "phone": "+421 2 5441 0245",
        "website": "https://kaffee-mayer.sk",
        "instagram": "kaffeemayer",
        "google_maps_url": "https://maps.google.com/?q=Kaffee+Mayer+Bratislava",
        "google_rating": 4.5,
        "google_review_count": 1876,
        "opening_hours": {
            "monday": "08:00–22:00", "tuesday": "08:00–22:00",
            "wednesday": "08:00–22:00", "thursday": "08:00–22:00",
            "friday": "08:00–22:00", "saturday": "09:00–22:00", "sunday": "10:00–21:00",
        },
        "tags": ["viennese", "historic", "strudel", "melange", "main square"],
        "is_published": True,
    },
]


class Command(BaseCommand):
    help = "Seed the database with initial Bratislava cafe data"

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for data in CAFES:
            _, was_created = Cafe.objects.get_or_create(slug=data["slug"], defaults=data)
            if was_created:
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done — {created} created, {skipped} already existed."
        ))
