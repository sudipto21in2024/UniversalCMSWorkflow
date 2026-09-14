# Screen Spec: [Screen Name]

## 1. Overview & Objectives
- **Route / URL**: `/[route]`
- **Purpose**: [Brief explanation of what the user achieves on this page]
- **Target Users**: [Roles / Persona]
- **Figma Frame Node URL**: `https://www.figma.com/design/<FILE_KEY>/<FILE_NAME>?node-id=<NODE_ID>`

---

## 2. Layout & Page Structure
- **Page Type**: [Dashboard / Landing / Form / Settings]
- **Grid & Boundaries**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Scaffolding**:
  - Global Header / Navigation
  - Page Title (`<h1>`), Subtitle (`<p>`), Primary Action buttons
  - Main Body (Grid / Table / Cards)
  - Modals / Drawers

---

## 3. UI Component Inventory
All components MUST be imported from `src/components/ui/` or defined under `src/components/modules/`:

| Component Name | Source | Purpose | Variants / Props Used |
| :--- | :--- | :--- | :--- |
| `Button` | `src/components/ui/button.tsx` | Primary action triggers | `variant="primary"`, `size="md"` |
| `Input` | `src/components/ui/input.tsx` | Search and data entry | `type="search"`, `iconLeft` |
| `Badge` | `src/components/ui/badge.tsx` | Status indicators | `status="active" \| "inactive"` |

---

## 4. User Interaction & Action Flows
### Flow 1: [e.g. Search & Filter]
- **Trigger**: User inputs query in search bar.
- **Behavior**: Debounced by 300ms, filter results in table/grid.
- **Fallback**: Display `EmptyState` if 0 items match.

---

## 5. Mock Data Schema
```typescript
export interface DataItem {
  id: string;
  title: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}
```

---

## 6. Edge Cases & States
- **Default State**: Table/grid populated with active records.
- **Loading State**: Render 5 Skeleton rows (`<Skeleton />`).
- **Empty State**: Render illustration/icon, message, and primary CTA.
- **Error State**: Render inline error alert with retry button.
- **Truncation**: Names/titles > 30 chars use `truncate` with Tooltip.
