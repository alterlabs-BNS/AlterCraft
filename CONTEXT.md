# AlterCraft — Project Context

## Overview

**AlterCraft** is a custom furniture and interior solutions business based in Ghaziabad, Delhi NCR.
This repository contains the company's customer-facing website at **[www.altercraft.in](https://www.altercraft.in/)**.

---

## Business Details

| Field             | Value |
|-------------------|-------|
| **Brand**         | AlterCraft |
| **Domain**        | www.altercraft.in |
| **Phone**         | +91 88175 03658 |
| **Address**       | Shop No. 7, J.S. Plaza, Near Zero Gravity Sports Complex, Chipiyana Road, Chipiyana Buzurg, Ghaziabad, UP 201009 |
| **Service Areas** | Ghaziabad, Noida, Gurgaon, Faridabad, Meerut, Delhi NCR |
| **Sister Brand**  | [AlterLabs](https://alterlabs.in/) (digital/tech studio) |

### Core Services

- Custom furniture (made-to-order)
- Modular wardrobes & kitchens
- CNC panels & cutting
- Pooja mandirs & nameplates
- Designer beds & flush doors
- Office/commercial furniture
- Furniture rental

---

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| **Framework**  | React 18 (TSX) |
| **Bundler**    | Vite 6.3.5 (via `@vitejs/plugin-react-swc`) |
| **Styling**    | Vanilla CSS (`src/index.css`, `src/styles/globals.css`, `src/styles/elegant-site.css`) + component-scoped CSS |
| **Routing**    | `react-router` (browser router, defined in `src/routes.tsx`) |
| **UI Library** | Radix UI primitives (`@radix-ui/react-*`), Lucide icons, shadcn-style utilities (`class-variance-authority`, `clsx`, `tailwind-merge`) |
| **Animation**  | `motion` (Framer Motion) |
| **Other deps** | `recharts`, `sonner` (toasts), `cmdk` (command palette), `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `vaul` (drawer), `next-themes` |
| **Build**      | `vite build` → `build/` directory, followed by `scripts/postbuild.mjs` |
| **Dev server** | `vite` on port 3000 (`npm run dev`) |
| **Hosting**    | GitHub Pages (CNAME present, `.github/` workflows) |

### Path Alias

`@` → `./src` (configured in `vite.config.ts`)

---

## Project Structure

```
alter craft/
├── index.html                  # HTML entry (SEO meta, structured data)
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite config with path aliases
├── CNAME                       # GitHub Pages custom domain
├── public/
│   ├── altercraft-logo.png     # Brand logo
│   ├── robots.txt / sitemap.xml
│   ├── images/                 # Static product images
│   ├── blog/                   # Static blog HTML pages
│   ├── cart/                   # Cart-related static page
│   ├── cancellation-policy/    # Policy page
│   ├── disclaimer/             # Disclaimer page
│   └── privacy-policy/         # Privacy policy page
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component
│   ├── routes.tsx              # Client-side routes
│   ├── index.css               # Primary stylesheet (~33 KB)
│   ├── styles/
│   │   ├── globals.css         # Global resets & variables
│   │   └── elegant-site.css    # Extended theme styles
│   ├── components/             # 32 TSX components + 3 subdirs (elegant/, figma/, ui/)
│   │   ├── Header.tsx / Navigation.tsx
│   │   ├── LandingHero.tsx / HeroPoster.tsx
│   │   ├── CatalogSection.tsx / FurnitureCatalog.tsx
│   │   ├── BuySection.tsx / RentSection.tsx / TradeInSection.tsx
│   │   ├── ContactSection.tsx / ChatWidget.tsx
│   │   ├── ProductCard.tsx / ProductGalleryPage.tsx
│   │   ├── FooterPoster.tsx / AboutUs.tsx
│   │   └── ... (more sections)
│   ├── pages/
│   │   ├── Home.tsx            # Homepage (largest, ~26 KB)
│   │   ├── Gallery.tsx         # Product gallery page
│   │   ├── ProductDetail.tsx   # Single product detail
│   │   ├── servicePages.tsx    # Kitchen, beds, doors, wardrobes, office
│   │   └── InfoPages.tsx       # About, contact, warranty, 404
│   ├── data/
│   │   ├── catalog.ts          # Product catalog data
│   │   ├── products.ts         # Product definitions
│   │   ├── productGallery.ts   # Gallery-specific data
│   │   └── siteDetails.ts     # Business info constants
│   ├── assets/                 # Bundled images (Figma exports)
│   ├── utils/                  # Utility helpers
│   └── guidelines/             # Internal design guidelines
├── scripts/
│   └── postbuild.mjs           # Post-build processing
├── archive/                    # Archived/legacy files
└── Elegant Furniture Business Website/  # Reference design bundle
```

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Homepage |
| `/gallery`, `/portfolio`, `/products` | `ProductGalleryPage` | Product showcase |
| `/modular-kitchen`, `/kitchen` | `ModularKitchen` | Kitchen service page |
| `/designer-beds`, `/beds` | `DesignerBeds` | Beds service page |
| `/flush-doors`, `/doors` | `FlushDoors` | Doors service page |
| `/wardrobes`, `/storage` | `Wardrobes` | Wardrobe service page |
| `/office-commercial`, `/office` | `OfficeCommercial` | Office furniture page |
| `/warranty-quality`, `/warranty` | `WarrantyQuality` | Warranty info |
| `/about` | `About` | About page |
| `/contact`, `/get-quote` | `Contact` | Contact / quote form |
| `/product/:id`, `/products/:id` | `ProductDetail` | Individual product |
| `*` | `NotFound` | 404 fallback |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build
npm run build
```

---

## SEO

- Full meta tags (title, description, keywords, OG, canonical) in `index.html`
- JSON-LD `LocalBusiness` structured data with address, phone, service areas
- `robots.txt` and `sitemap.xml` in `public/`

---

## Key Conventions

- **TypeScript** (`.tsx` / `.ts`) for all source files
- **Path alias** `@/` resolves to `src/`
- Product data lives in `src/data/` as typed TypeScript modules
- Build output goes to `build/` (gitignored)
- GitHub Pages deployment via `.github/` workflows
- Figma-exported assets aliased in `vite.config.ts`
