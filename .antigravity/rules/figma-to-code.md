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
