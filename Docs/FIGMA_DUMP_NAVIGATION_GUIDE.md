# 🧭 Figma JSON Dump Navigation & Querying Guide

This reference document defines standard, pre-tested Node.js CLI commands, utility scripts, and one-liners to inspect, query, search, and extract layer hierarchies, component sets, typography scales, colors, and asset mappings directly from the local Figma JSON dumps (`Docs/DirectDataDump/light-dark-export/...`).

---

## ⚡ 1. The Built-in CLI Tool (`scripts/figma-dump.mjs`)

A dedicated zero-dependency CLI tool is available at [`scripts/figma-dump.mjs`](file:///c:/Sudipto/FigmaWorkflow2/scripts/figma-dump.mjs). Use this to query any screen or component without crafting ad-hoc scripts.

### 📋 Full Command Matrix

| Category | Task | Command | Description |
| :--- | :--- | :--- | :--- |
| **Pages & Screens** | **List All Pages** | `node scripts/figma-dump.mjs list-pages` | Lists all pages in the file (`cover`, `design`, `components`) and their child frames. |
| | **List Screen Frames** | `node scripts/figma-dump.mjs list-frames design` | Lists all 21 screen frames on the `design` page with Node IDs and child counts. |
| | **List Library Components** | `node scripts/figma-dump.mjs list-components` | Lists all design system components/sets on the `components` page. |
| **Layer & Tree Inspection**| **Inspect Layer Tree** | `node scripts/figma-dump.mjs get-node <NODE_ID> --depth=3` | Returns a clean visual hierarchy tree up to depth `N` (default `3`). |
| | **Dump Raw Node** | `node scripts/figma-dump.mjs dump-raw <NODE_ID>` | Outputs full raw Figma JSON properties (bounds, fills, constraints, layout). |
| | **Search by Name** | `node scripts/figma-dump.mjs search "tarixi"` | Finds all layers/frames matching the query keyword. |
| **Content & Design Tokens**| **Extract All Text** | `node scripts/figma-dump.mjs extract-text <NODE_ID>` | Dumps all text strings, font sizes, colors, and layer names inside the node. |
| | **Extract Color Palette** | `node scripts/figma-dump.mjs extract-colors <NODE_ID>` | Consolidates and ranks all solid hex fill colors by frequency of occurrence. |
| | **Extract Typography Scale** | `node scripts/figma-dump.mjs extract-typography <NODE_ID>` | Lists all font families, weights, font sizes, and line-heights used in the screen. |
| **Asset Resolution** | **Find Linked SVG/PNGs** | `node scripts/figma-dump.mjs find-assets <NODE_ID>` | Cross-references nodes against [`Docs/figma-data/asset-manifest.json`](file:///c:/Sudipto/FigmaWorkflow2/Docs/figma-data/asset-manifest.json) to output local filepaths. |

> [!TIP]
> **Dark Mode Flag**: Add `--dark` to any command above to query the dark mode export (`Docs/DirectDataDump/light-dark-export/dark/...`).
> Example: `node scripts/figma-dump.mjs extract-colors 1718:8000 --dark`

---

## 💻 2. Essential Node.js One-Liners (PowerShell Compatible)

If you need fast inline commands in terminal/tools without calling the script, use these tested snippets:

### A. List All Main Screens on the `design` Page
```powershell
node -e "const fs = require('fs'); const dump = JSON.parse(fs.readFileSync('Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json', 'utf8')); const page = dump.pages.find(p => p.name === 'design'); console.log(page.children.map(c => ({ id: c.id, name: c.name.trim() })));"
```

### B. Extract All Text Strings from a Screen Frame (e.g. `1718:6096`)
```powershell
node -e "const fs = require('fs'); const dump = JSON.parse(fs.readFileSync('Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json', 'utf8')); function getTexts(n, list=[]) { if (n.characters) list.push({ text: n.characters.trim(), name: n.name }); if (n.children) n.children.forEach(c => getTexts(c, list)); return list; } const page = dump.pages.find(p => p.name === 'design'); const node = page.children.find(c => c.id === '1718:6096'); console.log(getTexts(node));"
```

### C. Search for Specific Node by ID Anywhere in Document
```powershell
node -e "const fs = require('fs'); const dump = JSON.parse(fs.readFileSync('Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json', 'utf8')); function findId(n, id) { if (n.id === id) return n; const ch = n.pages || n.children; if (ch) { for (const c of ch) { const res = findId(c, id); if (res) return res; } } return null; } const n = findId(dump, '1718:6342'); console.log({ id: n.id, name: n.name, type: n.type, children: n.children?.map(c => c.name) });"
```

### D. Search Layers by Keyword across the Entire Dump
```powershell
node -e "const fs = require('fs'); const dump = JSON.parse(fs.readFileSync('Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json', 'utf8')); function search(n, q, res=[]) { if (n.name && n.name.toLowerCase().includes(q)) res.push({ id: n.id, name: n.name, type: n.type }); const ch = n.pages || n.children; if (ch) ch.forEach(c => search(c, q, res)); return res; } console.log(search(dump, 'modal'));"
```

### E. Extract Color Palette & Hex Codes from a Component
```powershell
node -e "const fs = require('fs'); const dump = JSON.parse(fs.readFileSync('Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json', 'utf8')); function getFills(n, colors=new Set()) { if (n.fills) { n.fills.forEach(f => { if (f.type === 'SOLID' && f.color) { const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0'); const hex = '#' + toHex(f.color.r) + toHex(f.color.g) + toHex(f.color.b); colors.add(hex.toUpperCase()); } }); } if (n.children) n.children.forEach(c => getFills(c, colors)); return Array.from(colors); } const page = dump.pages.find(p => p.name === 'design'); const node = page.children.find(c => c.id === '1718:6342'); console.log('Colors used in node:', getFills(node));"
```

### F. Lookup Local Asset File for a Specific Vector / Image Node
```powershell
node -e "const fs = require('fs'); const manifest = JSON.parse(fs.readFileSync('Docs/figma-data/asset-manifest.json', 'utf8')); const nodeId = '1718:6318'; console.log(manifest[nodeId] || 'No asset mapped for this node');"
```

---

## 🗺️ 3. Quick Index of Top-Level Design Frames

| Screen Name | Node ID | Page | Purpose |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `1718:8000` | `design` | Main analytics dashboard & crypto widgets |
| **Monitoring** | `1718:7764` | `design` | Base monitoring user ledger table |
| **Monitoring - Filter** | `1718:7518` | `design` | Active students filter drawer panel |
| **Xizmatlarni yuklash** | `1718:7384` | `design` | Tutor profile details & messaging |
| **Topshiriq** | `1718:7128` | `design` | Tasks table ledger |
| **Topshiriq - Filter** | `1718:6882` | `design` | Task filter overlay panel |
| **Topshiriq - yaratish**| `1718:6606` | `design` | Create new task modal dialog |
| **Mijoz Sahifasi** | `1718:6342` | `design` | Customer profile & ride history log |
| **Xizmatlar tarixi** | `1718:6096` | `design` | Service history log table |
| **Xizmatlar tarixi - Filter** | `1718:5859` | `design` | Service history filter panel |
| **Mijozlar** | `1718:5603` | `design` | Customers directory table |
| **Mijozlar - Filter** | `1718:5340` | `design` | Customers directory filter panel |
| **Eslatmalar** | `1718:5084` | `design` | Notes & reminders card grid |
| **Eslatmalar - Filter**| `1718:4844` / `1718:4575` | `design` | Notes filter panel variants |
| **SMS sozlamalari** | `1718:4336` | `design` | SMS gateway & quota settings |
| **SMS shablon** | `1718:4085` | `design` | SMS template card library & edit modal |
| **Xodimlar** | `1718:3728` | `design` | Staff members table & roles |
| **login** | `1718:8288` | `design` | Authentication login card |
| **Students data** | `1718:8434` | `design` | Student course enrollments & stats |
