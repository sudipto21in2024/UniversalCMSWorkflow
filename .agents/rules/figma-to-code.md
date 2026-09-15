# Comprehensive Figma-to-Code Rules & Architectural Guardrails

## 1. Source of Truth & Read-Only Governance
- Treat all Figma files as strictly READ-ONLY. Never attempt write-back mutations.
- Ground all component generation in `src/styles/tokens.css` and the respective spec at `docs/specs/[name]-spec.md`.
- Never make repeated live API calls during code generation loops. Read from cached ASTs in `docs/figma-data/raw/` and manifest in `docs/figma-data/asset-manifest.json`.

## 2. Token & Styling Guardrails
- **ZERO inline style objects**: `style={{ ... }}` is forbidden in UI primitives.
- **ZERO arbitrary Tailwind bracket notation**: (e.g., `bg-[#111827]`, `w-[320px]`, `p-[14px]`).
- All color, typography, spacing, and radius decisions must map to semantic tokens from `tokens.css`.
- Ensure icon SVGs use `fill="currentColor"` to inherit parent text colors dynamically.
- Interactive variants must be declared using `class-variance-authority` (`cva`).

## 3. Architecture & React Server Components (RSC)
- Keep page-level layouts (`src/app/**/page.tsx`) as Server Components (no `"use client"`).
- Restrict `"use client"` strictly to interactive leaf components (forms, dialog triggers, dropdowns).
- Use Tailwind Container Queries (`@container`) for widgets placed in multi-width parent slots.

## 4. Defensive Layout & Accessibility
- Never use `position: absolute` or `position: fixed` for structural page scaffolding.
- All flex children rendering text must include `min-w-0` alongside `truncate` or `break-words`.
- Icon-only buttons must provide explicit `aria-label` attributes.
- Interactive elements must implement standard `focus-visible:ring-2 focus-visible:ring-primary` rings.

## 5. Pipeline Gates & Verification
- Always create a matching `.stories.tsx` file in Storybook for any new UI primitive.
- Run and pass `npm run lint:tokens` and `npm run build-storybook` before finalizing changes.

## 6. Flattened Figma Raster & Vision Switchover Guardrail
- When a Figma AST node is detected as a flattened raster image (`RECTANGLE` with image fill, or 0 vector/text children):
  - **NEVER throw an error or abort code generation.**
  - Switch immediately to the multi-modal AI Vision model using the corresponding screenshot in `inputs/vision/[slug].png` and bounding box notes in `inputs/vision/[slug].json`.
  - Extract layout structure, typography, and visible copy directly from the visual mockup.

## 7. Mandatory Strict Halt on Missing or Ambiguous Figma Node ID
- **Zero Guessing Mandate**: If any block lacks a `figmaNodeId` or if there is any ambiguity, confusion, or multiple candidate nodes:
  - **STOP THE PROCESS IMMEDIATELY.**
  - Present the block title, visible text, and potential candidate nodes to the user.
  - Wait for explicit user confirmation before authoring or modifying code.

## 8. Missing Resource & Inline Style Confirmation Gate
- If an asset (image, picture, icon) is not available for any block, or if a non-token color/dimension must be placed inline:
  - **STOP AND ASK THE USER EXPLICITLY.**
  - Never guess, synthesize arbitrary external URLs (e.g. Unsplash), or insert unauthorized inline styles.

## 9. In-Code Discrepancy Header & Central Ledger Governance
- **In-Code Audit Header**: Whenever a block has a discrepancy, missing resource, or temporary override, place a structured comment block at the top of the component (`.html`, `.php`, `.tsx`, `.liquid`) detailing the issue, dates, and status so that any AI or developer can inspect it.
- **Central Issues Tracker**: All component issues must be recorded in `Docs/COMPONENT_ISSUES_TRACKER.md`.
- **Strict Non-Deletion Policy**: When an issue is fixed, update its status to `[RESOLVED]`. **NEVER DELETE RESOLVED ENTRIES.**

## 10. Block-Level Custom CSS (`src/styles/blocks.css`)
- Root CSS with global design tokens (`src/styles/tokens.css`) remains untouched.
- If block-level custom CSS is required, place it in `src/styles/blocks.css`.
- Scoped block styles must be enclosed within clear boundary comments:
  ```css
  /* ---------<blockName>-------------- */
  ... block styles ...
  /* ---------<blockName>-------------- */
  ```


