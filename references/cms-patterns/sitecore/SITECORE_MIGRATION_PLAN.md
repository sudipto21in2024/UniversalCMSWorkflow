# Maison Aura — Sitecore XM Cloud / XP Headless Architecture & Migration Plan

## 1. Project Overview & Scope

This project implements the **Maison Aura** luxury haute couture digital experience in **Sitecore XM Cloud / Sitecore XP** using:
- **Headless Next.js 15 (App Router)** & React 19
- **Sitecore Experience Edge (GraphQL)** delivery endpoint
- **Sitecore JSS (JavaScript Services)** rendering engine with dynamic placeholders
- **Sitecore Helix Architecture** (.NET C# strongly-typed backend models & serialization)
- **Experience Editor / Sitecore Pages** inline visual editing compatibility
- **Docker Containerization** (Local Mock Mode & Full Sitecore XP Container Topology)

---

## 2. Optimizely vs Sitecore Concept & Component Mapping

| Concept | Optimizely 12/13 (Source) | Sitecore XM Cloud / XP (Target) |
| :--- | :--- | :--- |
| **Backend Data Modeling** | PageData & BlockData classes | Sitecore Data Templates & Helix C# Models (IGlassBase, IHeroEditorial, ICraftStory, etc.) |
| **Dynamic Area Injection** | ContentArea | Sitecore Placeholders (<Placeholder name= aura-main />) |
| **Component Resolution** | BlockFactory (discriminating on _type / __typename) | Sitecore ComponentFactory (resolving rendering names from Layout Service JSON) |
| **Edge Delivery API** | Optimizely Graph (https://cg.optimizely.com) | Sitecore Experience Edge GraphQL (/sitecore/api/graph/edge) |
| **WYSIWYG Inline Editing** | OPE / Visual Builder (data-epi-property-name) | Experience Editor / Sitecore Pages (SitecoreText, SitecoreImage, SitecoreRichText with Chrome markers) |
| **Cache Invalidation** | Next.js Tag revalidation (/api/revalidate) | Sitecore Experience Edge Webhooks (/api/revalidate) |
| **Item Serialization** | Code-first database migrations | Sitecore Content Serialization (SCS) YAML tree (sitecore.json, .module.json) |

---

## 3. Directory & File Plan for C:\Sudipto\SitecoreTechDemonstration

C:\Sudipto\SitecoreTechDemonstration/
├── sitecore/                                 # Sitecore C# Backend (Helix Compliant)
│   ├── MaisonAura.Sitecore.sln               # Visual Studio Solution
│   ├── src/
│   │   ├── Foundation/                       # Foundation Layer (Multisite, ORM, Serialization)
│   │   │   ├── Serialization/
│   │   │   └── GlassMapper/
│   │   ├── Feature/                          # Feature Layer (Components & Templates)
│   │   │   ├── HeroEditorial/
│   │   │   ├── CraftStory/
│   │   │   ├── Lookbook/
│   │   │   ├── Artisans/
│   │   │   └── BespokeInquiry/
│   │   └── Project/                          # Project Layer (Main Layouts & Pipelines)
│   │       └── MaisonAura/
│   └── serialization/                        # Sitecore Content Serialization (SCS) YAML Items
│       ├── templates/
│       ├── renderers/
│       └── content/
│
├── src/                                      # Next.js 15 Headless Frontend
│   ├── app/                                  # App Router Pages & API Routes
│   │   ├── layout.tsx                        # Root Layout with Font & Theme
│   │   ├── page.tsx                          # Dynamic Sitecore Landing Page
│   │   ├── not-found.tsx                     # Luxury 404
│   │   ├── collections/                      # Collections list & [slug] dynamic pages
│   │   ├── look/[id]/                        # Look Details with Hotspot Viewer
│   │   ├── artisans/page.tsx                 # Master Artisans atelier page
│   │   └── api/
│   │       ├── graphql/route.ts              # Local Experience Edge GraphQL endpoint
│   │       ├── editing/render/route.ts       # Sitecore Experience Editor & Pages bridge
│   │       ├── preview/route.ts              # Sitecore Preview Mode handler
│   │       └── revalidate/route.ts           # Edge Webhook ISR handler
│   ├── components/
│   │   ├── sitecore/                         # JSS Rendering Components
│   │   │   ├── ComponentFactory.tsx          # Dynamic JSS Component Resolver
│   │   │   ├── HeroEditorialRendering.tsx
│   │   │   ├── CraftStoryRendering.tsx
│   │   │   ├── LookbookGridRendering.tsx
│   │   │   ├── CuratedReelRendering.tsx
│   │   │   └── BespokeInquiryRendering.tsx
│   │   └── ui/                               # Shared Luxury UI Widgets (Copied)
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── HotspotViewer.tsx
│   │       ├── VIPBookingModal.tsx
│   │       ├── SearchDrawer.tsx
│   │       ├── LookCard.tsx
│   │       └── ThemeToggle.tsx
│   ├── lib/
│   │   └── sitecore/                         # Experience Edge Client & Data Access
│   │       ├── client.ts                     # Dual-Mode Edge / Disconnected Client
│   │       ├── queries.ts                    # Edge GraphQL queries & fragments
│   │       ├── types.ts                      # Sitecore Item & Layout Service types
│   │       └── seed-data.ts                  # Layout Service JSON simulation data
│   └── styles/
│       └── globals.css                       # Luxury Styling Tokens & Runway Animations (Copied)
│
├── docs/                                     # Comprehensive Architecture & Developer Guides
│   ├── 01_sitecore_system_architecture.md
│   ├── 02_sitecore_helix_and_templates.md
│   ├── 03_sitecore_experience_edge_graphql.md
│   ├── 04_sitecore_jss_component_factory.md
│   ├── sitecore_developer_guide.md
│   └── sitecore_experience_editor_guide.md
│
├── docker-compose.yml                        # Docker setup (Instant Local Mock Mode)
├── docker-compose.sitecore.yml               # Docker setup (Full Sitecore XP / XM Cloud topology)
├── Dockerfile.frontend                       # Next.js production Dockerfile
├── package.json                              # Frontend package with JSS dependencies
├── tsconfig.json                             # TypeScript configuration
├── next.config.mjs                           # Next.js image domain configuration
├── README.md                                 # Full Project Documentation & Setup Guide
└── start.bat / stop.bat / restart.bat        # Local execution scripts
