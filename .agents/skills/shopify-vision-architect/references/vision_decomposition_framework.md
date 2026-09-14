# Visual Decomposition & Entity Identification Framework

When inspecting a visual screenshot of a luxury e-commerce page, apply this systematic breakdown framework:

---

## 1. Visual Slicing & Structural Zoning

Divide the viewport vertically and horizontally into functional zones:

```
+-------------------------------------------------------------+
| ZONE 1: Global Navigation & Brand Crest                     |
+-------------------------------------------------------------+
| ZONE 2: Hero Editorial Banner                               |
| - Eyebrow label                                             |
| - Main Couture Headline                                     |
| - Editorial philosophy subheadline                          |
| - Primary & Secondary CTAs                                  |
| - Full-bleed background imagery / video                     |
+-------------------------------------------------------------+
| ZONE 3: Lookbook Grid / Product Showcase                    |
| - Runway Look Cards (Look number, title, price, thumbnail)  |
| - Filtering / taxonomy pills                                |
+-------------------------------------------------------------+
| ZONE 4: Interactive Garment Radar Inspector                 |
| - Silhouette macro canvas                                   |
| - Pulsing coordinate hotspot markers (X, Y)                 |
| - Coordinate info drawer: Fabric origin, Boning, Stitches   |
+-------------------------------------------------------------+
| ZONE 5: Savoir-Faire / Artisan Storytelling Block           |
| - Atelier narrative text                                    |
| - Quote and author signature                                |
| - Key metrics (Handcraft hours counter, stitch count)       |
+-------------------------------------------------------------+
| ZONE 6: Curated Accessories Reel / Carousel                 |
| - Auxiliary items (jewelry, leather goods, clasps)          |
+-------------------------------------------------------------+
| ZONE 7: VIP Consultation / Private Salon Appointment Form   |
| - Concierge contact details & appointment booking disclaimer|
+-------------------------------------------------------------+
```

---

## 2. Converting Visual Patterns to Shopify Data Structures

| Visual Element on Screenshot | Candidate Shopify Data Structure | Recommended Field Mapping |
| :--- | :--- | :--- |
| **Full-bleed Hero Banner** | Metaobject (`hero_editorial`) | `eyebrow`, `headline`, `subheadline`, `primary_cta_label`, `primary_cta_url`, `media_banner` |
| **Runway Product Card** | Core `Product` + `ProductVariant` | `title`, `handle`, `priceRange`, `featuredImage`, `variants` (sizes) |
| **Interactive Pulsing Hotspot Dots** | Product Metafield (`custom.radar_coordinates`) | JSON array containing `{ id, label, description, x, y }` coordinates |
| **Artisan Portrait & Bio** | Metaobject (`artisan_profile`) | `name`, `role`, `specialty`, `years_of_craft`, `bio`, `quote`, `portrait_url` |
| **Craft Story / Atelier Narrative** | Metaobject (`craft_story`) | `headline`, `story_narrative`, `savoir_faire_hours`, `stitch_count`, `media_asset` |
| **Runway Season / Thematic Capsule** | Core `Collection` | `title`, `handle`, `descriptionHtml`, `image` |
| **Fabric Spec / Origin Pill** | Product Metafield (`custom.fabric_spec`) | `single_line_text_field` (e.g. "Lyon Silk Jacquard") |

---

## 3. Interpreting Companion Text Files

The `.txt` notes file accompanying each image must be cross-referenced for:
1. **Hidden Rules**: e.g., "The radar must allow up to 6 hotspots per silhouette", "Only 3 artisan profiles should show on mobile".
2. **Data Constraints**: Character limits, whether an asset is an image or video, required vs optional fields.
3. **Cross-Page Links**: e.g., "This button should link to the artisan atelier page shown in `artisan_atelier.png`".
