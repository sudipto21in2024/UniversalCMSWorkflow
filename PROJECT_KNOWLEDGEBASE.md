# 📘 FigmaWorkflow2 Project Knowledge Base & AI Agent Quickstart

> **Important for AI Agents (Gemini / Claude)**: Read this single document at the beginning of the session. **DO NOT** re-parse all codebase files, do **NOT** make Figma API calls, and follow the exact patterns and node ID map below.

---

## 1. ⚡ Critical Rules & Architecture Directives

1. **Zero Figma API Calls (Starter Pack Rate Limit Protection)**:
   - Live Figma API calls are disabled.
   - All Figma structure and UI tree data is located locally in:
     - `Docs/DirectDataDump/light-dark-export/light/Dashboard (Community)-1788360891070.json` (~29 MB)
     - `Docs/DirectDataDump/light-dark-export/dark/Dashboard (Community)-1788360891070.json` (~29 MB)
   - To inspect and navigate the JSON dump, use the dedicated CLI utility or one-liners documented in [`Docs/FIGMA_DUMP_NAVIGATION_GUIDE.md`](file:///c:/Sudipto/FigmaWorkflow2/Docs/FIGMA_DUMP_NAVIGATION_GUIDE.md) (e.g. `node scripts/figma-dump.mjs list-frames design`).
   - Ingested asset SVGs/PNGs are in `public/figma-assets/` mapped in `Docs/figma-data/asset-manifest.json`.
2. **Project Stack**:
   - Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, `lucide-react` icons.
3. **Universal Sidebar & Routing**:
   - All navigation links are defined in [`src/config/navigation.json`](file:///c:/Sudipto/FigmaWorkflow2/src/config/navigation.json).
   - All pages use [`UniversalSidebar`](file:///c:/Sudipto/FigmaWorkflow2/src/components/shared/universal-sidebar.tsx).
4. **Automated Live Deployment & CSS Health Verification**:
   - Whenever creating or editing a page, always run the automated verification suite:
     ```powershell
     npm run verify:deploy
     ```
   - This audits all registered routes, confirms HTML `200 OK`, and verifies that the compiled CSS bundle (`~48 KB` of full Tailwind and Design Tokens) is delivered successfully without 404s.
5. **Registry-Driven Development**:
   - Component and route definitions live in [`engine/registry/component-registry.json`](file:///c:/Sudipto/FigmaWorkflow2/engine/registry/component-registry.json).
6. **Client Export Packaging**:
   - Run `node engine/scripts/export-client.mjs` after changes to update `dist-client/`.

---

## 2. 📊 Pages Completion Status Matrix

| Page / Screen Name | Figma Node ID | Status | Route File | Primary Modules / Components |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** (Crypto Overview) | `1718:8000` | ✅ **COMPLETED** | [`src/app/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/page.tsx) (`/`) | Crypto Cards, Double Wave Chart, Balances with Glassy Cards, Recent Activities, Team Widgets |
| **Monitoring** (Base Table) | `1718:7764` | ✅ **COMPLETED** | [`src/app/monitoring/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/monitoring/page.tsx) (`/monitoring`) | UniversalSidebar, Ledger Table, User Row Actions, Pagination |
| **Active Students / Monitoring - Filter** | `1718:7518` | ✅ **COMPLETED** | [`src/app/students/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/students/page.tsx) (`/students`) | [`ActiveStudentsHeaderControls`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/monitoring/active-students-header-controls.tsx), [`FilterSidebarPanel`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/monitoring/filter-sidebar-panel.tsx) |
| **Xizmatlarni yuklash** (Tutor Info) | `1718:7384` | ✅ **COMPLETED** | [`src/app/services-upload/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/services-upload/page.tsx) (`/services-upload`) | Tutor Profile details (`Farhod Dadajonov`), Inline Edit mode, Send Message card |
| **Topshiriq** (Tasks List & Filter) | `1718:7128` | ✅ **COMPLETED** | [`src/app/tasks/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/tasks/page.tsx) (`/tasks`) | Tasks table ledger, Search bar, Filters toggle panel |
| **Topshiriq - yaratish** (Create Task Modal) | `1718:6606` | ✅ **COMPLETED** | [`src/components/modules/tasks/create-task-modal.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/tasks/create-task-modal.tsx) | Deadline picker, Staff/Client dropdowns, Task textarea, Drag & Drop file attachment |
| **Mijoz Sahifasi** (Customer Detail) | `1718:6342` | ✅ **COMPLETED** | [`src/app/customers/[id]/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/customers/[id]/page.tsx) (`/customers/1`) | Customer profile hero, edit toggle mode, ride history ledger table, passport download |
| **Xizmatlar tarixi** (Service History) | `1718:6096` | ✅ **COMPLETED** | [`src/app/history/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/history/page.tsx) (`/history`) | History chronological log table, search filter, collapsible filter drawer panel, pagination |
| **Xizmatlar tarixi - Filter** | `1718:5859` | ✅ **COMPLETED** | (Module for `/history`) | Reuses [`FilterSidebarPanel`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/monitoring/filter-sidebar-panel.tsx) |
| **Mijozlar** (Customers Directory) | `1718:5603` | ✅ **COMPLETED** | [`src/app/customers/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/customers/page.tsx) (`/customers`) | Customers directory table, user search, filter drawer toggle, [`CreateCustomerModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/customers/create-customer-modal.tsx) |
| **Mijozlar - Filter** | `1718:5340` | ✅ **COMPLETED** | (Module for `/customers`) | Reuses [`FilterSidebarPanel`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/monitoring/filter-sidebar-panel.tsx) |
| **Eslatmalar** (Notes / Reminders) | `1718:5084` | ✅ **COMPLETED** | [`src/app/notes/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/notes/page.tsx) (`/notes`) | Notes table ledger, tag badges, filter toggle panel, [`CreateNoteModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/notes/create-note-modal.tsx) |
| **Eslatmalar - Filter** | `1718:4844` / `1718:4575`| ✅ **COMPLETED** | (Module for `/notes`) | Reuses [`FilterSidebarPanel`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/monitoring/filter-sidebar-panel.tsx) |
| **SMS sozlamalari** (SMS Settings) | `1718:4336` | ✅ **COMPLETED** | [`src/app/sms-settings/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/sms-settings/page.tsx) (`/sms-settings`) | Gateway configuration, sender ID, template editor modal, SMS recipients log |
| **SMS shablon** (SMS Templates) | `1718:4085` | ✅ **COMPLETED** | [`src/components/modules/sms/sms-template-modal.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/sms/sms-template-modal.tsx) | SMS template card library, dynamic variable tags, edit modal |
| **Xodimlar** (Employees / Staff) | `1718:3728` | ✅ **COMPLETED** | [`src/app/staff/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/staff/page.tsx) (`/staff`) | Staff roster table, role badges (Administrator, Operator, Tutor Manager, Support), [`AddStaffModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/staff/add-staff-modal.tsx) |
| **Login** (Authentication) | `1718:8288` | ✅ **COMPLETED** | [`src/app/login/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/login/page.tsx) (`/login`) | Clean login card, username/password inputs, remember me toggle, ZARVIS brand illustration hero |
| **Students data** | `1718:8434` | ✅ **COMPLETED** | [`src/app/students-data/page.tsx`](file:///c:/Sudipto/FigmaWorkflow2/src/app/students-data/page.tsx) (`/students-data`) | Student profile hero, personal & academic details grid, inline edit mode, Import CTA |
| **ALL DESIGN SCREENS** | — | 🎉 **100% COMPLETE** | All 13 live routes registered | Production-ready Next.js 15 app router architecture |

---

## 3. 🧩 Completed Page Code References

### A. Dashboard (`src/app/page.tsx`)
- **Route**: `http://localhost:3000`
- **Features**: 4 crypto cards (BTC, LTC, ETM, BNB), dual wave market overview chart, balances with stacked glassy cards, recent activities table, team statistics.

### B. Monitoring Base (`src/app/monitoring/page.tsx`)
- **Route**: `http://localhost:3000/monitoring`
- **Features**: Universal sidebar, full ledger table, Tashkent locations, user rides and completion metrics, purple action buttons.

### C. Active Students with Filters (`src/app/students/page.tsx`)
- **Route**: `http://localhost:3000/students`
- **Features**: Header controls with active student count badge, search filter, and collapsible filter sidebar panel.

### D. Xizmatlarni yuklash - Tutor Info (`src/app/services-upload/page.tsx`)
- **Route**: `http://localhost:3000/services-upload`
- **Features**: Tutor profile details (`Farhod Dadajonov`, `Ro’ziboyev`), live inline editing, and send message interactive card.

### E. Topshiriqlar - Tasks & Modal (`src/app/tasks/page.tsx`)
- **Route**: `http://localhost:3000/tasks`
- **Features**: Tasks table ledger, search by name, collapsible filter sidebar, and interactive [`CreateTaskModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/tasks/create-task-modal.tsx) (Figma node `1718:6606`) with deadline picker, assignee, client, and file attachment.

### F. Mijoz Sahifasi - Customer Detail (`src/app/customers/[id]/page.tsx`)
- **Route**: `http://localhost:3000/customers/1`
- **Features**: Customer profile card (Figma node `1718:6342`), inline edit mode with dynamic save/edit toggle, customer attributes (Mijoz turi, STIR, JSHSHIR, Telefon, Kalit, Pasport yuklab olish), and complete "Xizmat Ko'rsatish Tarixi" table ledger with pagination controls.

### G. Xizmatlar tarixi - Service History & Filter (`src/app/history/page.tsx`)
- **Route**: `http://localhost:3000/history`
- **Features**: Service history ledger table (Figma node `1718:6096`), total users badge (`274 Users`), live search bar, toggleable slide-over filter panel (Figma node `1718:5859`), direct messaging action triggers, and customer detail drilldown links.

### H. Mijozlar - Customers Directory & Add Customer Modal (`src/app/customers/page.tsx`)
- **Route**: `http://localhost:3000/customers`
- **Features**: Customers directory table (Figma node `1718:5603`), user search, collapsible filter panel (Figma node `1718:5340`), and interactive [`CreateCustomerModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/customers/create-customer-modal.tsx) (Figma node `1718:5849`) to add new customer records with validation.

### I. Eslatmalar - Notes, Reminders & Modal (`src/app/notes/page.tsx`)
- **Route**: `http://localhost:3000/notes`
- **Features**: Notes ledger table (Figma node `1718:5084`), category tag badges (*Muhim, Xizmat, Oddiy, Shaxsiy*), search bar, slide-over filter panel (Figma node `1718:4844`), and interactive [`CreateNoteModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/notes/create-note-modal.tsx) (Figma node `1718:5330`).

### J. SMS sozlamalari & Shablon (`src/app/sms-settings/page.tsx`)
- **Route**: `http://localhost:3000/sms-settings`
- **Features**: SMS provider configuration cards (PlayMobile Gateway status, sender ID, monthly quota), live SMS template editor preview, and interactive [`SmsTemplateModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/sms/sms-template-modal.tsx) (Figma node `1718:4085`) supporting dynamic tag variables (`{mijoz_ismi}`, `{telefon}`, `{xizmat_nomi}`, `{sana}`, `{summa}`) and character count calculation.

### K. Xodimlar - Staff Directory & Add Staff Modal (`src/app/staff/page.tsx`)
- **Route**: `http://localhost:3000/staff`
- **Features**: Staff members ledger table (Figma node `1718:3728`), role badges (*Administrator, Operator, Tutor Manager, Support*), instant search, and interactive [`AddStaffModal`](file:///c:/Sudipto/FigmaWorkflow2/src/components/modules/staff/add-staff-modal.tsx) for staff onboarding and permission assignments.

### L. Login - Authentication Screen (`src/app/login/page.tsx`)
- **Route**: `http://localhost:3000/login`
- **Features**: Authentication login card (Figma node `1718:8288`), ZARVIS brand illustration hero, username & password inputs with eye reveal toggle, "Meni eslab qol" remember me checkbox, and seamless authentication flow redirecting to the dashboard.

### M. Students Data - Student Profile & Form (`src/app/students-data/page.tsx`)
- **Route**: `http://localhost:3000/students-data`
- **Features**: Student profile hero card (Figma node `1718:8434`), personal information ledger (*Name, Father Name, Phone, Birth date, Nationalities, Pasport, Family status, Invalid student status*), and academic details (*University, Speciality, Group name, Course, Education type, Payment type*) with live inline edit and Import CTA actions.
