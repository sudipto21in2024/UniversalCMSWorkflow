# Figma Page / Screen Assembly Prompt

## Context:
- **PRD**: `docs/prd.md`
- **Screen Spec**: `docs/specs/{{screen_name}}-spec.md`
- **Figma Screen Link**: {{figma_screen_url}}
- **Available UI Primitives**: `src/components/ui/`
- **Design Tokens**: `src/styles/tokens.css`

---

## Instructions:

### 1. Ingest Screen AST & Assets:
- Run offline sync:
  ```bash
  npm run figma:sync "{{figma_screen_url}}" "{{screen_name}}"
  ```

### 2. Validate Component Availability:
- Inspect `docs/specs/{{screen_name}}-spec.md` Section 3 (Component Inventory).
- Check if all required Tier 1 primitives exist in `src/components/ui/`.
- If missing, build them first using `.antigravity/prompts/make-component.md`.

### 3. Build Composed Route:
- Create `src/app/{{route}}/page.tsx`.
- Strictly adhere to React Server Component boundaries:
  - Page wrapper & static layouts are Server Components (no `"use client"`).
  - Push `"use client"` strictly down to interactive leaf nodes (search bars, modals, action triggers).
- Implement defensive layouts:
  - Pure document flow (CSS Grid / Flexbox).
  - Use container queries (`@container`) on composite modules where appropriate.
  - Implement `min-w-0`, `truncate`, or `line-clamp-2` on dynamic user text.
- Implement all edge-case states: Default, Skeleton Loading, Empty State, Error State.

### 4. Verification:
- Run `npm run lint:tokens`.
- Run `npm run build` to verify Next.js compilation and RSC boundaries.
