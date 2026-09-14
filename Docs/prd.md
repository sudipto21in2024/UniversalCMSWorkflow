# Product Requirements Document (PRD)

## 1. Project Overview & Objective
- **Project Name**: [Project / Application Name]
- **Primary Goal**: Build high-performance, accessible, token-driven web application directly from Figma designs.
- **Tech Stack**:
  - Framework: Next.js (App Router) + TypeScript
  - Styling: Tailwind CSS + CSS Custom Properties (`src/styles/tokens.css`) + Container Queries
  - Headless UI: Radix UI primitives (`@radix-ui/*`)
  - Icons: Lucide React (`lucide-react`)
  - Component Sandbox: Storybook 8

---

## 2. Figma Master Resources
- **Design System / Foundations Frame**: `https://www.figma.com/design/<FILE_KEY>/<FILE_NAME>?node-id=<NODE_ID>`
- **Key Screens Overview**:
  1. `[Screen 1 Name]`: `<FIGMA_URL>`
  2. `[Screen 2 Name]`: `<FIGMA_URL>`

---

## 3. Core Functional Requirements
- Multi-breakpoint responsive layouts (Mobile < 640px, Tablet 768px, Desktop 1024px+).
- Strict adherence to WCAG 2.2 AA accessibility standards.
- Full edge-case coverage: Loading skeletons, Empty states, Filtered-empty states, API Error states.
