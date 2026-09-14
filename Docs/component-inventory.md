# Component Inventory Matrix

## 1. Identified Components Breakdown

| Layer | Component Name | Base Primitive | Variants & Props | Target File Path |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Primitive)** | `Button` | HTML `<button>` + CVA | `variant` (primary, secondary, outline, destructive), `size` (sm, md, lg), `isLoading` | `src/components/ui/button.tsx` |
| **Tier 1 (Primitive)** | `Badge` | HTML `<span>` + CVA | `status` (active, inactive, warning, neutral), `size` (sm, md) | `src/components/ui/badge.tsx` |
| **Tier 1 (Primitive)** | `Input` | HTML `<input>` + CVA | `type`, `hasError`, `iconLeft`, `iconRight` | `src/components/ui/input.tsx` |
| **Tier 2 (Module)** | `FilterBar` | Composed | `onSearchChange`, `onStatusFilter`, `onClear` | `src/components/modules/filter-bar.tsx` |
| **Tier 2 (Module)** | `DataTable` | Composed | `data[]`, `isLoading`, `onEdit`, `onDelete` | `src/components/modules/data-table.tsx` |
