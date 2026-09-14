# Visual Block Annotator Studio (Standalone)

A zero-dependency, plug-and-play visual block-level annotation studio for UI/UX mockups, screenshots, and wireframes.

---

## 🚀 Quick Start (Windows)

### 1. Start on Default / Project Folder
Simply double-click:
```cmd
start-annotator.bat
```
This automatically launches the server on port 4040 and opens the studio in your default browser at `http://localhost:4040`.

---

## 🛠 Features

1. **Zero Hardcoded Folders**:
   - Point the tool to any folder on your computer.
   - Change input/output folders directly inside the web UI using the **"Folders"** button.
2. **Interactive Canvas**:
   - Click & drag to draw bounding boxes.
   - Normalized Cartesian coordinates ($X\%, Y\%, \text{Width}\%, \text{Height}\%$) adapt to any screen resolution.
3. **Structured Taxonomy & Entity Classification**:
   - Tag blocks with **Shopify Metaobjects**, **Product Metafields**, **Collections**, or **Standard UI Components**.
   - Input custom schema names, key fields, and rich markdown requirement notes.
4. **Dual JSON + TXT Persistence (100% Lossless Modifications)**:
   - **`[slug].json`**: Machine-readable, strictly-typed JSON with Cartesian coordinates (`x, y, width, height`), perfect for automated parsers, code generators, and subsequent user modifications without any parsing errors.
   - **`[slug].txt`**: Human and LLM-readable Markdown format with YAML frontmatter.
   - Real-time **Preview (JSON / TXT)**, **Download**, and **Save to Disk** options.
5. **Completely Self-Contained**:
   - Zero external npm packages required at runtime.
   - Can be copied to any directory or project and run instantly.

---

## 🏷 Customizing Taxonomy (Category & Target Entity)

The dropdown options for **Category** and **Target Entity** shown in the Inspector panel are completely dynamic and configured in [`annotator.config.json`](file:///c:/Sudipto/ShophifyTechDemo/tools/VisualAnnotator/annotator.config.json).

### How It Works:
1. **Configuration File**: [`annotator.config.json`](file:///c:/Sudipto/ShophifyTechDemo/tools/VisualAnnotator/annotator.config.json) defines the list under `taxonomy.categories` and `taxonomy.entityTypes`.
2. **Server API**: On startup, `server.mjs` exposes this data at `/api/config`.
3. **Client UI**: When the browser loads `index.html`, `app.js` fetches `/api/config` and populates the **Category** and **Target Entity** dropdown selectors automatically.

### Example `annotator.config.json`:
```json
{
  "taxonomy": {
    "entityTypes": [
      { "id": "metaobject", "label": "Shopify Metaobject", "color": "#D6B992" },
      { "id": "product_metafield", "label": "Product Metafield", "color": "#34D399" },
      { "id": "collection", "label": "Curated Collection", "color": "#C084FC" },
      { "id": "ui_component", "label": "Standard UI Section", "color": "#60A5FA" },
      { "id": "custom", "label": "Custom Tag", "color": "#F472B6" }
    ],
    "categories": [
      "Hero Editorial",
      "Interactive Radar Canvas",
      "Product Grid / Showcase",
      "Craftsmanship Narrative",
      "Artisan Counter / Metrics",
      "Lead Capture / Modal Form",
      "Header & Navigation",
      "Footer & Disclaimers"
    ]
  }
}
```

To adapt the tool for a new CMS (e.g., Strapi, Sanity), eCommerce platform, or design system, simply edit `annotator.config.json` and refresh your browser.

---

## ⚙ Advanced CLI Arguments

You can run `server.mjs` directly with custom folder paths:

```bash
node server.mjs --input "D:/ClientMockups" --output "D:/ClientNotes" --port 4040
```

