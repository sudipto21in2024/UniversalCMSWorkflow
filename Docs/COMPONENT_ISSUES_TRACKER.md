# Universal CMS Component Issues & Discrepancy Tracker

This document serves as the project-wide permanent audit ledger tracking all component discrepancies, missing resources (images, icons, vectors), non-token inline style overrides, and visual drift issues across modular blocks.

---

## ⚠️ Operating Rules & Governance

1. **Mandatory User Confirmation**:
   - If an asset (photo, image, icon) is missing or cannot be located in `assets/` or offline dumps, **DO NOT GUESS OR GENERATE PLACEHOLDERS SILENTLY**. The AI must stop and ask the user explicitly.
   - If an inline style or non-token color/dimension is required, the AI must ask the user explicitly before inserting it.
2. **Standardized In-Code Comment**:
   - Every component with an issue or inline override must have a matching discrepancy comment header in its `.html` and `.php` / `.tsx` / `.liquid` file.
3. **Strict Non-Deletion Policy**:
   - **NEVER DELETE RESOLVED ISSUES.**
   - When an issue is fixed, update its status to `[RESOLVED]`, record the resolution date, commit hash, and detailed fix description. This ensures historical continuity and prevents recurring regression.

---

## Component Issues & Resolution Ledger

### Summary Table

| Page Slug | Block ID | Component Name | Figma Node | Issue Type | Date Reported | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Homepage` | `block_2` | Hero Editorial Banner | `27309:223` | Missing Asset & Layout Drift | 2026-09-15 | `[RESOLVED]` |

---

### Detailed Component Audit Entries

#### 1. Hero Editorial Banner (`Homepage` / `block_2`)
- **Component File**: `dist-preview/blocks/unique/hero-editorial.html` & `dist-client/template-parts/blocks/unique/hero-editorial.php`
- **Figma Node ID**: `27309:223`
- **Date Reported**: 2026-09-15
- **Reported By**: User Audit
- **Status**: `[RESOLVED]` (Date Resolved: 2026-09-15, Commit: `92cba1d`, `dae12c9`)

##### Issues Identified:
1. **Missing / Substituted Asset**:
   - Component was rendering a generic Unsplash stock photo placeholder (`photo-1556228720...`) instead of the authentic design photography.
2. **Layout & Alignment Drift**:
   - Layout was centered (`items-center text-center`) instead of bottom-left pinned (`primaryAxisAlignItems: MAX`).
3. **Button Styling & Glassmorphism Missing**:
   - CTA button was rendered as an opaque white button (`bg-white text-gray-900`) instead of the authentic 52px frosted glassmorphic button (`bg-white/[0.16] backdrop-blur-[52px]`).
4. **Typography Mismatch**:
   - Headline and eyebrow were missing exact `-0.06em` tracking and 56px Inter Medium scaling.

##### Resolution Details:
- Extracted exact AST tokens using `node scripts/figma-dump.mjs extract-spec 27309:223`.
- Extracted and linked authentic *Pure Solution Essence* photography into `assets/hero-pure-solution.jpg`.
- Applied bottom-left alignment (`flex flex-col justify-end items-start pb-14 pl-10 max-w-[588px]`).
- Styled CTA button with `w-[166px] h-[64px] bg-white/[0.16] backdrop-blur-[52px] rounded-lg text-white font-medium`.
- Auto-inlined asset to base64 in `scripts/verify-blocks.mjs` to resolve Chromium sandbox loading.
- Verified visual match score: **98% (PASS)** in Playwright verification runner.

---

## Template for New Entries

```markdown
#### [Index]. [Component Name] (`[Page Slug]` / `[Block ID]`)
- **Component File**: `dist-preview/blocks/[unique|shared]/[canonicalBasename].html`
- **Figma Node ID**: `[Node ID]`
- **Date Reported**: [YYYY-MM-DD]
- **Reported By**: [AI Vision Agent / User Audit]
- **Status**: `[OPEN - PENDING USER INPUT]` | `[RESOLVED]`

##### Issues Identified:
1. **[Issue Title]**: [Detailed description of missing asset, non-token color, or visual drift]

##### Resolution Details:
- [Fill in when resolved: tokens applied, asset placed, commit hash, verification score]
```
