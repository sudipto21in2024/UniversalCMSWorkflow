# Shopify Metaobject & Metafield Schema Rules Reference

## 1. Supported Metaobject Field Types (Admin API 2025-01)

| Field Type Identifier | Description | Stored Representation |
| :--- | :--- | :--- |
| `single_line_text_field` | Standard text string (up to 255 chars) | String |
| `multi_line_text_field` | Multi-line text / paragraph without rich HTML | String with newlines |
| `rich_text_field` | Rich formatted text (HTML / Shopify JSON AST) | JSON string |
| `number_integer` | Whole integer numbers | Integer string in mutations |
| `number_decimal` | Decimal floating point numbers | String representing decimal |
| `date` | ISO 8601 Calendar date (`YYYY-MM-DD`) | Date string |
| `date_time` | ISO 8601 Timestamp with timezone | Timestamp string |
| `boolean` | True / False boolean flags | "true" / "false" |
| `url` | Web URL (starts with `http://` or `https://`) | URL string |
| `color` | Hexadecimal color code (e.g. `#1a1a1a`) | Hex string |
| `file_reference` | Reference to Shopify File (Image, Video, 3D Model) | File GID (`gid://shopify/MediaImage/...`) |
| `metaobject_reference` | Reference to another Metaobject instance | Metaobject GID |
| `list.single_line_text_field` | Array of text strings | JSON array of strings |
| `list.metaobject_reference` | Array of referenced metaobjects | JSON array of GIDs |

---

## 2. Storefront Access Permissions
When creating Metaobject definitions intended for Next.js Headless reading:
```graphql
access: {
  storefront: PUBLIC_READ
}
```
If omitted, the Storefront API will return null or an unauthorized error when querying the metaobject.

---

## 3. Product Metafields Convention
- Always use the `custom` namespace unless a specialized app namespace is required.
- Key names must be lowercase snake_case (`radar_coordinates`, `savoir_faire_hours`).
- For complex hierarchical data (like radar hotspots), use type `json`.
- Provide `ownerType: PRODUCT` and `access: { storefront: PUBLIC_READ }` when defining metafield definitions.
