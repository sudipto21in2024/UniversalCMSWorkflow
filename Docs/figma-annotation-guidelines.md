# Designer & Developer Guide: How to Annotate in Figma for Code Generation

This guide provides step-by-step instructions and reference cheat-sheets for annotating Figma designs so the Figma-to-Code engine generates pixel-perfect, semantically correct Next.js/React code automatically.

---

## 1. Quick Reference: Where to Annotate in Figma

You can annotate using two primary methods depending on whether you are working with **Master Components** or **Canvas Layers/Frames**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Master Component Annotation (Description Box)                           │
│    Select Component → Right Sidebar → "Description" input field            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Layer & Frame Micro-Annotations (Layer Name)                            │
│    Select Layer in Left Tree → Press F2 / Double-Click to rename layer     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Method 1: Master Component Annotations (Component Descriptions)

When creating a reusable Master Component (e.g. `Button`, `ProductCard`, `Badge`, `Header`), write a YAML configuration block directly into the **Component Description** box in Figma:

### Example A: Interactive Button Component
```yaml
@component: Button
@as: button
@export: src/components/ui/button.tsx
@props:
  variant: [primary, secondary, outline]
  size: [sm, md, lg]
  isLoading: boolean
@a11y:
  role: button
```

### Example B: Product Card Component
```yaml
@component: ProductCard
@as: article
@export: src/components/shared/product-card.tsx
@props:
  name: string
  categoryDesc: string
  price: string
  originalPrice: string?
  badge:
    text: string
    type: [discount, new]
  imageSrc: string
@a11y:
  role: article
```

### Example C: Site Header Component
```yaml
@component: Header
@as: header
@export: src/components/shared/header.tsx
@client: true
@props: {}
@a11y:
  role: banner
```

---

## 3. Method 2: Layer Name Micro-Annotations (Prefix Protocol)

For ad-hoc sections, text elements, and non-component frames, rename the layer using square bracket prefix tags:

$$\mathbf{[tag:\dots][role:\dots][behavior:\dots][client:\dots]\ \text{LayerName}}$$

### Common Tags Reference Table

| Tag | Options / Syntax | Generated Code / Behavior |
| :--- | :--- | :--- |
| `[tag:...]` | `h1`, `h2`, `h3`, `p`, `span`, `section`, `article`, `nav`, `button`, `a`, `header`, `footer`, `form`, `input` | Emits exact HTML5 semantic tag (e.g. `<h2>...</h2>` instead of `<div>`) |
| `[behavior:...]` | `truncate`, `line-clamp-2`, `line-clamp-3`, `scroll-x`, `sticky` | Adds Tailwind utilities (e.g. `truncate`, `line-clamp-2`, `sticky top-0`) |
| `[layout:...]` | `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `flex-col`, `flex-row` | Sets explicit responsive grid/flex layout |
| `[client:true]` | `true`, `false` | Marks the component/module with `"use client"` for interactive state |
| `[icon:slot]` | `slot`, `inherit` | Preserves SVG fill with `text-current` / `currentColor` |
| `[as:link]` | `href:/shop` | Renders a Next.js `<Link href="/shop">` |

---

## 4. Real-World Practical Examples

### 1. Typography & Headings
* **Page Main Title**:
  - Figma Layer Name: `[tag:h1] Hero Heading`
  - Code Output: `<h1 className="text-4xl sm:text-5xl font-bold ...">Discover Our New Collection</h1>`
* **Card Subtitle with Clamp**:
  - Figma Layer Name: `[tag:p][behavior:line-clamp-2] Product Description`
  - Code Output: `<p className="text-sm line-clamp-2 text-content-secondary">...</p>`

### 2. Layout & Containers
* **Product Catalog Grid**:
  - Figma Layer Name: `[tag:section][layout:grid-cols-4] Products Grid`
  - Code Output: `<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">`
* **Navigation Bar**:
  - Figma Layer Name: `[tag:nav][role:navigation] Main Nav Links`
  - Code Output: `<nav role="navigation" className="flex items-center gap-8">`

### 3. Interactive Leaf Elements
* **Interactive Dropdown / Filter Trigger**:
  - Figma Layer Name: `[client:true][tag:button][role:button] Filter Toggle`
  - Code Output: Generates a `"use client"` component with `onClick` handler.
* **Navigation Link**:
  - Figma Layer Name: `[tag:a][as:link] Shop Nav Item`
  - Code Output: `<Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>`

---

## 5. Summary Checklist for Designers

1. **Colors & Spacing**: Use Figma Color Styles and Auto-Layout with defined spacing (multiples of 4px/8px).
2. **Components**: Fill in `@component` and `@props` in the Description field for any master component.
3. **Headings**: Prefix text layers with `[tag:h1]`, `[tag:h2]`, or `[tag:h3]`.
4. **Interactive Buttons**: Prefix with `[tag:button]` or `[client:true]`.
5. **SVGs / Icons**: Ensure icons use flat vectors so they export cleanly as SVG icons.
