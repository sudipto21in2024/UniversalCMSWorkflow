

Figma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc4
User prompt: https://www.youtube.com/watch?v=j-YvrDrH-sw Please analyze this video . Understand the full steps in details . I want to replicate
the process with figma and antigravity . Create a prompt or documents to implement this flow in antigravity. Also copy the ai prompts used in
each process.
Response: This video breaks down a 6-step workflow to convert Figma designs into production-ready front-end code using Figma Model
Context Protocol (MCP), headless UI primitives, Storybook, and an AI coding agent [00:26].
## Key Workflow Breakdown
[Figma Design System & Screens]
## │
▼ (Figma MCP + PRD / Specs)
- Design Tokens Extraction (tokens.css / Tailwind theme)
## │
## ▼
- Isolated Component Creation (Radix UI / Headless Primitives)
## │
## ▼
- Verification in Storybook (Review states, props, edge cases)
## │
## ▼
- Page / Screen Composition (Assemble using pre-built components)
## │
## ▼
- Senior UI Engineering Refactoring & Code Audit (Plan Mode)
Step-by-Step Breakdown
1Prepare PRD and Per-Screen Spec Documents
Context grounding before writing code
Create a dedicated documentation folder (e.g., docs/specs/ and docs/prd.md) inside the project workspace [01:38]:
prd.md: Goals, core features, out-of-scope items, tech stack (Next.js/React, Tailwind CSS, Radix UI, Storybook), and master Figma
links.
screen-spec.md: Scope of the screen, user interaction flows, data models, component inventory needed, and edge cases (loading,
empty, error) [02:12].
2Extract Design Tokens via Figma MCP
Eliminates hardcoded hex values and magic numbers
Using the Figma MCP connection, feed the link to the Figma Design System / Foundations frame [03:18].
Extract colors, typography scales, border radii, shadows, and spacing into a centralized tokens.css file [03:50].
Map these CSS variables into Tailwind CSS configuration (tailwind.config.ts or Tailwind v4 theme variables) [03:50].
3Configure Storybook for Isolated Component Sandbox
Prevents UI regressions and allows visual inspection
Initialize Storybook in the workspace [03:36]. Storybook isolates UI components from application business logic, letting you verify
component variants, hover states, and responsive behavior before screen assembly [06:06].
4Build Atomic & Foundation Components in Batches
Build small primitives first
Build primitive components (Button, Input, Badge, Banner, Card) using headless libraries (like Radix UI) styled with extracted design
tokens [05:38]:
For each component, provide the component's Figma node URL, tokens.css, and relevant spec.
Require the agent to generate both [Component].tsx and [Component].stories.tsx [06:01].
5Compose Screens from Pre-Built Components
One-shot screen generation using validated components
Provide the screen-level Figma link and screen specification document [07:54]. Direct the agent to assemble the page layout strictly by
importing and composing the components created in Step 4 [08:20].
6Senior UI Engineer Audit & Refactoring
Plan Mode automated code review
Run a rigorous refactoring checklist in agent planning mode [09:23]. The audit checks for:
Semantic HTML & heading hierarchies (h1 -> h2 -> h3) [09:35].
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc41/49

Proper accessibility attributes (ARIA labels, keyboard focus states).
Missing edge-case handling (empty states, truncation, loading skeletons) [09:35].
Verification that no colors or spacing values are hardcoded.
AI Prompt Library for Antigravity
Copy and use these exact prompts across the workflow inside your Antigravity agent sessions.
## Prompt 1: Project Initialization & Dependency Setup
Read the attached PRD at `docs/prd.md`.
Please enter Plan Mode and create a structured task list to:
- Initialize the application with the specified tech stack (Next.js App Router, TypeScript, Tailwind CSS).
- Install headless component primitives (@radix-ui/react-* or equivalent) and lucide-react icons.
- Install and configure Storybook for isolated component development.
- Set up the folder structure:
- src/components/ui (reusable primitive components)
- src/components/modules (composed page-specific blocks)
- src/styles/tokens.css (design tokens)
- docs/specs/ (per-screen specifications)
Execute the plan step-by-step after confirmation.
Prompt 2: Design Token Extraction via Figma MCP
## Context:
- Project PRD: `docs/prd.md`
- Figma Design System Frame: <PASTE_FIGMA_DESIGN_SYSTEM_URL>
## Instructions:
- Use the Figma MCP tool to inspect the design system frame.
- Extract all design decisions (color palette, functional/semantic colors, typography scale, spacing units, border
- Generate a clean CSS variables file at `src/styles/tokens.css`.
- Update `tailwind.config.ts` (or `@theme` in Tailwind CSS v4) to map these CSS variables to Tailwind utility class
- Ensure zero values are hardcoded; all colors, radii, and spacing must reference CSS custom properties.
Prompt 3: Isolated Component Generation with Storybook
## Context:
- PRD: `docs/prd.md`
## - Design Tokens: `src/styles/tokens.css`
- Component Figma Frame: <PASTE_FIGMA_COMPONENT_NODE_URL>
## Instructions:
- Use Figma MCP to inspect the component variants and states (default, hover, active, focus-visible, disabled, erro
- Implement the component in `src/components/ui/<ComponentName>.tsx` using Radix UI primitives and Tailwind classes
- Implement `src/components/ui/<ComponentName>.stories.tsx` in Storybook covering:
- All variants (Primary, Secondary, Outline, Destructive, Ghost)
- All sizes (sm, md, lg)
- All dynamic states (Default, Hover, Disabled, Loading)
- Verify TypeScript types and export prop interfaces cleanly.
## Prompt 4: Screen / Page Assembly
## Context:
- PRD: `docs/prd.md`
## - Screen Spec: `docs/specs/<screen-name>-spec.md`
- Figma Screen Link: <PASTE_FIGMA_SCREEN_URL>
## - Available Components: `src/components/ui/`
## Instructions:
- Inspect the Figma screen layout via Figma MCP.
- Read the screen spec for user flows, mock data schema, and edge cases.
- Build the page in `src/app/<route>/page.tsx` strictly composing pre-existing components from `src/components/ui/`
- If a custom layout module is needed, create it under `src/components/modules/`.
- Include mock data structures and handle states: Default, Loading skeleton, Empty data state, and Error boundary s
Prompt 5: Senior UI Engineer Refactoring & Audit
Act as a Senior UI/UX Frontend Engineer and Accessibility Specialist.
Review and refactor the code generated for `<ComponentOrPagePath>`:
## Checklist:
- Design System Adherence: Are any hex codes, arbitrary pixels (e.g., `w-[327px]`), or inline styles hardcoded? Rep
## 2. Accessibility (a11y):
- Correct heading hierarchy (only one `<h1>`, sequential `<h2>`, `<h3>`).
- Interactive elements have explicit `aria-label` where icons are used without text.
- Visible and consistent `:focus-visible` rings.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc42/49

## 3. Edge Cases & Resilience:
- Are long text strings handled gracefully with `truncate` or `line-clamp`?
- Are loading states and empty states present?
## 4. Code Quality & Performance:
- Clean component modularity and prop naming.
- Separation of client components (`"use client"`) and server components.
Please enter Plan Mode: identify all critical issues and recommendations first, then apply the fixes upon approval.
## Antigravity Workspace Rule Document
Save this as .antigravity/rules/figma-to-code.md or as a workspace context document in Antigravity:
# Figma-to-Code Engineering Rules for Antigravity
## ## Core Principles
- **Never build directly from raw screenshots**: Always reference Figma MCP node data, `docs/prd.md`, and the respe
- **Tokens First**: All colors, radii, shadows, and font sizes must reference `src/styles/tokens.css` or Tailwind t
- **Atomic Isolation**: Always generate components in isolation with matching Storybook stories (`.stories.tsx`) be
- **Headless Base**: Use Radix UI primitives for accessible, unstyled behavior; apply styling via Tailwind tokens.
- **Always Run Audit**: Run the Senior UI Engineering checklist before committing any generated page.
User prompt: yes
Response: Here is the production-grade Screen Specification Template. Save this file under docs/specs/[screen-name]-spec.md for each
page you build.
# Screen Spec: [Screen Name] (e.g., Team Directory / Home Dashboard)
## ## 1. Overview & Objectives
- **Route / URL**: `/team` or `/dashboard`
- **Purpose**: Primary workspace for managing employee directory, roles, and status.
- **Target Users**: HR Managers, Team Leads, Admin roles.
- **Figma Frame Node URL**: `https://www.figma.com/design/<FILE_KEY>/<FILE_NAME>?node-id=<NODE_ID>`
## ---
## ## 2. Layout & Page Structure
- **Page Type**: Dashboard Page (Desktop primary, responsive tablet/mobile down to 375px).
- **Layout Grid**: 12-column grid, max-width `1440px`, horizontal padding `24px` (desktop) / `16px` (mobile).
- **Header / Navigation**: Fixed sidebar navigation (`src/components/modules/Sidebar.tsx`), global top bar with brea
- **Main Content Area**:
- **Page Header**: Title (`<h1>`), subtitle, primary action button ("+ Add Member").
- **Filter & Search Bar**: Search input, department filter dropdown, status filter badge-group.
- **Data Display**: Paginated data table (Desktop) / expandable card list (Mobile).
- **Bottom Bar / Pagination**: Record count display and page switcher controls.
## ---
## 3. UI Component Inventory
All components MUST be imported from `src/components/ui/` or defined under `src/components/modules/`:
## | Component Name | Source | Purpose | Variants / Props Used |
## | :--- | :--- | :--- | :--- |
| `Button` | `src/components/ui/Button` | Primary action ("+ Add Member"), secondary export | `variant="primary"`, `
| `Input` | `src/components/ui/Input` | Search by name, email, or role | `type="search"`, `icon="Search"` |
| `Badge` | `src/components/ui/Badge` | Employee status indicator | `status="active"`, `status="inactive"`, `status=
| `DropdownMenu` | `src/components/ui/DropdownMenu` | Row action triggers (Edit, Delete, Suspend) | Radix UI primiti
| `Table` | `src/components/ui/Table` | Main employee data grid | Responsive, sortable columns |
| `Skeleton` | `src/components/ui/Skeleton` | Loading state placeholder for table rows | `count=5`, `height="48px"`
## ---
## ## 4. User Interaction & Action Flows
## ### Flow 1: Search & Filtering
- **Trigger**: User types in the search input or selects a dropdown option.
- **Behavior**: Debounce search queries by `300ms`. Update query parameters (`?search=...&status=...`) to support de
- **Fallback**: Display `EmptyState` component if no records match criteria.
## ### Flow 2: Modal Open / Row Actions
- **Trigger**: Click "+ Add Member" or select "Edit" in row actions.
- **Behavior**: Open modal dialog (`Radix Dialog`). Trap focus inside modal, lock body scroll, close on `Esc` or ove
## ---
## ## 5. Mock Data Schema & Contracts
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc43/49

## ```typescript
export interface Employee {
id: string;
fullName: string;
email: string;
avatarUrl: string | null;
role: string;
department: "Engineering" | "Design" | "Product" | "HR" | "Finance";
status: "Active" | "Inactive" | "On Leave";
joinedDate: string; // ISO 8601 string: "YYYY-MM-DD"
## }
export interface EmployeeDirectoryResponse {
data: Employee[];
pagination: {
page: number;
pageSize: number;
totalRecords: number;
totalPages: number;
## };
## }
## 6. Component States & Edge Cases
Default State: Table populated with records, active sort header on "Name (A-Z)".
Loading State: Render 6 table skeleton rows (Skeleton component). Action buttons disabled.
Empty State (No Data in System):
## Icon: Users (lucide-react)
Heading: No team members yet
Body: Start adding your team members to organize departments and access.
## Action: Button (+ Add First Member)
Filtered Empty State (No Search Results):
Heading: No matching members found
Body: Try adjusting your search terms or clearing filters.
Action: Button (Clear Filters)
Error State: Render inline error alert banner with retry button.
## Data Truncation Rules:
Names over 24 characters: Truncate with ellipsis (truncate), display full name on hover via Tooltip.
Email addresses: Truncate on mobile viewports.
- Accessibility (a11y) & SEO Requirements
Semantic hierarchy: Single <h1>Team Members</h1>, section headers using <h2>.
Interactive icon buttons must have explicit aria-label (e.g., aria-label="Open member actions menu").
Sortable column headers must include aria-sort="ascending" or aria-sort="descending".
All interactive focus states must use focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary.
## ---
### Execution Prompt to Generate Code from this Spec
Paste this prompt into Antigravity once your spec file is created:
## ```markdown
Read the spec file at `docs/specs/<screen-name>-spec.md` and check the design tokens in `src/styles/tokens.css`.
Please enter Plan Mode and:
- Validate that all required primitive components exist in `src/components/ui/`. If any are missing, list them for
- Build the composed page layout in `src/app/<route>/page.tsx`.
- Include mock datasets matching the TypeScript schema in the spec.
- Implement all states defined in Section 6 (Default, Skeleton Loading, Empty, Filtered Empty, Error).
- Ensure zero hardcoded hex colors or arbitrary spacing classes.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc44/49

User prompt: if tehere is no design token in figma then what to do
Response: When a Figma file does not have formal variables or design tokens defined, you create an inferred design token system.
Instead of pulling named variables from Figma, your AI coding agent uses Figma MCP to inspect the raw frames across your key screens, audit
recurring values, and synthesize a structured tokens.css and Tailwind config before building components.
Step 1: Run an Automated Figma Audit Prompt
Point the AI agent to your primary screens (e.g., Home, Dashboard, Settings) and run this prompt:
## Context:
The provided Figma file does not have predefined variables or design tokens.
## Figma Screen Frames:
## - <PASTE_FIGMA_SCREEN_1_URL>
## - <PASTE_FIGMA_SCREEN_2_URL>
## - <PASTE_FIGMA_SCREEN_3_URL>
## Instructions:
- Use Figma MCP to inspect the raw styles across all provided screen frames.
- Group and consolidate recurring raw values into logical token scales:
- Colors: Primary brand, neutrals/grays, surfaces/backgrounds, borders, semantic feedback (success, warning, erro
- Typography: Font families, font sizes (px/rem), line-heights, and font weights.
- Spacing: Consolidate recurring layout margins, paddings, and gap distances (e.g., 4px, 8px, 12px, 16px, 24px, 3
- Radii & Shadows: Consolidate border radii (e.g., 4px, 8px, 12px, 9999px) and drop shadow values.
- Eliminate minor inconsistencies (e.g., if `#1A1A1A` and `#1B1B1B` both appear, consolidate them into a single neu
- Output the result into `src/styles/tokens.css` using CSS custom properties.
- Update `tailwind.config.ts` (or `@theme` in Tailwind CSS v4) to map these variables.
Step 2: What the Generated tokens.css Looks Like
The audit will output a standardized token file that serves as your single source of truth:
/* src/styles/tokens.css */
## :root {
## /* Surface & Background */
--bg-app: #F9FAFB;
--bg-surface: #FFFFFF;
--bg-surface-subtle: #F3F4F6;
## /* Text & Foreground */
## --text-primary: #111827;
--text-secondary: #4B5563;
--text-muted: #9CA3AF;
--text-inverse: #FFFFFF;
## /* Brand / Action */
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-subtle: #EFF6FF;
## /* Borders & Dividers */
--border-default: #E5E7EB;
--border-focus: #2563EB;
## /* Semantic Feedback */
--color-success: #16A34A;
--color-error: #DC2626;
--color-warning: #D97706;
## /* Radii */
## --radius-sm: 4px;
## --radius-md: 8px;
## --radius-lg: 12px;
## --radius-full: 9999px;
## /* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
## }
Step 3: Map Tokens into Tailwind
Connect the CSS variables to Tailwind utility classes so the agent can write standard Tailwind shorthand:
// tailwind.config.ts
import type { Config } from "tailwindcss";
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc45/49

const config: Config = {
content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
theme: {
extend: {
colors: {
app: "var(--bg-app)",
surface: {
DEFAULT: "var(--bg-surface)",
subtle: "var(--bg-surface-subtle)",
## },
primary: {
DEFAULT: "var(--color-primary)",
hover: "var(--color-primary-hover)",
subtle: "var(--color-primary-subtle)",
## },
content: {
primary: "var(--text-primary)",
secondary: "var(--text-secondary)",
muted: "var(--text-muted)",
## },
border: "var(--border-default)",
## },
borderRadius: {
sm: "var(--radius-sm)",
md: "var(--radius-md)",
lg: "var(--radius-lg)",
## },
boxShadow: {
sm: "var(--shadow-sm)",
md: "var(--shadow-md)",
## },
## },
## },
plugins: [],
## };
export default config;
Step 4: Strict Agent Rule for Downstream Code
Once tokens.css is generated, enforce that the agent never extracts raw hex values from Figma again. Add this rule to your agent session:
"Always use the tokens defined in src/styles/tokens.css and tailwind.config.ts. Even if Figma inspection returns raw hex
codes like #111827 or arbitrary pixels like padding: 15px, map them to the closest existing token (text-content-primary, p-4).
Do not invent new ad-hoc styles."
User prompt: how will the components be identified
Response: In this workflow, components are identified systematically using a three-pass decomposition strategy rather than relying on
guesswork.
Here is exactly how components are detected, classified, and inventoried from your Figma file into your code workspace:
- The 3-Tier Component Classification Model
Before writing any code, visual elements in Figma are categorized into three distinct architectural layers (based on Atomic Design principles):
## ┌────────────────────────────────────────────────────────┐
## │  Tier 3: Page Layouts / Views                          │
│  (Team Directory Page, Analytics Dashboard, Settings)  │
## └──────────────────────────┬─────────────────────────────┘
│ composes
## ┌──────────────────────────▼─────────────────────────────┐
## │  Tier 2: Composite Modules / Blocks                    │
│  (MemberTable, MetricCardGrid, FilterBar, InviteModal) │
## └──────────────────────────┬─────────────────────────────┘
│ composes
## ┌──────────────────────────▼─────────────────────────────┐
│  Tier 1: Atomic Primitives (Design System Foundations) │
│  (Button, Input, Badge, Avatar, Dropdown, Dialog)      │
## └────────────────────────────────────────────────────────┘
Tier 1 (Primitives): Headless, context-agnostic building blocks. No business logic, purely driven by props.
Tier 2 (Modules/Patterns): Reusable domain-specific assemblies (e.g., a search bar with a filter dropdown and clear button together).
Tier 3 (Pages): The final route assembly tying modules and data hooks together.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc46/49

- How the AI / Engineer Identifies Components
When analyzing Figma screens with Figma MCP, the component identification uses three concrete signals:
A. Node Metadata & Figma Layer Inspection (Figma MCP)
Figma MCP inspects the actual document tree structure:
Figma COMPONENT / COMPONENT_SET Nodes: Elements published in the Figma assets panel or component library. These directly map to
src/components/ui/.
Variant Properties: Elements with variant props (e.g., variant=outline, size=sm, state=hover) indicate that a single parameterized
component is required rather than separate components.
Named Auto-Layout Frames: Frames titled Button, SearchInput, Card, or Badge signal standalone UI entities.
B. The "Reuse & State" Heuristic (For files with messy or un-named layers)
If the Figma file is unorganized and doesn't use proper Figma components, elements are identified by applying two tests:
- The Repetition Rule (Count ): Any UI element that appears in more than one place (e.g., status badges on multiple tables, metric
summary cards on multiple screens) is extracted into src/components/ui/ or src/components/modules/.
- The Interactive State Rule: Any element that accepts user input, clicks, hovers, focus states, or dynamic loading (inputs, buttons, modal
triggers, pagination controls) must be an isolated component.
## 3. Automated Component Inventory Prompt
To have Antigravity automatically scan your Figma screens, identify the full component inventory, and output a dependency matrix, run this
prompt:
## Context:
- PRD: `docs/prd.md`
## - Figma Screen Frames:
## - <PASTE_FIGMA_SCREEN_1_URL>
## - <PASTE_FIGMA_SCREEN_2_URL>
## Instructions:
- Use Figma MCP to inspect the layer hierarchy of the provided screen frames.
- Decompose the visual UI into a structured Component Inventory:
- Tier 1: Primitives (buttons, inputs, dropdowns, badges, icons, tooltips, dialogs)
- Tier 2: Composite Modules (tables, filter bars, card widgets, navigation bars)
- For each identified Tier 1 Primitive, specify:
- Proposed file path (`src/components/ui/<Name>.tsx`)
- Recommended headless library base (e.g., `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, or custom R
- Required variants & props (e.g., `variant`, `size`, `isLoading`, `disabled`)
- Output this inventory as a Markdown table in `docs/component-inventory.md` and enter Plan Mode before generating
- Output: docs/component-inventory.md Example
Running the identification step produces a clear roadmap for what to build first in Storybook before touching full pages:
## Layer
## Component
## Name
Base PrimitiveVariants & PropsTarget Path
Tier 1ButtonHTML <button>
variant (primary, secondary, outline,
ghost), size (sm, md, lg), isLoading
src/components/ui/Button.tsx
Tier 1BadgeHTML <span>
status (active, inactive, warning,
neutral), size (sm, md)
src/components/ui/Badge.tsx
Tier 1DropdownMenu
## @radix-ui/react-
dropdown-menu
trigger, items[], align (start, end)src/components/ui/DropdownMenu.tsx
Tier 1InputHTML <input>
type (text, search, email), hasError,
iconLeft, iconRight
src/components/ui/Input.tsx
Tier 2FilterBarComposed
onSearchChange, onStatusFilter,
onClear
src/components/modules/FilterBar.tsx
Tier 2MemberTable
Composed (Table,
## Badge, Dropdown)
data[], isLoading, onEdit, onDeletesrc/components/modules/MemberTable.tsx
User prompt: yes
Response: Here is the prompt to run a Component Gap & Reuse Analysis.
## ≥2
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc47/49

This allows Antigravity to audit your identified component inventory against standard headless primitives (Radix UI / shadcn/ui), determine what
can be reused directly via CLI/npm, and list only the custom wrappers and extensions needed.
## Prompt: Component Library Audit & Reuse Matcher
## Context:
## - Component Inventory: `docs/component-inventory.md`
## - Design Tokens: `src/styles/tokens.css`
- Tech Stack: Next.js (App Router), Tailwind CSS, Lucide Icons, TypeScript
## Instructions:
- Review all Tier 1 Primitives and Tier 2 Modules listed in `docs/component-inventory.md`.
- Compare each item against standard headless UI primitives (Radix UI / shadcn/ui components):
- Categorize as **[Direct CLI/Package]**: Can be added directly via CLI / package (e.g., Dialog, DropdownMenu, To
- Categorize as **[Token-Styled Primitives]**: Standard HTML elements requiring custom Tailwind styling with our
- Categorize as **[Composite Modules]**: Custom page-level blocks composed from multiple primitives (e.g., Member
- Generate a structured execution report in `docs/component-reuse-plan.md` containing:
- Command list to install the necessary base headless packages (e.g., `npx shadcn@latest add ...` or `npm install
- Detailed mapping showing which props/variants need customization to align with our Figma tokens.
- The exact build order (Dependencies First -> Primitives -> Composites -> Storybook Stories).
- Enter Plan Mode and wait for confirmation before executing any installations or code changes.
What the Resulting docs/component-reuse-plan.md Output Looks Like
## # Component Implementation & Reuse Plan
## 1. Package / CLI Installation Commands
## ```bash
# Add headless Radix primitives via CLI
npx shadcn@latest add dialog dropdown-menu avatar tooltip popover select
# Add auxiliary utilities
npm install lucide-react class-variance-authority clsx tailwind-merge
## 2. Component Mapping & Customization Matrix
## Identified
## Component
Base / SourceCustomization NeededAction
## Button
## Native <button> +
cva
Map variants (primary, secondary,
outline, ghost) to tokens.css
Build custom wrapper in
src/components/ui/button.tsx
BadgeNative <span> + cva
Map status colors (active, inactive,
on-leave, warning)
Build custom wrapper in
src/components/ui/badge.tsx
DropdownMenu
## @radix-ui/react-
dropdown-menu
Adjust trigger focus rings, item padding,
and surface backgrounds
Style shadcn base with tokens
## Dialog / Modal
## @radix-ui/react-
dialog
Adjust overlay opacity, border radii, and
entry animation
Style shadcn base with tokens
MemberTableComposite
## Composes Table, Badge, Avatar,
DropdownMenu
Build composite in
src/components/modules/member-table.tsx
## 3. Recommended Build Sequence
- Foundation Primitives: button.tsx, badge.tsx, input.tsx, avatar.tsx + Storybook stories.
- Overlay & Dropdown Primitives: dropdown-menu.tsx, dialog.tsx, tooltip.tsx + Storybook stories.
- Composite Modules: filter-bar.tsx, member-table.tsx.
- Final Screen Assembly: src/app/team/page.tsx.
## ---
### Next Step in Antigravity
Once you approve the plan generated by this prompt, execute the batch creation prompt:
## ```markdown
Approve plan `docs/component-reuse-plan.md`. Please execute Step 1 (package installations) and Step 2 (Foundation Pr
User prompt: one big problem is that the ai generally creates inline style and doesn't reuse styles
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc48/49

Response: AI coding agents default to inline styles (style={{ ... }}) and arbitrary classes (bg-[#1F2937], w-[342px]) because Figma
inspection tools return raw pixel coordinates and hex values, not abstract tokens. Without strict guardrails, LLMs choose the path of least
resistance: directly copying raw values into markup.
To completely prevent this in Antigravity, apply a 3-layer containment system: architectural primitives (CVA), strict negative prompt rules,
and an automated AST/ESLint blocker.
Layer 1: Establish Component Variants with CVA (class-variance-authority)
Instead of letting AI write freeform Tailwind or inline styles in JSX, enforce cva for all UI primitives. This forces the model to define styles once in
a variant matrix rather than sprinkling styles inline.
// src/components/ui/button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva(
"inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus
## {
variants: {
variant: {
primary: "bg-primary text-white hover:bg-primary-hover",
secondary: "bg-surface-subtle text-content-primary hover:bg-surface-muted",
outline: "border border-border bg-transparent text-content-primary hover:bg-surface-subtle",
destructive: "bg-error text-white hover:bg-error-hover",
## },
size: {
sm: "h-8 px-3 text-xs",
md: "h-10 px-4 text-sm",
lg: "h-12 px-6 text-base",
## },
## },
defaultVariants: {
variant: "primary",
size: "md",
## },
## }
## );
## Layer 2: Antigravity Styling Constraint Rules
Add these explicit negative constraints to your project instructions (.antigravity/rules/no-inline-styles.md or workspace rules):
## # Styling & Token Strict Rules
## Forbidden Patterns (Instant Rejection)
- **NO Inline Style Objects**: Never use the `style={{ ... }}` prop in React components unless calculating a purely
- **NO Arbitrary Tailwind Values**: Never use square brackets for colors or spacing (e.g., `bg-[#2563EB]`, `text-[#
- **NO Hardcoded Hex, RGB, or HSL**: All colors must use semantic Tailwind token classes (`bg-surface`, `text-conte
- **NO Direct Layout Hardcoding in Primitives**: Do not bake outer margins (`mt-4`, `mb-6`) into reusable UI primit
## ## Mandatory Patterns
- Use semantic Tailwind utility classes mapped directly to `src/styles/tokens.css`.
- Use standard spacing scales (`gap-2`, `gap-4`, `gap-6`, `p-4`, `p-6`) instead of matching pixel fractions from Fi
- Every component variant must be declared using `cva()` in `src/components/ui/`.
Layer 3: The "Anti-Inline Refactoring" Prompt
When generating screens or auditing components, run this prompt to catch and scrub inline styles and arbitrary classes automatically:
## Context:
- Target File: <PATH_TO_COMPONENT_OR_PAGE>
## - Token Mapping: `src/styles/tokens.css`
## Task:
Perform a Strict Styling Audit on the target file:
- Scan for any `style={{ ... }}` attributes:
- Extract and replace them with standard Tailwind token classes.
- If a style cannot be mapped, define a new CSS variable in `tokens.css` first.
- Scan for arbitrary values using bracket syntax (e.g., `[#...]`, `[...px]`):
- Replace arbitrary colors with our semantic tokens (`primary`, `surface`, `content-secondary`, etc.).
- Replace arbitrary pixel paddings/margins with standard Tailwind grid steps (e.g., replace `15px` with `p-4`).
- Check for repeated class combinations:
- If a group of 4+ Tailwind utility classes is repeated across 3 or more elements, extract it into a dedicated co
Show a diff of removed inline/arbitrary styles and apply the refactored code.
Layer 4: Tooling Enforcement (ESLint Rule)
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc49/49

Add this ESLint configuration to your project to make the build fail automatically if inline styles or bracketed Tailwind colors slip through:
## // .eslintrc.json
## {
## "rules": {
## "react/forbid-dom-props": ["error", { "forbid": ["style"] }],
## "no-restricted-syntax": [
## "error",
## {
"selector": "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3,6}/]",
"message": "Direct hex colors in className are forbidden. Use semantic design tokens from tokens.css."
## }
## ]
## }
## }
This four-layer setup prevents the agent from falling back on quick-and-dirty inline styles, guaranteeing consistent tokens throughout your
codebase.
User prompt: yes
Response: Here is an automated enforcement solution to catch arbitrary Tailwind brackets ([#...], [...px]) and raw inline styles. It includes
both a dedicated pre-commit/CI scanner script (zero config, immediate) and a strict ESLint configuration.
Solution 1: Zero-Dependency Linter Script (scripts/audit-tokens.mjs)
Create this script in your project root. It scans all .tsx, .jsx, .ts, and .js files using AST/RegEx pattern matching and exits with an error code
(exit(1)) if AI generates raw styles.
// scripts/audit-tokens.mjs
import fs from "node:fs";
import path from "node:path";
const TARGET_DIRS = ["src/app", "src/components", "src/modules"];
const EXTENSIONS = [".tsx", ".jsx", ".ts", ".js"];
// Patterns that violate design token architecture
const VIOLATIONS = [
## {
name: "Arbitrary Color Bracket",
regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[#(?:[0-9a-fA-F]{3,8})\][^"']*["']/g,
message: "Arbitrary hex brackets like `bg-[#...]` or `text-[#...]` are forbidden. Map to tokens.css.",
## },
## {
name: "Arbitrary Pixel Bracket",
regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[\d+(?:\.\d+)?(?:px|rem|em)\][^"']*["']/g,
message: "Arbitrary measurement brackets like `w-[320px]` or `p-[14px]` are forbidden. Use standard Tailwind sca
## },
## {
name: "Inline Style Attribute",
regex: /style=\{\{[^}]*\}\}/g,
message: "Inline `style={{ ... }}` objects are forbidden in standard UI components.",
## },
## ];
let totalViolations = 0;
function scanFile(filePath) {
const content = fs.readFileSync(filePath, "utf-8");
const lines = content.split("\n");
VIOLATIONS.forEach(({ name, regex, message }) => {
lines.forEach((line, lineIdx) => {
// Allow explicit exemptions with an inline comment: // token-ignore
if (line.includes("// token-ignore")) return;
const matches = line.match(regex);
if (matches) {
totalViolations++;
console.error(`\x1b[31m[FAIL]\x1b[0m ${filePath}:${lineIdx + 1}`);
console.error(`  \x1b[33mIssue:\x1b[0m ${name} found -> "${matches[0].trim()}"`);
console.error(`  \x1b[36mFix:\x1b[0m   ${message}\n`);
## }
## });
## });
## }
function traverseDirectory(dir) {
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc410/49

if (!fs.existsSync(dir)) return;
const entries = fs.readdirSync(dir, { withFileTypes: true });
for (const entry of entries) {
const fullPath = path.join(dir, entry.name);
if (entry.isDirectory()) {
if (entry.name !== "node_modules" && entry.name !== ".next") {
traverseDirectory(fullPath);
## }
} else if (EXTENSIONS.includes(path.extname(entry.name))) {
scanFile(fullPath);
## }
## }
## }
console.log(" Scanning codebase for inline styles and arbitrary Tailwind brackets...\n");
TARGET_DIRS.forEach(traverseDirectory);
if (totalViolations > 0) {
console.error(`\x1b[31m❌ Scan failed with ${totalViolations} styling violation(s).\x1b[0m`);
console.error("Please replace hardcoded values with design tokens before committing.\n");
process.exit(1);
} else {
console.log("\x1b[32m✔ All styles strictly adhere to the Design Token System!\x1b[0m\n");
process.exit(0);
## }
## Solution 2: Package.json Scripts & Git Hooks
Add the audit script to your package.json so you and your AI agent can run validation instantly:
## {
## "scripts": {
"lint:tokens": "node scripts/audit-tokens.mjs",
"check-all": "npm run lint && npm run lint:tokens && npm run build"
## }
## }
Add to Git Pre-Commit Hook (Husky / lint-staged)
npx husky add .husky/pre-commit "npm run lint:tokens"
Solution 3: ESLint AST Rules (.eslintrc.json or Flat Config)
If you prefer pure ESLint errors inside VS Code and Antigravity's editor linter, add these AST selector rules to .eslintrc.json:
## {
## "rules": {
## "react/forbid-dom-props": [
## "error",
## {
## "forbid": [
## {
"propName": "style",
"message": "Inline style objects are forbidden. Use semantic Tailwind utility classes."
## }
## ]
## }
## ],
## "no-restricted-syntax": [
## "error",
## {
"selector": "JSXAttribute[name.name='className'] > Literal[value=/\\[(#[0-9a-fA-F]{3,8}|\\d+(px|rem))\\]/]",
"message": "Arbitrary bracket notation (e.g. `[#1a1a1a]`, `[320px]`) is forbidden. Use design tokens from to
## },
## {
"selector": "JSXAttribute[name.name='className'] > JSXExpressionContainer TemplateLiteral[quasis.raw=/\\[(#[
"message": "Arbitrary bracket notation inside template strings is forbidden. Use design tokens."
## }
## ]
## }
## }
## Antigravity Verification Prompt
Whenever the AI finishes generating or refactoring a component/page, run this command to auto-audit and fix:
Run the token validation command:
`npm run lint:tokens`
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc411/49

If any violations are reported:
- Identify the hardcoded hex or bracketed pixel measurements.
- Map them to the closest existing tokens in `src/styles/tokens.css` and `tailwind.config.ts`.
- Re-run `npm run lint:tokens` until 0 errors remain.
User prompt: how is Storybook fit in all the process
Response: In this workflow, Storybook serves as the isolated sandbox and verification checkpoint between Figma inspection and full-page
assembly.
Without Storybook, AI coding agents generate full pages in one shot. This forces business logic, API calls, and layout styling to be written
simultaneously, making visual bugs and missing edge cases difficult to isolate and debug.
Where Storybook Fits in the Pipeline
[1. Figma MCP]
## │
## ▼
## [2. Design Tokens (tokens.css)]
## │
## ▼
[3. Generate Component (Button.tsx)]
## │
## ▼
[4. STORYBOOK SANDBOX] ◄─── (Isolate, verify all states & props in browser)
## │
## ├── State 1: Default / Hover / Active
## ├── State 2: Disabled
## ├── State 3: Loading / Skeleton
## └── State 4: Error / Empty
## │
▼ (Only after Storybook stories pass visual review)
## [5. Assemble Page (page.tsx)]
Key Roles of Storybook in this Architecture
- Isolated Component Prototyping (Zero Backend Dependency)
Components are developed and verified without setting up backend routes, mock servers, or complex database states.
If a component breaks, the failure is isolated to that specific component file—not hidden inside a 500-line page file.
## 2. Exhaustive State Testing
In standard page development, dynamic states (e.g., isLoading, hasError, disabled, emptyState) are hard to trigger simultaneously.
Storybook forces the generation of .stories.tsx files that map every variant and prop side-by-side on a single screen.
- Visual Contract with Figma
Storybook provides a living catalog that mirrors Figma component sets (e.g., Primary vs. Secondary buttons, Small vs. Large badges).
Engineers and designers can visually compare the Storybook render against the Figma frame to confirm pixel-perfect token alignment.
## Concrete Example: Component + Storybook Pairing
When the agent creates a primitive component, it produces two files: the component and its story.
- The Component (src/components/ui/Button.tsx)
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
const buttonVariants = cva(
"inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus
## {
variants: {
variant: {
primary: "bg-primary text-white hover:bg-primary-hover",
secondary: "bg-surface-subtle text-content-primary hover:bg-surface-muted",
outline: "border border-border bg-transparent text-content-primary hover:bg-surface-subtle",
destructive: "bg-error text-white hover:bg-error-hover",
## },
size: {
sm: "h-8 px-3 text-xs",
md: "h-10 px-4 text-sm",
lg: "h-12 px-6 text-base",
## },
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc412/49

## },
defaultVariants: {
variant: "primary",
size: "md",
## },
## }
## );
export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement>,
VariantProps<typeof buttonVariants> {
isLoading?: boolean;
## }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
return (
## <button
ref={ref}
className={buttonVariants({ variant, size, className })}
disabled={disabled || isLoading}
## {...props}
## >
{isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
## {children}
## </button>
## );
## }
## );
Button.displayName = "Button";
- The Storybook Document (src/components/ui/Button.stories.tsx)
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
const meta: Meta<typeof Button> = {
title: "UI Primitives/Button",
component: Button,
tags: ["autodocs"],
argTypes: {
variant: {
control: "select",
options: ["primary", "secondary", "outline", "destructive"],
## },
size: {
control: "radio",
options: ["sm", "md", "lg"],
## },
isLoading: { control: "boolean" },
disabled: { control: "boolean" },
## },
## };
export default meta;
type Story = StoryObj<typeof Button>;
export const Primary: Story = {
args: { variant: "primary", children: "Save Changes" },
## };
export const Secondary: Story = {
args: { variant: "secondary", children: "Cancel" },
## };
export const Outline: Story = {
args: { variant: "outline", children: "Export Data" },
## };
export const LoadingState: Story = {
args: { variant: "primary", isLoading: true, children: "Saving..." },
## };
export const DisabledState: Story = {
args: { variant: "primary", disabled: true, children: "Unavailable" },
## };
## Storybook Agent Instruction Prompt
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc413/49

Add this rule to your Antigravity instructions so the AI treats Storybook as a mandatory pipeline gate:
## # Component Creation Gate Rule
Before assembling any page route (`src/app/**/page.tsx`):
- For every new primitive or module, create both `src/components/ui/<Name>.tsx` and `src/components/ui/<Name>.stori
- The Storybook file must document:
- All visual variants defined in the CVA schema.
- All interactive states (Default, Hover/Focus, Disabled, Loading/Empty).
- Do not proceed to full-page generation until component stories compile cleanly with zero TypeScript errors.
User prompt: yes
Response: Here is the complete configuration setup to initialize Storybook in a Next.js / Tailwind CSS workspace so that custom tokens.css
variables, Tailwind utilities, and custom font definitions load directly inside Storybook stories.
## Step 1: Install Storybook Packages
Run the standard Storybook framework initializer for Next.js:
npx storybook@latest init --type react --builder vite
# OR if using Next.js Webpack builder:
npx storybook@latest init --framework @storybook/nextjs
## Step 2: Global Preview Configuration (.storybook/preview.ts)
This file injects tokens.css and your global Tailwind stylesheet into every Storybook canvas preview, setting up the background colors and
layout viewports.
## // .storybook/preview.ts
import type { Preview } from "@storybook/react";
// 1. Import Design Tokens & Global Tailwind CSS
import "../src/styles/tokens.css";
import "../src/app/globals.css";
const preview: Preview = {
parameters: {
controls: {
matchers: {
color: /(background|color)$/i,
date: /Date$/i,
## },
## },
// Background canvas settings mapped to token surfaces
backgrounds: {
default: "app-surface",
values: [
## {
name: "app-bg",
value: "var(--bg-app, #F9FAFB)",
## },
## {
name: "app-surface",
value: "var(--bg-surface, #FFFFFF)",
## },
## {
name: "dark-surface",
value: "var(--bg-surface-dark, #111827)",
## },
## ],
## },
// Viewport presets to test responsive layout behavior
viewport: {
viewports: {
mobile: {
name: "Mobile (iPhone / Android)",
styles: { width: "375px", height: "667px" },
## },
tablet: {
name: "Tablet (iPad)",
styles: { width: "768px", height: "1024px" },
## },
desktop: {
name: "Desktop Screen",
styles: { width: "1440px", height: "900px" },
## },
## },
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc414/49

## },
layout: "centered",
## },
## };
export default preview;
## Step 3: Main Configuration (.storybook/main.ts)
Configures Storybook file resolution, static assets, and framework integration:
## // .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";
import path from "node:path";
const config: StorybookConfig = {
stories: [
## "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
## "../src/modules/**/*.stories.@(js|jsx|mjs|ts|tsx)",
## ],
addons: [
## "@storybook/addon-links",
## "@storybook/addon-essentials",
## "@storybook/addon-onboarding",
## "@storybook/addon-interactions",
"@storybook/addon-a11y", // Built-in accessibility checker
## ],
framework: {
name: "@storybook/nextjs",
options: {
builder: {
useSWC: true, // Fast Next.js compilation
## },
## },
## },
staticDirs: ["../public"],
webpackFinal: async (config) => {
if (config.resolve) {
config.resolve.alias = {
## ...config.resolve.alias,
"@": path.resolve(__dirname, "../src"),
## };
## }
return config;
## },
## };
export default config;
Step 4: Add NPM Scripts to package.json
Add the runner commands to start Storybook locally or build a static bundle for documentation:
## {
## "scripts": {
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
## }
## }
## Antigravity Setup Automation Prompt
Paste this into Antigravity to have the agent set up and verify Storybook automatically:
Please configure Storybook for our project:
- Verify that `.storybook/main.ts` and `.storybook/preview.ts` import `src/styles/tokens.css` and `src/app/globals.
- Configure alias resolution so `@/components/...` works inside Storybook stories.
- Install `@storybook/addon-a11y` for automated accessibility checks.
- Run `npm run build-storybook` to verify that all existing stories compile with zero errors.
User prompt: I am on figma free tier so can we not use figma mcp and use figma api for these
Response: Yes, you can absolutely do this without Figma MCP.
Figma MCP is just a wrapper around the Figma REST API. The Free tier gives you full access to generate a Personal Access Token (PAT)
and call the exact same REST API endpoints that MCP uses under the hood.
Here is how to set up and run this entire pipeline using direct Figma REST API extraction in your project.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc415/49

Step 1: Generate a Free Figma Personal Access Token
- Open Figma and log into your account.
- Go to Settings (click your profile avatar in the top-left corner)  Security.
- Scroll down to Personal Access Tokens.
- Click Generate new token, give it a name (e.g., Antigravity Extractor), and check Read-only scopes for file_content and
file_variables.
- Copy the token and add it to your .env.local file:
FIGMA_ACCESS_TOKEN="figd_your_token_here"
Step 2: Extracting File Key & Node ID from URLs
In any Figma URL, the API parameters are already present:
https://www.figma.com/design/aBcDeFgHiJkLmNoP/My-App-Design?node-id=123-456
## ▲                       ▲
## FILE KEY                 NODE ID
File Key: aBcDeFgHiJkLmNoP
Node ID: 123-456 (in API calls, URL-encoded as 123:456)
Step 3: Zero-Dependency Extraction Script (scripts/figma-extractor.mjs)
Save this Node.js script in your project root. It calls the official Figma REST API to extract raw nodes, components, colors, and layout data
directly into a local JSON cache:
// scripts/figma-extractor.mjs
import fs from "node:fs";
import path from "node:path";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_TOKEN) {
console.error("\x1b[31mError: FIGMA_ACCESS_TOKEN environment variable is missing in .env.local\x1b[0m");
process.exit(1);
## }
// Helper to parse Figma URLs
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch) throw new Error("Invalid Figma URL: Could not extract File Key.");

const fileKey = fileKeyMatch[1];
const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null;
return { fileKey, nodeId };
## }
async function fetchFigmaData(url) {
const { fileKey, nodeId } = parseFigmaUrl(url);
const endpoint = nodeId
? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
: `https://api.figma.com/v1/files/${fileKey}`;
console.log(` Fetching data from Figma API for file: ${fileKey}${nodeId ? ` (node: ${nodeId})` : ""}...`);
const response = await fetch(endpoint, {
headers: { "X-Figma-Token": FIGMA_TOKEN }
## });
if (!response.ok) {
throw new Error(`Figma API Error (${response.status}): ${await response.text()}`);
## }
return response.json();
## }
async function run() {
const figmaUrl = process.argv[2];
const outputName = process.argv[3] || "figma-dump.json";
if (!figmaUrl) {
console.error("Usage: node scripts/figma-extractor.mjs <FIGMA_URL> [output-filename.json]");
## →
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc416/49

process.exit(1);
## }
try {
const data = await fetchFigmaData(figmaUrl);
const outputPath = path.join(process.cwd(), "docs", "figma-data", outputName);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`\x1b[32m✔ Figma data saved to: ${outputPath}\x1b[0m`);
} catch (err) {
console.error(`\x1b[31mExtraction Failed:\x1b[0m ${err.message}`);
process.exit(1);
## }
## }
run();
Step 4: Add NPM Script to package.json
## {
## "scripts": {
"figma:pull": "node --env-file=.env.local scripts/figma-extractor.mjs"
## }
## }
Step 5: How the Workflow Operates (No MCP Needed)
Instead of the AI calling an MCP server in the background, you or the agent simply fetch the JSON snapshot directly:
- Fetch the Design System / Screens to JSON
npm run figma:pull "https://www.figma.com/design/xxx/App?node-id=10-2" tokens-source.json
- Prompt Antigravity to Generate Tokens from the Local JSON
## Context:
- Figma API Data: `docs/figma-data/tokens-source.json`
## Instructions:
- Inspect the AST tree in `docs/figma-data/tokens-source.json`.
- Extract all recurring fill colors, text styles (font size, weight, line-height), border radii, and paddings.
- Consolidate them into semantic design tokens in `src/styles/tokens.css`.
- Update `tailwind.config.ts` to map these custom properties to utility classes.
- Prompt Antigravity to Build Components from the Local JSON
# Pull a specific component frame (e.g. Button or Navbar)
npm run figma:pull "https://www.figma.com/design/xxx/App?node-id=45-120" button-node.json
## Context:
- Node JSON: `docs/figma-data/button-node.json`
## - Design Tokens: `src/styles/tokens.css`
## Instructions:
- Read the component layout and variant properties from `docs/figma-data/button-node.json`.
- Generate `src/components/ui/button.tsx` using CVA and our design tokens.
- Generate `src/components/ui/button.stories.tsx` documenting all variant states found in the JSON.
This bypasses any paid plan requirements or third-party MCP setups while giving you an offline cache of your design data right in your
repository.
User prompt: yes
Response: Here is the complete 1-Step Automation Command that instructs Antigravity to fetch the Figma JSON via the API script, parse the
design hierarchy, build the component with CVA and design tokens, and generate the Storybook story in a single prompt.
Antigravity One-Step Component Generator Prompt
Copy and paste this into Antigravity whenever you want to convert a Figma component URL into code:
Run the unified Figma-to-Component generation pipeline:
Target Figma Component URL: <PASTE_FIGMA_COMPONENT_URL>
Target Component Name: <ComponentName> (e.g., Badge, MetricCard, Navbar)
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc417/49

## Instructions:
- Fetch Figma API Data:
- Execute the terminal command:
`npm run figma:pull "<PASTE_FIGMA_COMPONENT_URL>" "<ComponentName>-node.json"`
- Verify the file is created at `docs/figma-data/<ComponentName>-node.json`.
## 2. Inspect & Parse Node Tree:
- Analyze `docs/figma-data/<ComponentName>-node.json` for layout (Flex/Auto-Layout direction, gap, padding), typo
- Map all raw visual values to our existing tokens in `src/styles/tokens.css` and `tailwind.config.ts`.
- Strictly forbid inline `style={{ ... }}` objects and arbitrary bracket notation (e.g., `[#...]`, `[32px]`).
## 3. Generate Component Implementation:
- Write `src/components/ui/<ComponentName>.tsx` (or `src/components/modules/<ComponentName>.tsx` if Tier 2 Compos
- Use `class-variance-authority` (`cva`) for all variants and sizes.
- Use Radix UI primitives if headless behavior is required (e.g., dialog, dropdown, tooltip).
- Export explicit TypeScript interfaces for all props.
## 4. Generate Storybook Stories:
- Write `src/components/ui/<ComponentName>.stories.tsx`.
- Include stories covering all variants, sizes, and states (Default, Hover/Focus, Loading, Disabled, Empty).
## 5. Verification:
- Run `npm run lint:tokens` to confirm zero hardcoded styles.
- Run `npm run build-storybook` (or compile check) to ensure zero TypeScript errors.
How to Save This as a Reusable Antigravity Rule / Slash Prompt
To make this instantly accessible without typing the full prompt every time, save it as a template inside your repository:
- Create a file at .antigravity/prompts/make-component.md
- Paste the prompt above with variable placeholders: {{figma_url}} and {{component_name}}.
- In Antigravity, trigger it directly:
Apply prompt `.antigravity/prompts/make-component.md` with:
- figma_url: "https://www.figma.com/design/aBcDeFg/App?node-id=204-512"
- component_name: "StatusBadge"
This automates the entire loop—API fetch, token mapping, component creation, Storybook testing, and token linting—with zero manual
intermediate steps.
User prompt: why does ai systems create a issue in layout and positioning while converting form figma
Response: The fundamental breakdown between Figma designs and AI-generated code comes down to an architectural mismatch: Figma
represents visual geometry on a 2D coordinate canvas, while modern web browsers render dynamic box models using DOM
hierarchies and layout engines (Flexbox/CSS Grid).
When an AI tries to translate one into the other, it runs into five structural bottlenecks:
- Coordinate-Based Thinking vs. Dynamic Flow
In Figma: Every layer exists at a specific  coordinate with explicit pixel dimensions (). Even with Auto Layout, the
underlying AST (Abstract Syntax Tree) exported by Figma's API retains absolute bounding boxes (absoluteBoundingBox: { x: 240,
y: 180, width: 320, height: 48 }).
In CSS/Web: Elements flow naturally in the document tree. Layout is driven by parent-child content wrapping, container queries, and fluid
sizing (min-width, max-width, 1fr, %).
The Failure: AI models often take the path of least resistance by generating absolute positioning (position: absolute; top: 180px;
left: 240px;) or fixed pixel dimensions (w-[320px] h-[48px]). As soon as the screen size changes or dynamic text is inserted, the
layout shatters.
- Auto Layout vs. True CSS Flexbox/Grid
While Figma's "Auto Layout" is modeled after CSS Flexbox, the mapping is not 1:1:
Missing Constraints in Figma: Designers frequently mix Auto Layout frames with freeform canvas groups. When an AI encounters a
nested frame without strict Auto Layout, it cannot infer whether the designer intended a CSS Grid, a wrapped Flex container, or a centered
stack.
Shrink & Grow Semantics: In Figma, layer sizing is defined as Fixed, Hug, or Fill. Translating Hug to w-fit, Fill to flex-1 or w-full,
and Fixed to responsive bounds requires semantic context about the element's purpose—something raw geometry JSON lacks.
Grid Blindness: Figma has layout grids for visual guides, but it has no native concept of CSS Grid tracks (grid-template-columns:
repeat(auto-fit, minmax(280px, 1fr))). The AI almost always defaults to nested Flexbox divs, leading to brittle alignment across
rows and columns.
- Missing Structural Hierarchy (Flattened Layer Trees)
## (X,Y)W×H
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc418/49

Designers frequently organize Figma layers based on visual grouping rather than DOM semantics (e.g., grouping a background rectangle,
an icon, and a text label under an unstructured Group 42).
A clean web layout requires a logical document tree:
<article class="card">
## <header>...</header>
## <main>...</main>
## </article>
When AI processes an unsemantic Figma layer tree, it creates "Div Soup"—deeply nested, arbitrary wrapper <div>s that disrupt CSS
inheritance, flex alignment (align-items, justify-content), and z-index stacking contexts.
- Static Mockups vs. Dynamic Content (Text Truncation & Wrapping)
Figma frames represent a single static state with fixed-length dummy text (e.g., "John Doe").
In production:
Names might be 40 characters long ("Dr. Alexandria Montgomery-Smith").
Multi-language localization changes text lengths by 30–50%.
Because the AI inspects only the static bounding box from Figma, it fails to generate defensive CSS:
It omits min-w-0, truncate, break-words, and line-clamp.
Without min-w-0 on Flex children, long dynamic text forces flex containers to overflow and break sibling alignments.
- Multi-Breakpoint & Responsive Hallucination
A Figma file usually contains isolated desktop () and mobile () frames with no programmatic link between them.
When you give an AI a single frame link, it only sees that single viewport width. It cannot "guess" the intermediate fluid transitions (
tablet,  small laptop).
As a result, the AI hardcodes the values for that specific frame width, completely omitting responsive Tailwind modifiers (md:flex-row,
lg:grid-cols-3).
Summary: Visual Representation vs. Browser Reality
DimensionWhat Figma ProvidesWhat Production UI Code Requires
PositioningVisual coordinates () & pixel boxesFluid document flow (Flexbox, Grid, Flow)
SizingFixed pixels ()
Intrinsic sizing (min-width, max-width, rem)
HierarchyVisual canvas layers & groups
Semantic DOM tree (<main>, <section>, <nav>)
ContentStatic strings and ideal-case vectorsDynamic content, wrapping, overflow handling
ResponsivenessDisconnected static canvas framesMedia queries, container queries, fluid layouts
How to Prevent This in AI Workflows
- Enforce Auto Layout in Figma: Ensure every layer in the design uses Auto Layout with explicit Hug or Fill settings before running
extraction.
- Decompose First (Atomic Primitives): Never prompt AI to build the entire page layout at once. Build atomic components (Button, Card,
Badge) first, and then compose the page grid.
- Use Explicit Layout Constraints in Prompts: Add negative rules forbidding absolute positioning (position: absolute, top-[], left-
[]) and arbitrary width/height pixel constraints on fluid containers.
User prompt: yes
Response: Here is a production-grade Defensive Layout Prompt & Linter Rule you can plug into Antigravity to force the AI to write robust,
fluid Flexbox/Grid CSS and completely eliminate layout breakage:
## 1. Antigravity Prompt: Defensive Layout & Responsive Structure
Use this prompt whenever you assemble pages, composite modules, or responsive containers:
## Context:
- Target Layout / Page: <PATH_OR_NAME>
- Figma Reference: <PASTE_FIGMA_URL_OR_NODE_JSON>
## - Token Reference: `src/styles/tokens.css`
## 1440px375px
## 768px
## 1024px
## X,Y
## 320px×48px
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc419/49

## Strict Layout Engineering Rules:
## 1. Pure Document Flow:
- FORBIDDEN: `position: absolute`, `position: fixed` (except for floating modals, tooltips, or pinned global head
- FORBIDDEN: Hardcoded widths/heights on containers (e.g., `w-[1140px]`, `h-[800px]`, `w-[360px]`).
- Use fluid container semantics: `w-full`, `max-w-7xl`, `mx-auto`, `min-h-screen`.
- CSS Grid & Flexbox Discipline:
- Multi-column card layouts MUST use CSS Grid with dynamic repeat syntax:
`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (or `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`).
- Do NOT nest endless `flex flex-col` divs to simulate a grid.
- Every Flex row containing text must include `min-w-0` on the flex child to prevent overflow blowout.
## 3. Dynamic Content Defense:
- All user-generated text fields (titles, names, descriptions, emails) must include truncation or multi-line clam
`truncate` for single-line, `line-clamp-2` or `break-words` for multi-line.
- All images/avatars must include fixed aspect ratios and shrink prevention (`shrink-0 aspect-square object-cover
## 4. Responsive Breakpoints:
- Mobile-First: Base classes apply to mobile (`<640px`), prefixed with `md:` for tablet and `lg:` for desktop.
- Sidebar + Main layout must fold into a collapsible drawer/stack on viewports under `1024px` (`lg`).
Inspect the target view, plan the structural DOM hierarchy, and write the layout adhering to these rules.
- Add Layout Lint Checks to scripts/audit-tokens.mjs
Extend your audit script with these layout rules so Antigravity automatically detects brittle layout anti-patterns before committing:
// Add these layout violation checks into scripts/audit-tokens.mjs:
## {
name: "Dangerous Absolute Positioning",
regex: /className=["'][^"']*\b(absolute|fixed)\b[^"']*(top-|left-|bottom-|right-)[^"']*["']/g,
message: "Avoid raw absolute positioning for structural layout. Use Flexbox or CSS Grid.",
## },
## {
name: "Hardcoded Fixed Dimension",
regex: /className=["'][^"']*\b[wh]-\[\d+(?:\.\d+)?(?:px)\][^"']*["']/g,
message: "Hardcoded pixel dimensions (e.g., `w-[320px]`, `h-[500px]`) break responsiveness. Use max-w, min-w, or T
## },
## {
name: "Flex Child Missing min-w-0",
regex: /className=["'][^"']*\bflex-1\b(?![^"']*\bmin-w-0\b)[^"']*["']/g,
message: "Flex children with `flex-1` containing text should include `min-w-0` to avoid text overflow blowout.",
## }
Summary Checklist for Perfect Layouts
Containers: Use max-w-* mx-auto px-4 md:px-6 lg:px-8 instead of fixed pixel widths.
Cards & Columns: Use CSS Grid (grid-cols-1 md:grid-cols-3) instead of calculated percentage flex divs.
Text Handling: Always add truncate or break-words alongside min-w-0 on flex items.
Icons & Badges: Always add shrink-0 to prevent them from squishing when adjacent text expands.
User prompt: What changes we can make in figma designs so that the ai systems can easily convert and understand the errors
Response: To make your Figma files machine-readable and eliminate AI hallucinations during code generation, the design canvas must be
structured like a formal DOM tree and state machine.
Here are the concrete changes to make directly inside Figma so AI systems and the Figma REST API can translate layout, typography, and
error states accurately.
- Structure Layers Like Semantic HTML (Eliminate "Group 42")
AI agents parse Figma's JSON node tree. If your layers are arbitrary groups or rectangles, the AI outputs "div soup."
Ban Raw Groups (Ctrl/Cmd + G): Replace standard groups with Auto Layout Frames (Shift + A). Frames have layout physics (flex
directions, padding, gaps); groups are just static coordinate bounding boxes.
Semantic Layer Naming: Rename your Figma frames to match standard HTML elements and React component names:
Name container frames: MainLayout, SidebarNav, Header, CardGrid, ModalDialog.
Name text layers: h1-title, h2-subtitle, p-body, caption, label, error-message.
Zero Loose Rectangles: Never draw a floating rectangle (R) as a card background or divider. Use the Frame’s native Fill property and
Stroke/Border property.
## 2. Enforce 100% Auto Layout Discipline
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc420/49

Layout bugs happen when AI encounters non-Auto-Layout containers and falls back to position: absolute.
## Set Explicit Resizing Behaviors:
Hug Contents (w-fit / h-fit): Use for buttons, badges, chips, and single-line labels that adjust to text length.
Fill Container (w-full / flex-1): Use for fluid grid items, search inputs, and text descriptions that span across their parent.
Fixed (w-[Xpx]): Restrict only to static elements like avatar icons (40px × 40px) or fixed sidebar widths (260px).
Nested Flex Directions: Ensure every parent and child frame explicitly declares its direction:
Horizontal layout = flex-row
Vertical layout = flex-col
Use Uniform Padding/Gaps on the 4px/8px Grid: Set paddings and gap distances in consistent steps (8px, 12px, 16px, 24px, 32px).
Avoid fractional/arbitrary numbers (13.5px, 27px).
- Model Interactive & Error States Explicitly in Component Sets
AI cannot guess how a form field looks when validation fails unless the states exist as structured variants in Figma.
Create a single Figma Component Set for every interactive component with structured variant properties:
Component Set: [InputField]
## ├── Variant: State = Default
## ├── Variant: State = Hover
## ├── Variant: State = Focused
## ├── Variant: State = Disabled
└── Variant: State = Error (Has explicit error text layer named "error-message")
How to Design the Error State in Figma:
- Red Border Token: Set the frame border stroke to a semantic token (e.g., border-color: var(--color-error) / #DC2626).
- Error Icon Slot: Include a dedicated alert icon (AlertCircle) with Auto Layout alignment.
- Helper / Error Text Layer: Add a dedicated text layer below the input named error-message or helper-text.
- Auto-Resize on Error: Make sure the parent form card uses vertical Auto Layout with Hug Contents so it dynamically expands when the
error text appears.
- Provide Visual Edge-Case Screens (The "State Matrix")
Instead of designing only the "happy path" with short mock text, provide explicit frames for realistic application states:
Screen Frame Title in FigmaWhat AI Extracts
Screen / TeamDirectory / DefaultMain data layout and populated table.
Screen / TeamDirectory / LoadingSkeletons, shimmer states, disabled action buttons.
Screen / TeamDirectory / EmptyZero-data illustration, headline, and primary CTA ("Add first member").
Screen / TeamDirectory / ErrorGlobal API failure banner, inline retry button, toast notifications.
Screen / TeamDirectory / LongTextOverflowNames with 40+ characters, verifying text wrap vs. truncation.
## 5. Standardize Local Styles & Figma Variables
If you are on the free tier without enterprise variable collections, use standard Figma Color Styles and Text Styles:
Color Styles: Create semantic styles rather than raw hex names:
Name them text/primary, text/muted, bg/surface, bg/surface-subtle, border/default, feedback/error,
feedback/success.
Typography Styles: Predefine text styles:
Heading/H1 (32px, bold, 40px line-height)
Heading/H2 (24px, semibold, 32px line-height)
Body/Regular (16px, regular, 24px line-height)
Body/Small (14px, regular, 20px line-height)
Feedback/ErrorText (12px, medium, 16px line-height)
When the Figma REST API extracts your file, these style IDs will be grouped cleanly, allowing the AI to generate a 1:1 tokens.css without
consolidating random hex values.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc421/49

## 6. Summary: Figma Preparation Checklist
[ ] Replace all visual Groups (`Cmd+G`) with Auto Layout Frames (`Shift+A`).
[ ] Eliminate all floating background rectangles; use Frame Fills and Borders.
[ ] Set width/height resizing rules to Hug or Fill (avoid Fixed on text and containers).
[ ] Name layers semantically (`h1-title`, `sidebar-nav`, `error-message`).
[ ] Create Component Sets with explicit `State=Error`, `State=Disabled`, and `State=Loading`.
[ ] Organize colors and typography into Figma Local Styles (`bg/surface`, `feedback/error`).
[ ] Add an Empty State and Error State frame alongside the main screen mockup.
User prompt: Can we create a program or anything which will allert the user that these items will probably create issues
Response: Yes. You can build an automated Figma Design Linter / Pre-Flight Scanner that parses the Figma REST API JSON tree before
any AI code generation begins.
It inspects the node hierarchy and flags anti-patterns (raw groups, non-auto-layout frames, hardcoded colors, missing error states, fixed widths
on text) as [CRITICAL], [WARNING], or [INFO].
Step 1: Create the Figma Pre-Flight Linter (scripts/figma-linter.mjs)
Save this script in your project. It requires zero external dependencies and runs directly in Node.js.
// scripts/figma-linter.mjs
import fs from "node:fs";
import path from "node:path";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_TOKEN) {
console.error("\x1b[31mError: FIGMA_ACCESS_TOKEN missing in environment.\x1b[0m");
process.exit(1);
## }
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch) throw new Error("Invalid Figma URL.");
return {
fileKey: fileKeyMatch[1],
nodeId: nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null,
## };
## }
async function fetchFigmaNodes(fileKey, nodeId) {
const endpoint = nodeId
? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
: `https://api.figma.com/v1/files/${fileKey}`;
const res = await fetch(endpoint, {
headers: { "X-Figma-Token": FIGMA_TOKEN },
## });
if (!res.ok) throw new Error(`Figma API returned ${res.status}: ${await res.text()}`);
return res.json();
## }
// Collector for audit issues
const issues = {
critical: [],
warning: [],
info: [],
## };
function auditNode(node, parent = null) {
const nodeName = node.name || "Unnamed";
const nodeType = node.type;
// 1. Check for Raw Groups (GROUP instead of Auto-Layout FRAME)
if (nodeType === "GROUP") {
issues.critical.push({
node: nodeName,
id: node.id,
rule: "Raw Group Detected",
message: "Group does not use Auto Layout. Convert to Frame (Shift+A) to prevent absolute positioning.",
## });
## }
// 2. Check for Frames missing Auto Layout
if (nodeType === "FRAME" && !node.layoutMode && node.children && node.children.length > 1) {
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc422/49

// Exclude top-level artboard/screen canvas
if (parent && parent.type !== "DOCUMENT" && parent.type !== "CANVAS") {
issues.critical.push({
node: nodeName,
id: node.id,
rule: "Missing Auto Layout",
message: "Frame has multiple children without Auto Layout (Flexbox). Will cause broken responsive flow.",
## });
## }
## }
// 3. Check for Fixed Sizing on Text Nodes (Truncation/Overflow risk)
if (nodeType === "TEXT") {
if (node.textAutoResize === "NONE") {
issues.warning.push({
node: nodeName,
id: node.id,
rule: "Fixed Size on Text Layer",
message: "Text bounding box is fixed. Long dynamic strings will overflow or clip. Set to 'Auto Width' or 'Au
## });
## }
## }
// 4. Check for Unsemantic / Default Layer Names
const unsemanticRegex = /^(Frame|Group|Rectangle|Vector|Ellipse|Component|Instance)\s*\d+$/i;
if (unsemanticRegex.test(nodeName.trim())) {
issues.info.push({
node: nodeName,
id: node.id,
rule: "Unsemantic Layer Name",
message: `Layer '${nodeName}' lacks descriptive naming. Rename to semantic name (e.g., 'user-avatar', 'card-he
## });
## }
// 5. Check for Detached / Raw Hex Colors (Unbound to Styles)
if (node.fills && Array.isArray(node.fills)) {
node.fills.forEach((fill) => {
if (fill.type === "SOLID" && fill.visible !== false) {
// If fill exists but no bound style ID or variable
const isBound = node.styles?.fill || node.boundVariables?.fills;
if (!isBound && !["#FFFFFF", "#000000"].includes(rgbToHex(fill.color))) {
issues.warning.push({
node: nodeName,
id: node.id,
rule: "Detached Raw Color",
message: `Uses hardcoded fill color (${rgbToHex(fill.color)}) without a Figma Color Style or Variable to
## });
## }
## }
## });
## }
// 6. Check Interactive Component Sets for Missing Error / Disabled States
if (nodeType === "COMPONENT_SET") {
const variantNames = (node.children || []).map((c) => c.name.toLowerCase());
const isInputOrButton = /input|field|select|button|dropdown/i.test(nodeName);

if (isInputOrButton) {
const hasErrorState = variantNames.some((v) => v.includes("error") || v.includes("invalid"));
const hasDisabledState = variantNames.some((v) => v.includes("disabled"));
if (!hasErrorState && /input|field|select/i.test(nodeName)) {
issues.warning.push({
node: nodeName,
id: node.id,
rule: "Missing Error State Variant",
message: "Input Component Set has no 'Error' or 'Invalid' state variant.",
## });
## }
if (!hasDisabledState) {
issues.info.push({
node: nodeName,
id: node.id,
rule: "Missing Disabled State Variant",
message: "Component Set has no 'Disabled' state variant.",
## });
## }
## }
## }
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc423/49

// Recursive descent
if (node.children) {
node.children.forEach((child) => auditNode(child, node));
## }
## }
function rgbToHex(c) {
if (!c) return "#000000";
const r = Math.round(c.r * 255).toString(16).padStart(2, "0");
const g = Math.round(c.g * 255).toString(16).padStart(2, "0");
const b = Math.round(c.b * 255).toString(16).padStart(2, "0");
return `#${r}${g}${b}`.toUpperCase();
## }
async function run() {
const figmaUrl = process.argv[2];
if (!figmaUrl) {
console.error("Usage: node scripts/figma-linter.mjs <FIGMA_URL>");
process.exit(1);
## }
try {
const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
console.log(`\n Auditing Figma Design Tree: ${fileKey} (node: ${nodeId || "root"})...\n`);

const data = await fetchFigmaNodes(fileKey, nodeId);
const rootNode = nodeId ? data.nodes[nodeId]?.document : data.document;
if (!rootNode) throw new Error("Could not locate root node in Figma payload.");
auditNode(rootNode);
## // Print Results
console.log("════════════════════════════════════════════════════════════");
console.log("                FIGMA PRE-FLIGHT AUDIT REPORT               ");
console.log("════════════════════════════════════════════════════════════\n");
if (issues.critical.length > 0) {
console.log(`\x1b[31m⛔ CRITICAL ISSUES (${issues.critical.length}) - Will cause AI code generation failures:\
issues.critical.forEach((issue) => {
console.log(`  • [\x1b[31m${issue.rule}\x1b[0m] Layer: "${issue.node}" (ID: ${issue.id})`);
console.log(`    ↳ ${issue.message}\n`);
## });
## }
if (issues.warning.length > 0) {
console.log(`\x1b[33m⚠ WARNINGS (${issues.warning.length}) - May lead to layout bugs or token drift:\x1b[0m`)
issues.warning.forEach((issue) => {
console.log(`  • [\x1b[33m${issue.rule}\x1b[0m] Layer: "${issue.node}" (ID: ${issue.id})`);
console.log(`    ↳ ${issue.message}\n`);
## });
## }
if (issues.info.length > 0) {
console.log(`\x1b[36mℹ RECOMMENDATIONS (${issues.info.length}) - Semantic naming & best practices:\x1b[0m`);
issues.info.forEach((issue) => {
console.log(`  • [\x1b[36${issue.rule}\x1b[0m] Layer: "${issue.node}" (ID: ${issue.id})`);
console.log(`    ↳ ${issue.message}\n`);
## });
## }
if (issues.critical.length === 0 && issues.warning.length === 0) {
console.log("\x1b[32m✔ Design is 100% clean and ready for AI Code Generation!\x1b[0m\n");
process.exit(0);
} else {
console.log("════════════════════════════════════════════════════════════");
console.log(`Total: ${issues.critical.length} Critical, ${issues.warning.length} Warnings, ${issues.info.lengt
console.log("Please address Critical and Warning issues in Figma before generating code.\n");
process.exit(issues.critical.length > 0 ? 1 : 0);
## }
} catch (err) {
console.error(`\x1b[31mLinter Execution Error:\x1b[0m ${err.message}`);
process.exit(1);
## }
## }
run();
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc424/49

Step 2: Add Command to package.json
## {
## "scripts": {
"figma:lint": "node --env-file=.env.local scripts/figma-linter.mjs"
## }
## }
Step 3: What the Terminal Output Looks Like
When you run:
npm run figma:lint "https://www.figma.com/design/aBcDeFg/App?node-id=10-52"
The output highlights exact Figma layer names and IDs needing attention:
## ════════════════════════════════════════════════════════════
## FIGMA PRE-FLIGHT AUDIT REPORT
## ════════════════════════════════════════════════════════════
⛔ CRITICAL ISSUES (2) - Will cause AI code generation failures:
- [Raw Group Detected] Layer: "Group 14" (ID: 10:55)
↳ Group does not use Auto Layout. Convert to Frame (Shift+A) to prevent absolute positioning.
- [Missing Auto Layout] Layer: "CardContainer" (ID: 10:62)
↳ Frame has multiple children without Auto Layout (Flexbox). Will cause broken responsive flow.
⚠ WARNINGS (2) - May lead to layout bugs or token drift:
- [Fixed Size on Text Layer] Layer: "user_description_p" (ID: 10:80)
↳ Text bounding box is fixed. Long dynamic strings will overflow or clip. Set to 'Auto Width' or 'Auto Height'.
- [Missing Error State Variant] Layer: "EmailInputField" (ID: 12:400)
↳ Input Component Set has no 'Error' or 'Invalid' state variant.
ℹ RECOMMENDATIONS (1) - Semantic naming & best practices:
- [Unsemantic Layer Name] Layer: "Rectangle 4" (ID: 10:95)
↳ Layer 'Rectangle 4' lacks descriptive naming. Rename to semantic name (e.g., 'user-avatar', 'card-header').
Step 4: Antigravity Auto-Gate Prompt
Use this prompt in Antigravity so the agent runs the linter before attempting any code generation:
Run the design pre-flight check:
`npm run figma:lint "<PASTE_FIGMA_URL>"`
If critical issues or warnings are returned:
- Stop execution and summarize the issues by layer name and node ID.
- Tell me which changes need to be made in Figma (e.g. converting Group 14 to Auto-Layout Frame, adding an Error va
- Do not generate code until the design passes the pre-flight audit.
User prompt: With user approval can ai fix the issues
Response: Yes, but where the AI fixes them depends on whether you mean updating the code during generation or modifying the actual Figma
canvas file.
Scenario A: AI Fixes the Issues in Code (100% Possible & Recommended)
If the Figma file has flaws (such as raw groups, hardcoded hex colors, or missing error states), the AI coding agent can automatically
compensate and correct them in the generated TypeScript/React code once you give approval.
When Antigravity detects Figma linter errors, it presents an Auto-Correction Plan:
[Figma Flaw]                         [AI Auto-Fix in Code]
"Group 14" (No Auto Layout)    ───►  Generated as `flex flex-col gap-4 w-full`
Raw Hex `#1F2937`              ───►  Mapped to token `text-content-primary`
Fixed Text Box `w-[320px]`     ───►  Converted to `w-full max-w-md truncate`
Missing "Error" Variant        ───►  Synthesized with standard `border-error` & helper text
Antigravity "Fix in Code with Approval" Prompt:
## Context:
Figma design pre-flight scan returned issues on: <PASTE_FIGMA_URL>
## Instructions:
- Review all issues flagged by `npm run figma:lint`.
- Enter Plan Mode and present an Auto-Fix Proposal:
- For non-Auto Layout groups: Explain how you will wrap them in semantic Flex/Grid Tailwind containers.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc425/49

- For raw hex values: Show how you will map them to tokens in `src/styles/tokens.css`.
- For missing states (Error/Disabled/Loading): Define the synthetic props and UI fallbacks you will generate.
- Wait for my explicit approval ("Approved").
- Upon approval, generate the component/page code applying all architectural fixes.
Scenario B: AI Modifies the Actual Figma File (.fig Canvas)
Modifying the visual Figma canvas file directly via AI is possible, but with a specific limitation:
The Figma REST API is Read-Only for canvas geometry: The public Figma REST API ([api.figma.com/v1/files/]
(https://api.figma.com/v1/files/)...) allows fetching data, posting comments, and creating dev resources, but it does not allow
creating or restructuring nodes on the canvas.
How to enable direct Figma canvas fixing: You run a Figma Plugin (using the Figma Plugin API) or a local WebSocket bridge. The
plugin runs inside Figma and has full programmatic write access to convert groups into Auto Layout frames, apply local color styles, and
rename layers automatically upon your approval.
How the Automated Figma Canvas Fixer Works:
- Node Script / Agent: Flags issues like "Group 14" or detached color #2563EB.
- Figma Plugin (Local): Receives the fix list and runs:
// Inside a Figma Plugin:
// 1. Convert Group to Auto Layout Frame
const frame = figma.createFrame();
frame.layoutMode = "VERTICAL";
frame.itemSpacing = 16;
// 2. Bind raw color to Design System Token Style
const colorStyle = figma.getLocalPaintStyles().find(s => s.name === "Primary/Brand");
if (colorStyle) node.fillStyleId = colorStyle.id;
- Canvas Result: Your Figma canvas is visually updated, grouped properly, and tokenized with a single click.
## Recommended Production Workflow
- For Immediate Development: Use Scenario A. Let Antigravity intercept the Figma flaws, present a compensation plan, and write clean,
tokenized React code upon your approval.
- For Long-Term Design Hygiene: Run the pre-flight linter report and apply the structural fixes (or run a cleanup plugin) on your master
Figma components so future screen generations remain clean.
User prompt: Which ever is safe bcos the person who is making the figma file and who converts in code is diff and the person who is generating
the code may not have the permission to modify the file or in enterprise senario it will be a violation of work . Think of this in details
Response: In enterprise and cross-functional teams, strict role boundaries are essential: Engineers and AI agents must treat Figma as a
Read-Only Source of Truth. Modifying design files without a designer's consent causes governance violations, broken design version histories,
and conflicts with design review workflows.
The enterprise-safe pattern is a Read-Only Ingestion & Non-Destructive Compensation Architecture:
[Design Domain: Read-Only]                [Engineering Domain: Controlled Execution]
## Figma Canvas                                Antigravity Workspace
## │                                                │
▼ (Read-Only API / MCP)                          │
## ┌───────────────────┐                              ┌───────▼────────┐
│  Figma Linter     │ ─── flags raw groups, ────►  │  Compensation  │
│  (Pre-flight)     │     detached hex, etc.       │  Engine / Plan │
## └───────────────────┘                              └───────┬────────┘
## │                                                │
│ (Optional automated comment/report)            ▼
## ▼                                        ┌────────────────┐
┌───────────────────┐                              │ Review & Gate  │ ──► User Approves
│ Designer Feedback │                              │ (Diff & Plan)  │
│ (Figma Comments)  │                              └───────┬────────┘
## └───────────────────┘                                      │
## ▼
## Production React /
TypeScript Code
## Key Enterprise Governance Guardrails
Zero Canvas Write-Back: The Figma API token requires strictly file_read permissions. It cannot alter nodes, styles, or layers on the
designer's canvas.
Non-Destructive Code Normalization: When the linter flags design flaws (e.g., an unconstrained group or an unlinked #1E293B color),
the AI maps them to the existing codebase design tokens (tokens.css / Tailwind) instead of copying the flaw or failing the build.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc426/49

Auditability & Traceability: The agent generates an inline normalization log (docs/specs/normalization-log.md) detailing every
deviation handled during code generation.
Non-Invasive Feedback Loop: Instead of modifying the canvas, the tool can post a read-only Figma Comment pinned to the node ID,
alerting the designer to Auto Layout issues without altering their artwork.
## Step 1: Safe Figma Commenter Script (scripts/figma-commenter.mjs)
This script posts non-destructive review comments directly to the designer's Figma file using standard REST endpoints, keeping the canvas
intact.
// scripts/figma-commenter.mjs
import fs from "node:fs";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
async function postFigmaComment(fileKey, nodeId, message) {
if (!FIGMA_TOKEN) {
console.error("Missing FIGMA_ACCESS_TOKEN.");
process.exit(1);
## }
const endpoint = `https://api.figma.com/v1/files/${fileKey}/comments`;
const response = await fetch(endpoint, {
method: "POST",
headers: {
"X-Figma-Token": FIGMA_TOKEN,
"Content-Type": "application/json",
## },
body: JSON.stringify({
message: `烙 [Dev-Linter Notice] ${message}`,
client_meta: nodeId ? { node_id: nodeId, node_offset: { x: 0, y: 0 } } : undefined,
## }),
## });
if (!response.ok) {
console.warn(`Could not post comment to Figma (${response.status}): ${await response.text()}`);
} else {
console.log(` Feedback comment posted to Figma node ${nodeId}`);
## }
## }
// Example usage triggered via CLI or Agent
const [, , fileKey, nodeId, ...msgParts] = process.argv;
if (fileKey && nodeId && msgParts.length > 0) {
postFigmaComment(fileKey, nodeId, msgParts.join(" "));
## }
Step 2: The Enterprise "Compensation & Review Gate" Prompt
Use this prompt in Antigravity. It performs the lint check, plans safe code-level remediations, and waits for your explicit sign-off before generating
any code.
## Context:
- Target Figma Node: <PASTE_FIGMA_URL>
## - Token Reference: `src/styles/tokens.css`
- Component Target: `src/components/ui/<ComponentName>.tsx`
## Operational Guidelines:
- Treat the Figma file as STRICTLY READ-ONLY. Do not attempt canvas writes.
- Run the pre-flight linter: `npm run figma:lint "<PASTE_FIGMA_URL>"`.
Pre-Generation Approval Gate (Plan Mode):
If discrepancies are found (raw groups, unlinked colors, missing responsive bounds):
- Present a Compensation Proposal in the following format:
- Flagged Issue: (e.g., Layer "Group 12" has no Auto Layout)
- Code Remedy: (e.g., Wrap in `flex flex-col gap-3 w-full` with semantic HTML `<section>`)
- Token Mapping: (e.g., Map raw `#2563EB` to `var(--color-primary)`)
- Synthetic States: (e.g., Generate standard disabled and error props not present in Figma)
Wait for explicit confirmation:
- Do NOT generate code until I respond with "Approved".
- After approval, implement the component with Storybook stories and log deviations in `docs/normalization-log.md`.
## Step 3: Example Compensation Proposal & Normalization Log
When discrepancies exist, the agent presents a clean plan for review:
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc427/49

Flagged Figma FlawLayer & IDProposed Code-Level CompensationToken Mapping
Raw GroupFilterGroup (12:44)Converted to <div className="flex flex-wrap gap-2">N/A
Detached HexButtonBg (12:48)Replaced #1D4ED8 with semantic classbg-primary-hover
Fixed Text BoxUserBio (12:55)Converted w-[280px] to dynamic responsive boundsw-full max-w-sm truncate
Missing VariantSearchInput (12:60)Added synthetic hasError & helper text propborder-error, text-error
This protects design assets, enforces strict corporate governance, and allows engineering to proceed without blocking on upstream design
revisions.
User prompt: yes
Response: Here is the complete consolidated blueprint and repository structure for your enterprise-safe, read-only Figma-to-Code pipeline in
## Antigravity.
## Recommended Project Structure
## ├── .antigravity/
│   ├── prompts/
│   │   ├── make-component.md       # 1-step Figma-to-Component prompt
│   │   ├── make-page.md            # Screen composition prompt
│   │   └── audit-refactor.md       # Senior UI Engineer review checklist
│   └── rules/
│       └── figma-to-code.md        # Workspace constraints (read-only, tokens-first)
## ├── .storybook/
│   ├── main.ts                     # Storybook Next.js / alias configuration
│   └── preview.ts                  # Injects tokens.css, globals.css, viewports
├── docs/
│   ├── figma-data/                 # Local offline cache of Figma JSON nodes
│   ├── specs/                      # Screen specifications (screen-spec.md)
│   ├── component-inventory.md      # Auto-identified 3-tier component matrix
│   └── normalization-log.md        # Audit trail of design deviations fixed in code
├── scripts/
│   ├── figma-extractor.mjs         # REST API fetcher (free tier PAT)
│   ├── figma-linter.mjs            # Pre-flight AST linter (flags groups, detached colors)
│   ├── figma-commenter.mjs         # Non-destructive feedback poster to Figma
│   └── audit-tokens.mjs            # Code linter catching inline styles & arbitrary brackets
├── src/
│   ├── app/                        # Next.js App Router pages
│   ├── components/
│   │   ├── ui/                     # Tier 1 Atomic Primitives (Button, Badge, Input)
│   │   └── modules/                # Tier 2 Composite Blocks (MemberTable, FilterBar)
│   ├── styles/
│   │   └── tokens.css              # CSS Custom Properties (Single Source of Truth)
│   └── lib/
│       └── utils.ts                # cn() helper (clsx + tailwind-merge)
└── .env.local                      # FIGMA_ACCESS_TOKEN (Read-only scope)
End-to-End Operational Checklist
StageActionCommand / ArtifactGate / Safeguard
## 0. Token
## Ingestion
Extract colors, typography, spacing
into code tokens
npm run figma:pull <SYSTEM_URL>
src/styles/tokens.css
Verify zero raw hex
values
- Pre-Flight
## Lint
Scan target frame for non-auto layout
or unlinked styles
npm run figma:lint <NODE_URL>
Blocks generation on
## [CRITICAL]
## 2. Approval
## Gate
Review AI Compensation Plan for
flagged issues
## Agent Plan Mode
User explicitly approves
code fixes
## 3. Build &
## Isolate
Generate CVA component and
Storybook stories
## .antigravity/prompts/make-component.md
Compiles in Storybook
## (:6006)
## 4. Code Token
## Audit
Verify no inline styles or arbitrary
brackets slipped in
npm run lint:tokens
Pre-commit hook
enforces 0 errors
## 5. Compose
## Page
Assemble route using pre-validated
primitives
docs/specs/[screen]-spec.md  page.tsx
Pure document flow
(Grid/Flex)
- Senior UI
## Audit
Final a11y, heading hierarchy, and
edge-case review
## .antigravity/prompts/audit-refactor.md
PR / Review ready
## →
## →
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc428/49

package.json Scripts Summary
Add this scripts block to wire up the entire pipeline:
## {
## "scripts": {
"dev": "next dev",
"build": "next build",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"figma:pull": "node --env-file=.env.local scripts/figma-extractor.mjs",
"figma:lint": "node --env-file=.env.local scripts/figma-linter.mjs",
"lint:tokens": "node scripts/audit-tokens.mjs",
"audit:all": "npm run lint:tokens && npm run build-storybook"
## }
## }
User prompt: Generate all baseline script and configuration files (scripts/figma-extractor.mjs, scripts/figma-linter.mjs, scripts/audit-tokens.mjs,
.storybook config, and workspace rules) ready to copy-paste.
Response: Here is the complete set of starter scripts, configuration files, and workspace rules ready to copy directly into your project.
- scripts/figma-extractor.mjs
Fetches raw AST nodes directly from the official Figma REST API using your personal access token.
import fs from "node:fs";
import path from "node:path";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_TOKEN) {
console.error("\x1b[31mError: FIGMA_ACCESS_TOKEN environment variable is missing in .env.local\x1b[0m");
process.exit(1);
## }
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch) throw new Error("Invalid Figma URL: Could not parse File Key.");
const fileKey = fileKeyMatch[1];
const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null;
return { fileKey, nodeId };
## }
async function fetchFigmaData(url) {
const { fileKey, nodeId } = parseFigmaUrl(url);
const endpoint = nodeId
? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
: `https://api.figma.com/v1/files/${fileKey}`;
console.log(` Fetching Figma API data: File ${fileKey}${nodeId ? ` (Node: ${nodeId})` : ""}...`);
const response = await fetch(endpoint, {
headers: { "X-Figma-Token": FIGMA_TOKEN },
## });
if (!response.ok) {
throw new Error(`Figma API Error (${response.status}): ${await response.text()}`);
## }
return response.json();
## }
async function run() {
const figmaUrl = process.argv[2];
const outputName = process.argv[3] || "figma-dump.json";
if (!figmaUrl) {
console.error("Usage: node scripts/figma-extractor.mjs <FIGMA_URL> [output-filename.json]");
process.exit(1);
## }
try {
const data = await fetchFigmaData(figmaUrl);
const outputPath = path.join(process.cwd(), "docs", "figma-data", outputName);
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc429/49

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`\x1b[32m✔ Figma payload successfully cached at: ${outputPath}\x1b[0m\n`);
} catch (err) {
console.error(`\x1b[31mExtraction Failed:\x1b[0m ${err.message}\n`);
process.exit(1);
## }
## }
run();
- scripts/figma-linter.mjs
Audits the Figma document tree before code generation and flags layout/token discrepancies.
import fs from "node:fs";
import path from "node:path";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_TOKEN) {
console.error("\x1b[31mError: FIGMA_ACCESS_TOKEN is missing in environment.\x1b[0m");
process.exit(1);
## }
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch) throw new Error("Invalid Figma URL.");
return {
fileKey: fileKeyMatch[1],
nodeId: nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null,
## };
## }
async function fetchFigmaNodes(fileKey, nodeId) {
const endpoint = nodeId
? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
: `https://api.figma.com/v1/files/${fileKey}`;
const res = await fetch(endpoint, {
headers: { "X-Figma-Token": FIGMA_TOKEN },
## });
if (!res.ok) throw new Error(`Figma API returned status ${res.status}: ${await res.text()}`);
return res.json();
## }
function rgbToHex(c) {
if (!c) return "#000000";
const r = Math.round(c.r * 255).toString(16).padStart(2, "0");
const g = Math.round(c.g * 255).toString(16).padStart(2, "0");
const b = Math.round(c.b * 255).toString(16).padStart(2, "0");
return `#${r}${g}${b}`.toUpperCase();
## }
const issues = {
critical: [],
warning: [],
info: [],
## };
function auditNode(node, parent = null) {
const nodeName = node.name || "Unnamed Layer";
const nodeType = node.type;
// 1. Raw Groups (Triggers coordinate-based positioning bug)
if (nodeType === "GROUP") {
issues.critical.push({
node: nodeName,
id: node.id,
rule: "Raw Group Detected",
message: "Group does not use Auto Layout. Needs Flexbox/Grid conversion.",
## });
## }
// 2. Missing Auto Layout on Multi-Child Frames
if (nodeType === "FRAME" && !node.layoutMode && node.children && node.children.length > 1) {
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc430/49

if (parent && parent.type !== "DOCUMENT" && parent.type !== "CANVAS") {
issues.critical.push({
node: nodeName,
id: node.id,
rule: "Missing Auto Layout",
message: "Frame has multiple children without Flexbox layout mode. Risks absolute positioning.",
## });
## }
## }
// 3. Fixed Dimensions on Dynamic Text
if (nodeType === "TEXT" && node.textAutoResize === "NONE") {
issues.warning.push({
node: nodeName,
id: node.id,
rule: "Fixed Text Bounds",
message: "Text bounding box is fixed. Long dynamic strings will overflow or truncate abruptly.",
## });
## }
## // 4. Detached Hardcoded Fills
if (node.fills && Array.isArray(node.fills)) {
node.fills.forEach((fill) => {
if (fill.type === "SOLID" && fill.visible !== false) {
const isBound = node.styles?.fill || node.boundVariables?.fills;
const hex = rgbToHex(fill.color);
if (!isBound && !["#FFFFFF", "#000000"].includes(hex)) {
issues.warning.push({
node: nodeName,
id: node.id,
rule: "Detached Raw Color",
message: `Uses unlinked raw color (${hex}). Map to a design token.`,
## });
## }
## }
## });
## }
## // 5. Unsemantic Layer Names
const unsemanticPattern = /^(Frame|Group|Rectangle|Vector|Ellipse|Component|Instance)\s*\d+$/i;
if (unsemanticPattern.test(nodeName.trim())) {
issues.info.push({
node: nodeName,
id: node.id,
rule: "Unsemantic Layer Name",
message: `Layer '${nodeName}' lacks descriptive naming for code generation.`,
## });
## }
if (node.children) {
node.children.forEach((child) => auditNode(child, node));
## }
## }
async function run() {
const figmaUrl = process.argv[2];
if (!figmaUrl) {
console.error("Usage: node scripts/figma-linter.mjs <FIGMA_URL>");
process.exit(1);
## }
try {
const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
console.log(`\n Linting Figma structure: ${fileKey} (node: ${nodeId || "root"})...\n`);
const data = await fetchFigmaNodes(fileKey, nodeId);
const rootNode = nodeId ? data.nodes[nodeId]?.document : data.document;
if (!rootNode) throw new Error("Could not find root document node.");
auditNode(rootNode);
console.log("════════════════════════════════════════════════════════════");
console.log("                FIGMA PRE-FLIGHT AUDIT REPORT               ");
console.log("════════════════════════════════════════════════════════════\n");
if (issues.critical.length > 0) {
console.log(`\x1b[31m⛔ CRITICAL ISSUES (${issues.critical.length}):\x1b[0m`);
issues.critical.forEach((item) => {
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc431/49

console.log(`  • [\x1b[31m${item.rule}\x1b[0m] "${item.node}" (ID: ${item.id})`);
console.log(`    ↳ ${item.message}\n`);
## });
## }
if (issues.warning.length > 0) {
console.log(`\x1b[33m⚠ WARNINGS (${issues.warning.length}):\x1b[0m`);
issues.warning.forEach((item) => {
console.log(`  • [\x1b[33m${item.rule}\x1b[0m] "${item.node}" (ID: ${item.id})`);
console.log(`    ↳ ${item.message}\n`);
## });
## }
if (issues.info.length > 0) {
console.log(`\x1b[36mℹ RECOMMENDATIONS (${issues.info.length}):\x1b[0m`);
issues.info.forEach((item) => {
console.log(`  • [\x1b[36m${item.rule}\x1b[0m] "${item.node}" (ID: ${item.id})`);
console.log(`    ↳ ${item.message}\n`);
## });
## }
console.log("════════════════════════════════════════════════════════════");
console.log(`Summary: ${issues.critical.length} Critical, ${issues.warning.length} Warnings, ${issues.info.lengt
process.exit(issues.critical.length > 0 ? 1 : 0);
} catch (err) {
console.error(`\x1b[31mLinter Error:\x1b[0m ${err.message}\n`);
process.exit(1);
## }
## }
run();
- scripts/audit-tokens.mjs
Audits written code to prevent inline styles, arbitrary Tailwind brackets, and layout anti-patterns.
import fs from "node:fs";
import path from "node:path";
const TARGET_DIRS = ["src/app", "src/components", "src/modules"];
const EXTENSIONS = [".tsx", ".jsx", ".ts", ".js"];
const VIOLATIONS = [
## {
name: "Arbitrary Color Bracket",
regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[#(?:[0-9a-fA-F]{3,8})\][^"']*["']/g,
message: "Arbitrary hex brackets (e.g. `bg-[#...]`) are forbidden. Map to tokens.css.",
## },
## {
name: "Arbitrary Pixel Bracket",
regex: /(?:className|class)=["'][^"']*\b[a-zA-Z0-9_-]+-\[\d+(?:\.\d+)?(?:px|rem)\][^"']*["']/g,
message: "Arbitrary measurement brackets (e.g. `w-[320px]`, `p-[14px]`) are forbidden. Use Tailwind scales.",
## },
## {
name: "Inline Style Attribute",
regex: /style=\{\{[^}]*\}\}/g,
message: "Inline `style={{ ... }}` objects are forbidden. Use semantic Tailwind utility classes.",
## },
## {
name: "Dangerous Absolute Positioning",
regex: /className=["'][^"']*\b(absolute|fixed)\b[^"']*(top-|left-|bottom-|right-)[^"']*["']/g,
message: "Avoid raw absolute positioning for layout. Use Flexbox or CSS Grid.",
## },
## ];
let totalViolations = 0;
function scanFile(filePath) {
const content = fs.readFileSync(filePath, "utf-8");
const lines = content.split("\n");
VIOLATIONS.forEach(({ name, regex, message }) => {
lines.forEach((line, lineIdx) => {
if (line.includes("// token-ignore")) return;
const matches = line.match(regex);
if (matches) {
totalViolations++;
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc432/49

console.error(`\x1b[31m[FAIL]\x1b[0m ${filePath}:${lineIdx + 1}`);
console.error(`  \x1b[33mIssue:\x1b[0m ${name} -> "${matches[0].trim()}"`);
console.error(`  \x1b[36mFix:\x1b[0m   ${message}\n`);
## }
## });
## });
## }
function traverseDirectory(dir) {
if (!fs.existsSync(dir)) return;
const entries = fs.readdirSync(dir, { withFileTypes: true });
for (const entry of entries) {
const fullPath = path.join(dir, entry.name);
if (entry.isDirectory()) {
if (entry.name !== "node_modules" && entry.name !== ".next") {
traverseDirectory(fullPath);
## }
} else if (EXTENSIONS.includes(path.extname(entry.name))) {
scanFile(fullPath);
## }
## }
## }
console.log(" Scanning codebase for inline styles and arbitrary Tailwind brackets...\n");
TARGET_DIRS.forEach(traverseDirectory);
if (totalViolations > 0) {
console.error(`\x1b[31m❌ Scan failed with ${totalViolations} styling violation(s).\x1b[0m\n`);
process.exit(1);
} else {
console.log("\x1b[32m✔ All styles strictly adhere to the Design Token System!\x1b[0m\n");
process.exit(0);
## }
## 4. Storybook Configuration
## .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";
import path from "node:path";
const config: StorybookConfig = {
stories: [
## "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
## "../src/modules/**/*.stories.@(js|jsx|mjs|ts|tsx)",
## ],
addons: [
## "@storybook/addon-links",
## "@storybook/addon-essentials",
## "@storybook/addon-interactions",
## "@storybook/addon-a11y",
## ],
framework: {
name: "@storybook/nextjs",
options: {
builder: {
useSWC: true,
## },
## },
## },
staticDirs: ["../public"],
webpackFinal: async (config) => {
if (config.resolve) {
config.resolve.alias = {
## ...config.resolve.alias,
"@": path.resolve(__dirname, "../src"),
## };
## }
return config;
## },
## };
export default config;
## .storybook/preview.ts
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc433/49

import type { Preview } from "@storybook/react";
// Design Tokens and Tailwind Styles
import "../src/styles/tokens.css";
import "../src/app/globals.css";
const preview: Preview = {
parameters: {
controls: {
matchers: {
color: /(background|color)$/i,
date: /Date$/i,
## },
## },
backgrounds: {
default: "app-surface",
values: [
{ name: "app-bg", value: "var(--bg-app, #F9FAFB)" },
{ name: "app-surface", value: "var(--bg-surface, #FFFFFF)" },
{ name: "dark-surface", value: "var(--bg-surface-dark, #111827)" },
## ],
## },
viewport: {
viewports: {
mobile: { name: "Mobile", styles: { width: "375px", height: "667px" } },
tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
## },
## },
layout: "centered",
## },
## };
export default preview;
## 5. .antigravity/rules/figma-to-code.md
Workspace instructions governing the agent's behavior during code generation.
# Figma-to-Code Workspace Rules & Guardrails
## 1. Source of Truth & Read-Only Governance
- Treat all Figma files as strictly READ-ONLY. Never attempt write-back mutations.
- Ground all component generation in `src/styles/tokens.css` and the respective spec at `docs/specs/[name]-spec.md`.
## ## 2. Token & Styling Enforcement
- NEVER use inline `style={{ ... }}` objects.
- NEVER use arbitrary Tailwind bracket notations (e.g., `bg-[#1A1A1A]`, `w-[340px]`, `p-[13px]`).
- All interactive variants must be structured using `class-variance-authority` (`cva`).
## ## 3. Layout Defense Rules
- Never use `position: absolute` or `position: fixed` for layout scaffolding.
- All dynamic flex children containing text must include `min-w-0` to avoid layout overflow.
- Multi-column card sets must use CSS Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
## ## 4. Pipeline Gates
- Always create a matching `.stories.tsx` file in Storybook for any new UI primitive.
- Verify zero errors on `npm run lint:tokens` before finalizing any component or page.
User prompt: All the pic and svg should be downloaded once and the structural json should be downloaded once and stored for future reference
Response: Here is the complete solution to implement One-Time Asset & Structural Ingestion with Local Caching.
This ensures your Figma SVGs, raster images, and JSON ASTs are downloaded once, stored in your local repository, and referenced offline for
all downstream code generation and Storybook stories.
Folder Architecture for Offline Caching
├── docs/
│   └── figma-data/
│       ├── raw/                 # Complete structural AST JSON dumps
## │       │   └── <node_name>.json
│       ├── assets/              # Downloaded SVGs & PNGs
│       │   ├── icons/           # Auto-downloaded vector icons (.svg)
│       │   └── images/          # Auto-downloaded raster assets (.png/.jpg)
│       └── asset-manifest.json  # Map of Figma Node IDs -> Local file paths
└── public/
└── figma-assets/            # Symlink or destination for Next.js public assets
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc434/49

## Automated Ingestion Script (scripts/figma-asset-sync.mjs)
Save this script in your project root. It performs three operations in a single run:
- Dumps the Structural JSON AST to docs/figma-data/raw/.
- Finds all Vector/Icon/Image Nodes and requests direct SVG/PNG URLs from the Figma Image REST API.
- Downloads and saves the files locally, generating an asset-manifest.json map for instant import in code.
// scripts/figma-asset-sync.mjs
import fs from "node:fs";
import path from "node:path";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_TOKEN) {
console.error("\x1b[31mError: FIGMA_ACCESS_TOKEN missing in .env.local\x1b[0m");
process.exit(1);
## }
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch) throw new Error("Invalid Figma URL: Missing File Key.");
return {
fileKey: fileKeyMatch[1],
nodeId: nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace("-", ":") : null,
## };
## }
// 1. Fetch Structural AST JSON
async function fetchFigmaDocument(fileKey, nodeId) {
const endpoint = nodeId
? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
: `https://api.figma.com/v1/files/${fileKey}`;
console.log(` [1/3] Fetching Structural JSON (File: ${fileKey}, Node: ${nodeId || "root"})...`);
const res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
if (!res.ok) throw new Error(`Figma File API returned status ${res.status}`);
return res.json();
## }
// 2. Discover Vector & Image Nodes in AST Tree
function collectAssetNodes(rootNode) {
const vectors = []; // Render as SVG
const images = [];  // Render as PNG
function traverse(node) {
if (!node) return;
const name = (node.name || "").toLowerCase();

// Detect vector icons
if (
node.type === "VECTOR" ||
node.type === "BOOLEAN_OPERATION" ||
name.startsWith("icon/") ||
name.startsWith("ic-") ||
name.includes("logo")
## ) {
vectors.push({ id: node.id, name: sanitizeName(node.name) });
return; // Stop descent for standalone icons
## }
// Detect raster image fills
if (node.fills && Array.isArray(node.fills)) {
const hasImageFill = node.fills.some(f => f.type === "IMAGE" && f.visible !== false);
if (hasImageFill) {
images.push({ id: node.id, name: sanitizeName(node.name) });
## }
## }
if (node.children) {
node.children.forEach(traverse);
## }
## }
traverse(rootNode);
return { vectors, images };
## }
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc435/49

function sanitizeName(str) {
return str
.replace(/[^a-zA-Z0-9-_]/g, "-")
## .replace(/-+/g, "-")
.toLowerCase();
## }
// 3. Batch Download Rendered Asset Files (SVGs & PNGs)
async function downloadAssetBatch(fileKey, nodeList, format, destDir) {
if (nodeList.length === 0) return {};
const ids = nodeList.map(n => n.id).join(",");
const endpoint = `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${format}`;
console.log(`  [2/3] Fetching ${nodeList.length} ${format.toUpperCase()} export links from Figma API...`);
const res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
if (!res.ok) throw new Error(`Figma Image API returned status ${res.status}`);

const { images: imageMap } = await res.json();
const manifestEntries = {};
fs.mkdirSync(destDir, { recursive: true });
for (const item of nodeList) {
const downloadUrl = imageMap[item.id];
if (!downloadUrl) continue;
const fileName = `${item.name}-${item.id.replace(":", "-")}.${format}`;
const filePath = path.join(destDir, fileName);
const assetRes = await fetch(downloadUrl);
const buffer = Buffer.from(await assetRes.arrayBuffer());
fs.writeFileSync(filePath, buffer);
manifestEntries[item.id] = {
name: item.name,
format,
localPath: path.relative(process.cwd(), filePath),
publicPath: `/figma-assets/${format === "svg" ? "icons" : "images"}/${fileName}`,
## };
## }
return manifestEntries;
## }
async function run() {
const figmaUrl = process.argv[2];
const tag = process.argv[3] || "screen";
if (!figmaUrl) {
console.error("Usage: node scripts/figma-asset-sync.mjs <FIGMA_URL> [tag_name]");
process.exit(1);
## }
try {
const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
const rawData = await fetchFigmaDocument(fileKey, nodeId);
// Save Structural JSON snapshot
const rawDir = path.join(process.cwd(), "docs", "figma-data", "raw");
fs.mkdirSync(rawDir, { recursive: true });
const rawPath = path.join(rawDir, `${tag}-ast.json`);
fs.writeFileSync(rawPath, JSON.stringify(rawData, null, 2));
console.log(` Structural AST cached: ${rawPath}`);
// Parse Nodes for Assets
const rootNode = nodeId ? rawData.nodes[nodeId]?.document : rawData.document;
const { vectors, images } = collectAssetNodes(rootNode);
const iconsDir = path.join(process.cwd(), "public", "figma-assets", "icons");
const imgDir = path.join(process.cwd(), "public", "figma-assets", "images");
// Download SVGs and PNGs
const svgManifest = await downloadAssetBatch(fileKey, vectors, "svg", iconsDir);
const pngManifest = await downloadAssetBatch(fileKey, images, "png", imgDir);
## // Update Master Asset Manifest
const manifestPath = path.join(process.cwd(), "docs", "figma-data", "asset-manifest.json");
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc436/49

let masterManifest = {};
if (fs.existsSync(manifestPath)) {
masterManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
## }
const merged = { ...masterManifest, ...svgManifest, ...pngManifest };
fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2));
console.log(`\x1b[32m✔ [3/3] Assets synced! Manifest updated at: ${manifestPath}\x1b[0m\n`);
console.log(`Total Downloaded: ${Object.keys(svgManifest).length} SVGs, ${Object.keys(pngManifest).length} PNGs\
} catch (err) {
console.error(`\x1b[31mSync Failed:\x1b[0m ${err.message}\n`);
process.exit(1);
## }
## }
run();
Add Script to package.json
## {
## "scripts": {
"figma:sync": "node --env-file=.env.local scripts/figma-asset-sync.mjs"
## }
## }
## Example Output Manifest (docs/figma-data/asset-manifest.json)
After running npm run figma:sync "<URL>" dashboard, this local map is generated:
## {
## "12:45": {
## "name": "icon-search",
## "format": "svg",
"localPath": "public/figma-assets/icons/icon-search-12-45.svg",
"publicPath": "/figma-assets/icons/icon-search-12-45.svg"
## },
## "14:88": {
## "name": "company-hero-banner",
## "format": "png",
"localPath": "public/figma-assets/images/company-hero-banner-14-88.png",
"publicPath": "/figma-assets/images/company-hero-banner-14-88.png"
## }
## }
Antigravity Rule for Offline Generation
Add this to .antigravity/rules/figma-to-code.md:
## Offline Asset & AST Rules
- Never query the external Figma API repeatedly during code generation.
- Rely strictly on cached files:
- Structural AST: `docs/figma-data/raw/<tag>-ast.json`
## - Asset Manifest: `docs/figma-data/asset-manifest.json`
- For SVGs/Images:
- Reference local public paths (e.g., `src="/figma-assets/images/..."`) or import downloaded SVGs directly.
- Do not generate arbitrary inline SVG path strings when a downloaded asset exists in the manifest.
User prompt: are there any other consideration analyze
Response: Here is a deep architectural analysis of the eight critical considerations that typically make or break production Figma-to-code
pipelines in enterprise settings.
## 1. Token Drift & Continuous Design Sync
A one-time token extraction works on Day 1, but designs evolve. Without a synchronization strategy, code tokens and Figma styles drift apart
within weeks.
Non-Breaking Versioning: Treat tokens.css like an internal library. Do not overwrite existing tokens without checking downstream
usages.
Deprecation Strategy: If a designer changes --color-primary from Blue to Indigo, update the token value rather than renaming the
variable. If renaming is necessary, maintain backward-compatible aliases:
--color-brand-legacy: var(--color-primary-new);
Automated Token Diffing: Run a diff between the cached docs/figma-data/raw/tokens-ast.json and a newly pulled AST to preview
design changes before committing updates to tokens.css.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc437/49

- React Server Components (RSC) vs. Client Component Boundaries
In Next.js App Router, AI models tend to slap "use client" at the top of every generated file to get interactive hooks working. This degrades
SEO, bloats bundle sizes, and disables server-side data streaming.
Component TypeRoleDirectiveBest Practice
## Page Layouts &
## Wrappers
Layout scaffolding, SEO metadata, initial
data fetching
## Server Component
(Default)
No "use client", pure async/await
data loader
## Presentation Cards /
## Lists
Rendering static text, badges, images
## Server Component
(Default)
Pass plain props, zero event listeners
## Interactive Primitives
Buttons with onClick, Form inputs,
## Modals, Dropdowns
## Client Component ("use
client")
Push "use client" to the lowest
atomic leaf node
The Leaf-Node Rule: Keep composite containers (e.g., TeamDirectoryPage, CardGrid) as Server Components, and import small interactive
leaf nodes (<AddMemberButton/>, <FilterDropdown/>) into them.
- Container Queries (@container) vs. Viewport Media Queries (@media)
Figma frames show components in isolation (e.g., a Card on a mobile artboard vs. desktop artboard). However, in production, a component’s
width depends on its parent container, not the user's screen size.
The Problem: If a MetricCard is placed in a 1-column sidebar on desktop, a viewport query (md:flex-row) treats it as desktop and
stretches it horizontally, breaking the layout.
The Fix: Use Tailwind CSS Container Queries (@container, @md:flex-row):
// Parent container
<div className="@container">
{/* Child component adjusts based on parent width, NOT screen width */}
<div className="flex flex-col @sm:flex-row @lg:grid @lg:grid-cols-3">
## ...
## </div>
## </div>
- Vector/SVG Hygiene & currentColor Inheritance
Raw SVGs exported directly from Figma API payloads contain hardcoded fill colors and unoptimized metadata.
SVGO Optimization: Raw Figma SVG outputs often include unnecessary metadata (xmlns:xlink, <clipPath>, <defs>). Run SVGs
through svgo during the ingestion script to shave 40–60% of the file size.
Enforce currentColor on Icons: Strip hardcoded fills (fill="#2563EB") from icon paths and replace them with fill="currentColor".
This allows icon color to automatically match the parent text token:
<button className="text-primary hover:text-primary-hover">
<SearchIcon className="h-4 w-4 fill-currentColor" />
## </button>
## 5. Defensive Data Contracts & Localization (i18n)
Design mockups always showcase ideal data ("John Doe", 3 notifications, short titles). Real production data exposes edge cases:
Null / Undefined Safety: Ensure generated components provide fallbacks for nullable fields:
<Avatar src={user.avatarUrl ?? "/default-avatar.png"} alt={user.fullName ?? "User"} />
Text Expansion Factor (+30%): Languages like German or French require 30% more horizontal space than English. If a button in Figma
has fixed padding with no wrapping allowance, it will clip in multi-lingual apps.
Number & Date Formatting: Never render raw database strings (2026-09-01T12:00:00Z or 1250000). Use Intl.DateTimeFormat and
Intl.NumberFormat with client locale support.
- Accessibility (WCAG 2.2 AA Compliance)
Visual designs in Figma do not convey non-visual UX behaviors. These must be engineered into the component layer:
Focus Visible Rings: Designers often omit outline rings because they disrupt visual cleanliness on canvas. All interactive elements must
implement standard focus outlines:
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
Icon-Only Buttons: Any button that renders only an icon (e.g., <button><XIcon/></button>) must include aria-label="Close
modal" or visually hidden text (<span className="sr-only">Close</span>).
Color Contrast Ratios: Audit your token pairs in tokens.css. Text tokens on surface tokens must maintain at least a 4.5:1 contrast ratio
for normal text and 3:1 for large text / UI borders.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc438/49

- Figma REST API Rate Limiting & Enterprise Security
Rate Limits: The Figma REST API enforces tier-based rate limits. Querying the API on every code-generation turn triggers HTTP 429
(Too Many Requests). Always run your local caching script (figma:sync) once per session rather than making live API calls during
development loops.
PII in Design Mockups: Ensure Figma frames do not contain real customer data, internal emails, or secret API keys in text layers before
caching the AST JSON in repository docs/ folders.
Token Rotation: Store FIGMA_ACCESS_TOKEN in .env.local or enterprise secret vaults (Vault, Doppler, Azure Key Vault). Never commit
tokens to source control.
- Visual Regression Testing in CI/CD
To guarantee that ongoing code changes don't accidentally drift from the original Figma sign-off:
Storybook + Playwright / Chromatic: Run automated visual regression testing in your CI pipeline. Take screenshot snapshots of every
Storybook story on each pull request.
Automated Audit Pipeline: Add this check to your pull request workflow:
## # .github/workflows/ui-audit.yml
name: UI Architecture Audit
on: [pull_request]
jobs:
verify:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
with: { node-version: 20 }
- run: npm ci
- run: npm run lint:tokens      # Blocks hardcoded inline styles & raw hex
- run: npm run build-storybook  # Verifies component isolation and typing
- run: npm run build            # Verifies Next.js compilation & RSC boundaries
Summary Checklist for Production Readiness
[ ] Token aliases defined to prevent breaking changes during design updates.
[ ] Page scaffolds kept as Server Components; "use client" isolated to leaf primitives.
[ ] Layouts use container queries (@container) where components are placed in multi-width slots.
[ ] SVGs stripped of hardcoded fills, running on fill="currentColor".
[ ] All user text layers equipped with truncate / line-clamp and min-w-0.
[ ] Accessible aria-label tags present on all icon-only buttons.
[ ] CI/CD pipeline enforces npm run lint:tokens and Storybook compilation on every PR.
User prompt: can you add the above points in workflow
Response: Here is the complete, production-grade Figma-to-Code Engineering Workflow updated to incorporate all architectural
considerations—including offline asset caching, Server/Client component boundaries, container queries, SVG optimization, and CI/CD quality
gates.
Complete End-to-End Pipeline
[Design Domain: Figma (Read-Only)]
## │
▼ (One-Time Local Sync: `npm run figma:sync`)
[docs/figma-data/] ── Cached AST JSON, Downloaded SVGs (currentColor) & PNGs
## │
## ▼
[Phase 1: Token Architecture] ── tokens.css (Tokens, Aliases, Deprecation-Safe)
## │
## ▼
[Phase 2: Pre-Flight Lint] ── `npm run figma:lint` (Pre-flight AST gate)
## │
▼ (AI Compensation Plan Approved by User)
[Phase 3: Primitive Build] ── CVA + Radix UI + `currentColor` + Container Queries
## │
## ▼
[Phase 4: Isolation Gate] ── Storybook (.stories.tsx) + a11y Addon + States Matrix
## │
## ▼
[Phase 5: Screen Assembly] ── RSC Pages (Server) + Interactive Leaf Nodes (Client)
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc439/49

## │
## ▼
[Phase 6: Quality Gates & CI] ── `npm run lint:tokens` + Visual Regression
## 1
Phase 1: One-Time Extraction & Asset Optimization
Eliminate API rate limits, protect PII, and enable offline work
Run the offline sync script to pull raw geometry, download raster graphics, and optimize vector SVGs in a single command:
Command: npm run figma:sync "<FIGMA_URL>" <tag_name>
AST Cache: Saves complete document hierarchy to docs/figma-data/raw/<tag>-ast.json.
SVG Optimization: Strips hardcoded fills (fill="#...") and injects fill="currentColor" so icons automatically inherit parent
text tokens.
Manifest: Generates docs/figma-data/asset-manifest.json mapping Figma node IDs directly to local /figma-assets/ paths.
## 2
## Phase 2: Inferred Design Tokens & Aliases
Establish design variables and non-breaking token updates
Extract recurring colors, font scales, spacing steps (4px/8px grid), radii, and shadows into src/styles/tokens.css and
tailwind.config.ts:
Maintain backward-compatible aliases (e.g., --color-brand-legacy: var(--color-primary)) when updating tokens to prevent
breaking existing screens.
Enforce a strict minimum of 4.5:1 WCAG contrast ratio between surface backgrounds and text tokens.
## 3
Phase 3: Pre-Flight Lint & Compensation Approval
Block invalid designs and establish safe code compensation
Audit the cached AST before generating any code:
Command: npm run figma:lint "<FIGMA_URL>"
Audit Checks: Catches raw groups (GROUP), missing Auto Layout frames, fixed-width text layers, and detached raw hex colors.
Compensation Gate: The agent enters Plan Mode and presents a code-level compensation proposal (e.g., mapping non-Auto
Layout groups to CSS Grid/Flexbox and synthesizing missing error/disabled states). The user must explicitly approve before code
is written.
## 4
## Phase 4: Atomic Component & Storybook Sandbox
Develop in isolation with container queries and defensive CSS
Build headless UI primitives using class-variance-authority (CVA) and Radix UI:
Container Queries: Use @container classes (e.g., @sm:flex-row, @lg:grid-cols-3) on composite widgets so they adapt to
parent container widths rather than viewport breakpoints.
Defensive CSS: Apply min-w-0, truncate, or break-words on all dynamic text fields.
Accessibility: Add explicit aria-label attributes to icon-only buttons and ensure standard :focus-visible rings are configured.
Storybook Verification: Create matching .stories.tsx documenting every visual variant and state (Default, Hover, Disabled,
Loading Skeleton, Error, Empty). Verify via npm run build-storybook.
## 5
Phase 5: Screen Composition (RSC Architecture)
Maintain strict server/client boundary separation
Assemble full page routes inside src/app/<route>/page.tsx using a strict component hierarchy:
Server Components (Default): Page wrappers, grid shells, and static display tables remain async Server Components (no "use
client").
Client Components (Leaf Nodes): Push "use client" down to interactive leaves only (modals, search filter inputs, dropdown
triggers).
Defensive Data Handling: Implement nullish coalescing (??) and fallback illustrations for empty/loading/error states.
## 6
Phase 6: Code Linter & CI/CD Pipeline Gates
Automated code linter and pre-commit validation
Enforce architectural standards across the codebase automatically:
Command: npm run lint:tokens
Checks: Scans all .tsx files to guarantee zero inline style={{ ... }} attributes, no raw hex values, and no arbitrary Tailwind
bracket notations (w-[320px], bg-[#1a1a1a]).
CI Pipeline: Blocks pull requests if token linting, Storybook compilation, or Next.js build steps fail.
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc440/49

## Master Antigravity Workspace Rules File
Update .antigravity/rules/figma-to-code.md with this complete configuration:
# Comprehensive Figma-to-Code Rules & Architectural Guardrails
## 1. Offline & Read-Only Source of Truth
- Treat all Figma files as strictly READ-ONLY.
- Never make repeated live API calls during code generation. Always read from `docs/figma-data/raw/` and `docs/figma
## ## 2. Token & Styling Guardrails
- ZERO inline style objects (`style={{ ... }}`).
- ZERO arbitrary Tailwind bracket notation (`bg-[#111827]`, `w-[320px]`, `p-[14px]`).
- All color, typography, spacing, and radius decisions must map to `tokens.css`.
- Ensure icon SVGs use `fill="currentColor"` to inherit parent text colors dynamically.
## 3. Architecture & React Server Components (RSC)
- Keep page-level layouts (`src/app/**/page.tsx`) as Server Components (no `"use client"`).
- Restrict `"use client"` strictly to interactive leaf components (forms, dialog triggers, dropdowns).
- Use Tailwind Container Queries (`@container`) for widgets placed in multi-width parent slots.
## ## 4. Defensive Layout & Accessibility
- Never use `position: absolute` or `position: fixed` for structural page scaffolding.
- All flex children rendering text must include `min-w-0` alongside `truncate` or `break-words`.
- Icon-only buttons must provide explicit `aria-label` attributes.
- Interactive elements must implement standard `focus-visible:ring-2 focus-visible:ring-primary` rings.
## 5. Pre-Commit Validation Gates
- Every new primitive must include a `.stories.tsx` file verifying all variants and states.
- Run and pass `npm run lint:tokens` and `npm run build-storybook` before finalizing changes.
Updated package.json Automation Suite
## {
## "scripts": {
"dev": "next dev",
"build": "next build",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"figma:sync": "node --env-file=.env.local scripts/figma-asset-sync.mjs",
"figma:lint": "node --env-file=.env.local scripts/figma-linter.mjs",
"lint:tokens": "node scripts/audit-tokens.mjs",
"check-all": "npm run lint:tokens && npm run build-storybook && npm run build"
## }
## }
User prompt: can we also add this screanshot and validataion loop is it added
Response: The Visual Screenshot & Multimodal Validation Loop is the missing automated feedback link.
While the previous steps validate tokens, types, and AST rules, they don't visually compare the actual rendered browser pixels against the
original Figma design. Adding this loop allows the agent to take a headless browser screenshot of the Storybook component, compare it with the
exported Figma snapshot, and automatically fix visual discrepancies (like margin shifts, font size mismatches, or alignment bugs) before asking
for human review.
How the Visual Validation Loop Operates
[1. Figma Export Snapshot] ───► Saved to `docs/figma-data/snapshots/figma-button.png`
## │
## ▼
[2. Code Generation] ────────► Renders in Storybook (`http://localhost:6006`)
## │
▼ (Playwright Headless Screenshot)
[3. Browser Snapshot] ───────► Saved to `docs/figma-data/snapshots/browser-button.png`
## │
▼ (Pixelmatch / Multimodal Diff)
## [4. Automated Diff & Score] ──► Mismatch > 2%?
├── YES ──► Agent reads Visual Diff & auto-refactors code (Loop)
└── NO  ──► PASS (Proceed to next component / page)
## Step 1: Install Playwright & Pixel Diff Tooling
Install the lightweight visual testing runner:
npm install -D playwright pixelmatch pngjs
npx playwright install chromium --with-deps
## Step 2: Automated Visual Comparator Script (scripts/visual-validate.mjs)
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc441/49

Save this script in your project root. It:
- Fetches the high-resolution PNG render of the component directly from the Figma Image REST API.
- Boots a headless Playwright browser, navigates to the Storybook story, and takes a pixel-accurate component screenshot.
- Compares both images using pixelmatch and outputs a visual diff image highlighting discrepancies in red.
// scripts/visual-validate.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const STORYBOOK_BASE_URL = process.env.STORYBOOK_URL || "http://localhost:6006";
function parseFigmaUrl(url) {
const fileKeyMatch = url.match(/\/design\/([a-zA-Z0-9]+)/) || url.match(/\/file\/([a-zA-Z0-9]+)/);
const nodeIdMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
if (!fileKeyMatch || !nodeIdMatch) throw new Error("URL must contain both File Key and Node ID.");
return {
fileKey: fileKeyMatch[1],
nodeId: decodeURIComponent(nodeIdMatch[1]).replace("-", ":"),
## };
## }
## // 1. Fetch Official Figma Render Snapshot
async function fetchFigmaSnapshot(fileKey, nodeId, destPath) {
const endpoint = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;
const res = await fetch(endpoint, { headers: { "X-Figma-Token": FIGMA_TOKEN } });
if (!res.ok) throw new Error(`Figma Image API error: ${res.status}`);

const { images } = await res.json();
const imgUrl = images[nodeId];
if (!imgUrl) throw new Error(`No image URL returned for node ${nodeId}`);
const imgRes = await fetch(imgUrl);
fs.writeFileSync(destPath, Buffer.from(await imgRes.arrayBuffer()));
## }
## // 2. Capture Headless Storybook Browser Screenshot
async function captureStorybookScreenshot(storyId, destPath) {
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 });

// Navigate to isolated Storybook iframe canvas
const canvasUrl = `${STORYBOOK_BASE_URL}/iframe.html?id=${storyId}&viewMode=story`;
await page.goto(canvasUrl, { waitUntil: "networkidle" });
// Target the root story wrapper element
const root = page.locator("#storybook-root > *").first();
await root.waitFor({ state: "visible" });
await root.screenshot({ path: destPath });
await browser.close();
## }
// 3. Pixel-Level Diff Calculation
function compareImages(img1Path, img2Path, diffPath) {
const img1 = PNG.sync.read(fs.readFileSync(img1Path));
const img2 = PNG.sync.read(fs.readFileSync(img2Path));
// Determine uniform bounding box for comparison
const width = Math.max(img1.width, img2.width);
const height = Math.max(img1.height, img2.height);
const canvas1 = new PNG({ width, height });
const canvas2 = new PNG({ width, height });
PNG.bitblt(img1, canvas1, 0, 0, img1.width, img1.height, 0, 0);
PNG.bitblt(img2, canvas2, 0, 0, img2.width, img2.height, 0, 0);
const diff = new PNG({ width, height });
const numDiffPixels = pixelmatch(canvas1.data, canvas2.data, diff.data, width, height, {
threshold: 0.15, // Sensitivity
## });
fs.writeFileSync(diffPath, PNG.sync.write(diff));
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc442/49

const totalPixels = width * height;
const mismatchPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);
return { numDiffPixels, mismatchPercentage, diffPath };
## }
async function run() {
const figmaUrl = process.argv[2];
const storyId = process.argv[3]; // e.g., "ui-primitives-button--primary"
const tag = process.argv[4] || "component";
if (!figmaUrl || !storyId) {
console.error("Usage: node scripts/visual-validate.mjs <FIGMA_URL> <STORYBOOK_STORY_ID> [tag]");
process.exit(1);
## }
const snapshotDir = path.join(process.cwd(), "docs", "figma-data", "snapshots");
fs.mkdirSync(snapshotDir, { recursive: true });
const figmaImgPath = path.join(snapshotDir, `${tag}-figma.png`);
const browserImgPath = path.join(snapshotDir, `${tag}-browser.png`);
const diffImgPath = path.join(snapshotDir, `${tag}-diff.png`);
try {
const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

console.log(` [1/3] Downloading Figma baseline render for node ${nodeId}...`);
await fetchFigmaSnapshot(fileKey, nodeId, figmaImgPath);
console.log(` [2/3] Capturing Storybook browser render (${storyId})...`);
await captureStorybookScreenshot(storyId, browserImgPath);
console.log(`⚖  [3/3] Running pixel-level visual comparison...`);
const { mismatchPercentage, numDiffPixels } = compareImages(figmaImgPath, browserImgPath, diffImgPath);
console.log("\n════════════════════════════════════════════════════════════");
console.log("             VISUAL VALIDATION REPORT                       ");
console.log("════════════════════════════════════════════════════════════");
console.log(`Figma Reference : ${figmaImgPath}`);
console.log(`Browser Render  : ${browserImgPath}`);
console.log(`Visual Diff Map : ${diffImgPath}`);
console.log(`Mismatch Rate   : ${mismatchPercentage}% (${numDiffPixels} mismatched pixels)\n`);
if (parseFloat(mismatchPercentage) > 2.0) {
console.log(`\x1b[31m❌ Visual Drift Detected (>2.0% mismatch).\x1b[0m`);
console.log("Agent must inspect the visual diff and adjust Tailwind spacing/sizing tokens.\n");
process.exit(1);
} else {
console.log(`\x1b[32m✔ Visual Match Confirmed! (Tolerance within threshold)\x1b[0m\n`);
process.exit(0);
## }
} catch (err) {
console.error(`\x1b[31mVisual Validation Failed:\x1b[0m ${err.message}\n`);
process.exit(1);
## }
## }
run();
Step 3: Add the Command to package.json
## {
## "scripts": {
"test:visual": "node --env-file=.env.local scripts/visual-validate.mjs"
## }
## }
Step 4: Antigravity Self-Healing Visual Loop Prompt
Use this prompt to execute the iterative visual loop inside Antigravity:
Run the Visual Screenshot & Validation Loop on `<ComponentName>`:
## Inputs:
- Figma Node URL: <PASTE_FIGMA_NODE_URL>
- Storybook Story ID: `<story-id>` (e.g., `ui-primitives-button--primary`)
- Component Path: `src/components/ui/<ComponentName>.tsx`
## Execution Loop:
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc443/49

- Run `npm run test:visual "<PASTE_FIGMA_NODE_URL>" "<story-id>" "<ComponentName>"`
- If the check passes (mismatch <= 2.0%):
- Mark component as visually verified.
- If the check fails (mismatch > 2.0%):
- Inspect the generated diff image at `docs/figma-data/snapshots/<ComponentName>-diff.png`.
- Identify the source of the visual shift (e.g., incorrect padding step, font-weight discrepancy, line-height off
- Adjust the Tailwind classes in `src/components/ui/<ComponentName>.tsx`.
- Re-run `npm run test:visual` until the threshold passes.
Where It Fits in the Master Pipeline
The visual validation loop is inserted immediately after component generation (Phase 4) and before full-page assembly:
PhaseActionValidation Gate
Phase 1Asset & AST Syncnpm run figma:sync
Phase 2Token Normalizationtokens.css
Phase 3Pre-Flight Structure Auditnpm run figma:lint
Phase 4Component Build & Storybooknpm run build-storybook
Phase 4.5Visual Screenshot & Pixel Diff Loopnpm run test:visual (Auto-healing loop)
Phase 5RSC Page Assemblysrc/app/**/page.tsx
Phase 6Code Token & Anti-Inline Auditnpm run lint:tokens
This gives you a fully closed loop: AST structure is verified  code token rules are verified  actual browser pixels are verified against
## Figma.
User prompt: is this above screen matching required or it is a waste of tokens as it consumes very large tokens
Response: For almost all real-world development workflows, running continuous multimodal screenshot-matching loops with an AI agent
is an unnecessary waste of tokens, time, and compute.
## Why Multimodal Screenshot Matching Wastes Tokens
BottleneckWhat Actually HappensImpact
## Massive Context
## Consumption
Feeding two high-res PNGs (Figma render + browser screenshot) plus
a visual diff image into an LLM consumes 1,500 to 4,000+ vision
tokens per iteration.
Context window fills rapidly, causing agent
"amnesia" on earlier project rules.
Sub-Pixel
## Antialiasing False
## Positives
Browsers render text via system antialiasing (CoreText on macOS,
DirectWrite on Windows, FreeType on Linux), which never
mathematically matches Figma's Skia/WebGL canvas 1:1.
The agent burns 3–5 iterations trying to fix
a "2% mismatch" caused by font smoothing
rather than a real CSS bug.
## High Latency
## Feedback Loop
Figma Image API fetch  Playwright boot  Image diffing  LLM
multimodal parsing takes 15–30 seconds per attempt.
Slows generation speed down to a crawl.
The 95/5 Rule: Deterministic Code Linting vs. Vision
In a modern design system architecture, visual fidelity is determined by tokens and CSS hierarchy, not raw pixels.
## ┌────────────────────────────────────────────────────────────────────────┐
│ 95% of Visual Fidelity: Deterministic & Token-Based (0 Vision Tokens)   │
│ - Colors, radii, and typography scales mapped via tokens.css           │
│ - Structure enforced via Auto Layout / Flexbox AST rules               │
│ - AST linter (`figma:lint`) catches 100% of structural errors          │
│ - Code linter (`lint:tokens`) blocks hardcoded values instantly        │
## └──────────────────────────────────┬─────────────────────────────────────┘
## │
## ▼
## ┌────────────────────────────────────────────────────────────────────────┐
│ 5% Edge Alignment: Fast Human-in-the-Loop Check in Storybook (0 Tokens) │
│ - Developer glances at Storybook canvas (`http://localhost:6006`)      │
│ - Takes 2 seconds to spot any misalignment                             │
## └────────────────────────────────────────────────────────────────────────┘
When your design tokens are normalized and your AST linter (npm run figma:lint) verifies Auto Layout properties before code generation,
the output is already functionally identical to the Figma design.
When Visual Diffing IS Worth It (And When to Cut It)
## →→
## →→→
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc444/49

 WASTE OF TOKENS (Do NOT use AI Multimodal Loops for):
Everyday UI primitives (Button, Badge, Input, Avatar, Card).
Standard data tables, forms, and grid layouts.
Responsive screen compositions.
✅ VALID USE CASES (Run outside the AI loop in CI/CD):
Automated CI Regression Testing: Run pixelmatch or Playwright Visual Comparisons inside GitHub Actions/GitLab CI purely as a
pass/fail alert for pull requests—without sending images to the LLM.
Complex Non-Standard Canvas/Vector Graphics: Highly custom SVG charts, bespoke landing page illustrations, or non-standard
geometrical components where CSS cannot be mapped cleanly from standard tokens.
## Recommended Production Architecture
Remove image generation and screenshot comparison from your LLM agent loop entirely:
- Step 1: Run npm run figma:sync (Local JSON AST download — deterministic, fast).
- Step 2: Run npm run figma:lint (Pre-flight AST checks — zero vision tokens).
- Step 3: Generate Component + Storybook story using tokens.css.
- Step 4: Run npm run lint:tokens (ESLint/RegEx code check — zero vision tokens).
- Step 5: Human Spot Check — Open Storybook (localhost:6006) and verify with a quick 3-second visual glance.
User prompt: if vision is used it should be used in a subagent so that the main loop is not destoryed
Response: Using a dedicated, isolated sub-agent for visual evaluation is the industry-standard architectural pattern to prevent context bloat
and memory degradation in the main orchestrator.
By isolating vision to a child sub-agent, the high-cost image payloads (thousands of vision tokens) are ingested and discarded inside a sandbox.
The sub-agent only returns a compact, structured text diff back to the main agent.
Sub-Agent Visual Isolation Architecture
## ┌────────────────────────────────────────────────────────────────────────┐
│ Main Orchestrator Agent (Zero Vision Tokens)                           │
│ - Retains clean context: tokens.css, component code, project rules     │
│ - Dispatches task: "Verify visual alignment of Button component"       │
## └──────────────────────────────────┬─────────────────────────────────────┘
│ (Spawns Sub-Agent Process)
## ▼
## ┌────────────────────────────────────────────────────────────────────────┐
│ Isolated Vision Sub-Agent (Ephemeral Context Sandbox)                  │
│ 1. Ingests Figma PNG & Storybook Screenshot (Heavy Vision Tokens)      │
│ 2. Analyzes visual alignment, padding deltas, font-weight shifts       │
│ 3. Destroys image context from memory                                  │
│ 4. Emits ONLY a compact JSON report (~100 text tokens)                 │
## └──────────────────────────────────┬─────────────────────────────────────┘
## │
## ▼
## ┌────────────────────────────────────────────────────────────────────────┐
│ Return Payload to Main Agent:                                          │
## │ {                                                                      │
│   "status": "FAIL",                                                    │
## │   "delta": {                                                           │
│     "paddingY": "Currently p-2 (8px), should be p-3 (12px)",            │
│     "borderRadius": "Currently rounded-sm (4px), should be rounded-md" │
## │   }                                                                    │
## │ }                                                                      │
## └──────────────────────────────────┬─────────────────────────────────────┘
## │
## ▼
## ┌────────────────────────────────────────────────────────────────────────┐
│ Main Agent: Applies precise Tailwind patch with zero context polluted  │
## └────────────────────────────────────────────────────────────────────────┘
Step 1: Vision Sub-Agent Task Specification
Create a dedicated prompt template for the visual sub-agent at .antigravity/prompts/visual-subagent.md:
# Isolated Visual Evaluation Sub-Agent
You are a visual comparison specialist. Your sole job is to compare two images:
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc445/49

- Reference Image: Figma design render (`docs/figma-data/snapshots/<name>-figma.png`)
- Current Implementation: Storybook browser screenshot (`docs/figma-data/snapshots/<name>-browser.png`)
## Evaluation Rules:
- Ignore sub-pixel font antialiasing differences.
- Look specifically for:
- Incorrect spacing (padding/margin shifts).
- Wrong typography weights, sizes, or line-heights.
- Border radius discrepancies.
- Misaligned flex/grid child alignments.
- Do NOT output conversational text, explanations, or image attachments.
## Output Requirement:
Return ONLY a structured JSON block matching this schema:
## ```json
## {
"matchStatus": "PASS" | "FAIL",
"confidenceScore": 0-100,
"actionableFixes": [
## {
"property": "padding | font-size | border-radius | gap | color",
"current": "Observed in screenshot (e.g., py-2)",
"expected": "Observed in Figma (e.g., py-3)",
"suggestedTailwindClass": "py-3"
## }
## ]
## }
## ---
### Step 2: Sub-Agent Invocation Tool Script (`scripts/run-visual-subagent.mjs`)
This script captures the snapshots and calls the visual sub-agent via an isolated LLM API call, returning only the p
## ```javascript
// scripts/run-visual-subagent.mjs
import fs from "node:fs";
import path from "node:path";
async function runVisualEvaluation(componentName) {
const snapshotDir = path.join(process.cwd(), "docs", "figma-data", "snapshots");
const figmaImgPath = path.join(snapshotDir, `${componentName}-figma.png`);
const browserImgPath = path.join(snapshotDir, `${componentName}-browser.png`);
if (!fs.existsSync(figmaImgPath) || !fs.existsSync(browserImgPath)) {
console.error(`\x1b[31mError: Snapshots missing for ${componentName}\x1b[0m`);
process.exit(1);
## }
// Read images as Base64 for the sub-agent payload
const figmaBase64 = fs.readFileSync(figmaImgPath).toString("base64");
const browserBase64 = fs.readFileSync(browserImgPath).toString("base64");
console.log(`烙 Invoking isolated Vision Sub-Agent for [${componentName}]...`);
// Call the isolated vision model (e.g., Gemini Vision / Claude Vision sub-agent)
// Images exist ONLY inside this isolated request and are immediately GC'd.
const subAgentResponse = await fetch("https://api.openai.com/v1/chat/completions", { // Or enterprise LLM endpoint
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.LLM_API_KEY}`,
## },
body: JSON.stringify({
model: "gpt-4o", // Or gemini-1.5-flash / claude-3-5-sonnet
messages: [
## {
role: "system",
content: fs.readFileSync(path.join(process.cwd(), ".antigravity/prompts/visual-subagent.md"), "utf-8"),
## },
## {
role: "user",
content: [
{ type: "text", text: `Compare Figma baseline vs Browser render for component: ${componentName}` },
{ type: "image_url", image_url: { url: `data:image/png;base64,${figmaBase64}` } },
{ type: "image_url", image_url: { url: `data:image/png;base64,${browserBase64}` } },
## ],
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc446/49

## },
## ],
response_format: { type: "json_object" },
max_tokens: 300, // Strict small output budget
## }),
## });
const data = await subAgentResponse.json();
const report = JSON.parse(data.choices[0].message.content);
// Save the compact report locally
const reportPath = path.join(snapshotDir, `${componentName}-vision-report.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\x1b[32m✔ Sub-agent report generated (${report.matchStatus}) -> ${reportPath}\x1b[0m\n`);
console.log(JSON.stringify(report, null, 2));
## }
const componentName = process.argv[2];
if (componentName) runVisualEvaluation(componentName);
## Step 3: Main Agent Dispatch Prompt
When you want Antigravity to run a visual check without cluttering its conversation history, use this command:
Dispatch the Visual Verification Sub-Agent:
`node scripts/run-visual-subagent.mjs <ComponentName>`
Instructions for Main Agent:
- Read ONLY the generated text report at `docs/figma-data/snapshots/<ComponentName>-vision-report.json`.
- Do not attempt to load or view the raw PNG files.
- If `matchStatus === "FAIL"`:
- Apply the `suggestedTailwindClass` patches from `actionableFixes` to `src/components/ui/<ComponentName>.tsx`.
- Verify that all replacement classes exist in `src/styles/tokens.css`.
- If `matchStatus === "PASS"`:
- Proceed directly to next component.
Key Benefits of this Architecture
Zero Main Context Bloat: The main orchestrator's context window remains 100% focused on code logic, TypeScript types, and
architectural rules.
Token Cost Capped: Vision tokens are processed by smaller/cheaper vision models in a single ephemeral pass, while the main code
reasoning agent remains fast and lean.
Structured & Deterministic Output: The main agent receives clear, actionable diffs ("change py-2 to py-3") instead of trying to
visually reason over raw image pixels itself.
User prompt: This subagent is automatically invoked or it is user decided
Response: In professional engineering setups, this is user-decided with an automated conditional trigger.
Running an isolated vision sub-agent on every single component run wastes API calls, whereas leaving it 100% manual defeats the purpose of
an automated pipeline. The optimal design uses a 3-tier execution strategy:
## Execution Modes Breakdown
Execution ModeHow It TriggersWhen It RunsToken Impact
## 1. Conditional
(Recommended
## Default)
Automatic via
## Threshold Gate
Only runs if the local mathematical pixel diff
(pixelmatch) detects a mismatch .
Zero tokens on 90% of components;
only spawns when a real visual
discrepancy exists.
- Manual (On-Demand)
## User Explicit
## Command
You run a slash command (/visual-check
Button) when inspecting a complex
component that looks off.
Zero ambient token cost; 100% user-
controlled.
- Fully Automated (Not
## Recommended)
## Unconditional
## Hook
Spawns a vision LLM call on every single
component generation.
High token consumption and adds 10–
20 seconds of unnecessary latency per
component.
Recommended Setup: The Conditional Auto-Trigger Gate
The vision sub-agent should sit behind a fast, free, local mathematical check (pixelmatch).
[Component Generated & Rendered in Storybook]
## │
## >2%
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc447/49

## ▼
[Local Pixel Diff (0 Tokens)]
## │
## ┌───────────┴───────────┐
## ▼                       ▼
Diff ≤ 2% (PASS)        Diff > 2% (DRIFT DETECTED)
## │                       │
## ▼                       ▼
[Proceed to Next Step]    [Auto-Spawn Vision Sub-Agent]
## │
## ▼
[Return JSON Patch]
How the Gate Logic Works in Code:
// Inside your test runner (scripts/visual-validate.mjs)
const { mismatchPercentage } = compareImages(figmaImg, browserImg, diffImg);
if (parseFloat(mismatchPercentage) <= 2.0) {
console.log("✔ Deterministic pass: Skipping Vision Sub-Agent to save tokens.");
process.exit(0);
} else {
console.log(`⚠ Visual mismatch is ${mismatchPercentage}%. Spawning Vision Sub-Agent...`);
// Automatically trigger the isolated sub-agent only when needed
await runVisualEvaluation(componentName);
## }
## Summary Recommendation
For standard UI primitives (Buttons, Badges, Inputs, Tables): Keep it conditional or manual. The AST linter and tokens.css will
handle 95% of styling deterministically without touching vision tokens.
For bespoke layouts (Landing hero sections, custom analytics charts, complex vector cards): Trigger the sub-agent manually on-
demand or let the conditional  gate invoke it automatically.
User prompt: what is the genral cost of this vision matching
Response: The cost of vision matching depends entirely on how images are tokenized and which model handles the visual inspection.
When two high-resolution images (the Figma export and the Storybook browser screenshot) are passed into a vision sub-agent, here is how the
token mechanics and real-world costs break down:
- Vision Token Mechanics (How Cost is Calculated)
Major multimodal models (OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 1.5/2.0 Flash) do not process images as a flat fee.
They divide images into a grid of  tiles:
Small UI Component (e.g., Button, Badge, Input):
Typically rendered at  ( DPI).
Consumes  per image pair .
## Full Screen / Complex Dashboard:
Typically rendered at  ( DPI).
Consumes  per image pair .
Structured JSON Output:
Strict JSON response .
- Cost Per Single Vision Check (Per Component Run)
Model TierRepresentative Models
## Input Vision
## Tokens
## Output
## Tokens
Cost per Single Check
High-Efficiency Vision
(Recommended)
Gemini 1.5 / 2.0 Flash, GPT-
## 4o-mini
tokens
tokens
## (
cents)
Frontier VisionClaude 3.5 Sonnet, GPT-4o
tokens
tokens
## (
cents)
- Aggregate Cost Across a Full Project
## >2%
## 512×512px
## ≈800×400px2×
4 to 6 tiles≈800 to 1,600 input tokens
## 1440×900px2×
12 to 16 tiles≈3,000 to 5,000 input tokens
≈100 to 250 output tokens
## ∼1,500
## ∼150
## ≈$0.0003−$0.0006<
## 0.05
## ∼1,800
## ∼150
## ≈$0.006−$0.0120.6−
## 1.2
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc448/49

To understand the cost in practice, here is a breakdown across an entire application build (e.g., a 40-component design system + 5 complex
screens):
Scenario A: Unconditional Vision Matching (Vision on EVERY component generation)
Frequency: 45 elements  3 iterative regeneration loops = 135 vision calls.
Cost with High-Efficiency Model (Flash/Mini):  (Negligible).
Cost with Frontier Model (Sonnet/GPT-4o): .
Hidden Bottleneck: While the dollar cost is low, the latency cost is high ( spent waiting on browser boots
and image transfers).
Scenario B: Gated / Conditional Matching (Only when pixelmatch )
Frequency: The mathematical check catches 85% of components for free. The vision sub-agent only triggers for the remaining 15% edge
cases  .
Cost with High-Efficiency Model:  (Fractions of a cent).
Latency Overhead: Under  total across the whole project.
## Summary & Architecture Verdict
Dollar Cost is Very Low: Using efficient vision models (Gemini Flash or GPT-4o-mini) for the sub-agent costs less than 10 cents for an
entire application build.
The Real Cost is Context Bloat and Latency: The primary reason to keep vision in an isolated sub-agent and behind a  threshold
gate is not API price, but protecting your main agent's context window from image bloat and avoiding unnecessary execution delays.
## ×
## ≈$0.05−$0.08
## ≈$1.00−$1.60
≈135×10s≈22 minutes
## >2%
≈10 to 15 vision calls
## ≈<$0.01
2 minutes
## >2%
9/1/26, 4:00 PMFigma-to-Code Antigravity Workflow Guide
https://gemini.google.com/app/51ccbc8df03fdcc449/49