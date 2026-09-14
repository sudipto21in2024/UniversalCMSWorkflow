# 1-Step Figma-to-Component Generator Prompt

## Inputs:
- **Target Figma Component URL**: {{figma_url}}
- **Target Component Name**: {{component_name}} (e.g., `Button`, `Badge`, `MetricCard`)
- **Target Layer**: `src/components/ui/` (Tier 1 Primitive) or `src/components/modules/` (Tier 2 Composite)

---

## Instructions:

### 1. Fetch Figma API Data:
- Execute terminal command:
  ```bash
  npm run figma:sync "{{figma_url}}" "{{component_name}}"
  ```
- Verify the AST JSON is cached at `docs/figma-data/raw/{{component_name}}-ast.json`.

### 2. Pre-Flight Design Audit:
- Run pre-flight linter:
  ```bash
  npm run figma:lint "{{figma_url}}"
  ```
- If critical errors or warnings appear, formulate a code-level compensation proposal (wrap raw groups in flex/grid, map detached hex to tokens, synthesize missing error/disabled states) and obtain user confirmation.

### 3. Generate Component Implementation:
- Write `src/components/ui/{{component_name}}.tsx`.
- Use `class-variance-authority` (`cva`) for all variants and sizes.
- Use Radix UI primitives if headless behavior is required (dialog, dropdown, tooltip).
- Export explicit TypeScript interfaces for all props.
- Strictly adhere to `src/styles/tokens.css` and `tailwind.config.ts`. NO inline styles or bracketed Tailwind syntax.

### 4. Generate Storybook Stories:
- Write `src/components/ui/{{component_name}}.stories.tsx`.
- Include stories covering all variants, sizes, and states (Default, Hover/Focus, Loading, Disabled, Empty/Error).

### 5. Verification & Quality Gates:
- Run `npm run lint:tokens` to confirm 0 hardcoded styling violations.
- Run `npm run build-storybook` to verify TypeScript typing and clean compilation.
