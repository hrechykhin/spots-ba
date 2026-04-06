from django.core.management.base import BaseCommand
from django.utils.text import slugify

from cafes.models import Cafe
from cafes import google_places


class Command(BaseCommand):
    help = "Search Google Places for cafes in Bratislava and import/update them."

    def add_arguments(self, parser):
        parser.add_argument(
            "--query",
            default="specialty cafes in Bratislava Slovakia",
            help="Text search query sent to Google Places.",
        )
        parser.add_argument(
            "--max",
            type=int,
            default=60,
            help="Maximum number of places to fetch (default: 60).",
        )
        parser.add_argument(
            "--publish",
            action="store_true",
            default=False,
            help="Automatically set is_published=True on imported cafes.",
        )

    def handle(self, *args, **options):
        query = options["query"]
        max_results = options["max"]
        publish = options["publish"]

        self.stdout.write(f'Searching Google Places: "{query}" (max {max_results})…')

        try:
            places = google_places.search_cafes(query=query, max_results=max_results)
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"Search failed: {exc}"))
            return

        self.stdout.write(f"Found {len(places)} places. Fetching details…")

        created = updated = skipped = 0

        for place in places:
            place_id = place.get("id")
            if not place_id:
                skipped += 1
                continue

            try:
                detail = google_places.get_place_details(place_id)
            except Exception as exc:
                self.stderr.write(f"  Skipping {place_id}: {exc}")
                skipped += 1
                continue

            fields = google_places.place_to_cafe_fields(detail)

            name = fields.get("name", "")
            if not name:
                skipped += 1
                continue

            # Build a unique slug
            base_slug = slugify(name)
            slug = base_slug
            counter = 1
            while Cafe.objects.filter(slug=slug).exclude(google_place_id=place_id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            fields["slug"] = slug
            if publish:
                fields["is_published"] = True

            cafe, was_created = Cafe.objects.update_or_create(
                google_place_id=place_id,
                defaults=fields,
            )

            if was_created:
                created += 1
                self.stdout.write(f"  + {cafe.name}")
            else:
                updated += 1
                self.stdout.write(f"  ~ {cafe.name} (updated)")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created} created, {updated} updated, {skipped} skipped."
        ))
