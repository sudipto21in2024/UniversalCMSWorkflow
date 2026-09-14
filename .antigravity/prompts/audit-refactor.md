# Senior UI Engineer Refactoring & Audit Prompt

Act as a Senior UI/UX Frontend Engineer, Accessibility Specialist, and Performance Architect.
Review and audit the code generated for: `{{target_path}}`

---

## Audit Checklist:

### 1. Design System & Token Adherence:
- [ ] Are any hex codes, arbitrary pixels (`w-[327px]`, `p-[15px]`), or inline styles hardcoded?
- [ ] Do all colors, radii, shadows, and spacing steps map to `tokens.css`?

### 2. Accessibility (WCAG 2.2 AA Compliance):
- [ ] Correct semantic heading hierarchy (Single `<h1>`, sequential `<h2>`, `<h3>`).
- [ ] Icon-only buttons have explicit `aria-label` or `<span className="sr-only">`.
- [ ] Visible, high-contrast `:focus-visible` focus rings (`focus-visible:ring-2 focus-visible:ring-primary`).

### 3. Layout Defense & Resilience:
- [ ] Pure document flow: zero arbitrary absolute positioning used for layout blocks.
- [ ] Flex children rendering text have `min-w-0` to avoid horizontal blowout.
- [ ] Dynamic strings have `truncate` or `line-clamp` handling.
- [ ] Empty, Loading skeleton, and Error states exist and match specs.

### 4. RSC & Performance:
- [ ] Correct separation of Server and Client components (`"use client"` on leaf nodes only).
- [ ] Vector icons use `fill="currentColor"`.

---

## Action:
Enter Plan Mode, detail all detected issues and remediation diffs, and apply fixes upon approval.
Run `npm run lint:tokens` to confirm zero styling violations.
