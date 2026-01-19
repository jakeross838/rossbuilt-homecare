# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- TypeScript ~5.9.3 - All frontend code, type definitions, configuration
- SQL (PostgreSQL) - Database migrations and functions in `supabase/migrations/`

**Secondary:**
- JavaScript (ES Modules) - Some config files (`tailwind.config.js`, `postcss.config.js`, `eslint.config.js`)

## Runtime

**Environment:**
- Node.js (version managed via package.json `"type": "module"`)
- Deno 2 - Supabase Edge Functions runtime (configured in `supabase/config.toml`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present in both root and `apps/admin/`

## Frameworks

**Core:**
- React 19.2.0 - UI framework (`apps/admin/src/`)
- React Router DOM 7.12.0 - Client-side routing (`apps/admin/src/App.tsx`)
- Vite 7.2.4 - Build tool and dev server (`apps/admin/vite.config.ts`)

**State Management:**
- Zustand 5.0.10 - Client state (`apps/admin/src/stores/`)
- TanStack React Query 5.90.17 - Server state/data fetching (`apps/admin/src/hooks/`)

**Forms & Validation:**
- React Hook Form 7.71.1 - Form handling
- Zod 4.3.5 - Schema validation (`apps/admin/src/lib/validations/`)
- @hookform/resolvers 5.2.2 - Zod integration with React Hook Form

**Testing:**
- Playwright 1.57.0 - E2E testing (`apps/admin/e2e/`)
- Playwright config: `apps/admin/playwright.config.ts`

**Build/Dev:**
- Vite 7.2.4 - Bundler with HMR
- @vitejs/plugin-react 5.1.1 - React integration
- vite-plugin-pwa 1.2.0 - Progressive Web App support

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.90.1 - Database client, auth, storage, realtime
- @tanstack/react-query 5.90.17 - Async state management, caching
- @tanstack/react-table 8.21.3 - Data table component
- react-router-dom 7.12.0 - Application routing

**UI Components:**
- Radix UI primitives (14 packages) - Accessible UI components:
  - `@radix-ui/react-alert-dialog` 1.1.15
  - `@radix-ui/react-avatar` 1.1.11
  - `@radix-ui/react-checkbox` 1.3.3
  - `@radix-ui/react-dialog` 1.1.15
  - `@radix-ui/react-dropdown-menu` 2.1.16
  - `@radix-ui/react-label` 2.1.8
  - `@radix-ui/react-popover` 1.1.15
  - `@radix-ui/react-radio-group` 1.3.8
  - `@radix-ui/react-scroll-area` 1.2.10
  - `@radix-ui/react-select` 2.2.6
  - `@radix-ui/react-separator` 1.1.8
  - `@radix-ui/react-slot` 1.2.4
  - `@radix-ui/react-switch` 1.2.6
  - `@radix-ui/react-tabs` 1.1.13
  - `@radix-ui/react-toast` 1.2.15
  - `@radix-ui/react-tooltip` 1.2.8
- lucide-react 0.562.0 - Icons
- class-variance-authority 0.7.1 - Component variants
- clsx 2.1.1 + tailwind-merge 3.4.0 - Class name utilities

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS (`apps/admin/tailwind.config.js`)
- @tailwindcss/postcss 4.1.18 - PostCSS integration
- PostCSS 8.5.6 - CSS processing
- autoprefixer 10.4.23 - Vendor prefixing

**Data Visualization:**
- Recharts 3.6.0 - Charts/graphs (`apps/admin/src/components/charts/`)

**PDF Generation:**
- @react-pdf/renderer 4.3.2 - Client-side PDF generation (`apps/admin/src/lib/pdf/`)

**Utilities:**
- date-fns 4.1.0 - Date manipulation
- idb 8.0.3 - IndexedDB wrapper for offline support (`apps/admin/src/lib/offline/`)

**Infrastructure:**
- workbox (via vite-plugin-pwa) - Service worker/PWA caching

## Configuration

**Environment:**
- `.env.local` - Local development secrets (gitignored)
- `.env.local.example` - Template for required env vars
- `.env.supabase` - Supabase CLI credentials (gitignored)
- Vite env prefix: `VITE_` for client-exposed variables

**Required Environment Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://app.yourdomain.com
```

**Build Configuration:**
- `apps/admin/vite.config.ts` - Vite config with:
  - React plugin
  - PWA plugin with Workbox
  - Path alias `@/` -> `./src/`
  - Manual chunk splitting for vendor bundles
- `apps/admin/tsconfig.app.json` - TypeScript config:
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Strict mode enabled (strictNullChecks disabled)
  - Path alias: `@/*` -> `./src/*`
- `apps/admin/tailwind.config.js` - Tailwind with:
  - Dark mode (class-based)
  - Custom brand colors (rb-green, rb-sand)
  - Radix UI animation keyframes

**Linting:**
- ESLint 9.39.1 with flat config (`apps/admin/eslint.config.js`)
- typescript-eslint 8.46.4
- eslint-plugin-react-hooks 7.0.1
- eslint-plugin-react-refresh 0.4.24

## Platform Requirements

**Development:**
- Node.js with ES module support
- Supabase CLI for local development and migrations
- npm for package management

**Production:**
- Vercel - Static hosting with serverless functions
- Supabase - Backend-as-a-Service (database, auth, storage, edge functions)
- PostgreSQL 17 - Database (managed by Supabase)

## Monorepo Structure

**Active:**
- `apps/admin/` - Main admin application (fully implemented)

**Placeholder (empty):**
- `apps/client-portal/` - Future client-facing portal
- `apps/inspector/` - Future inspector mobile app
- `packages/api/` - Shared API logic
- `packages/database/` - Shared database types
- `packages/shared/` - Shared utilities

**Shared Types:**
- `src/types/database.ts` - Auto-generated Supabase types (via `npm run db:gen-types`)

---

*Stack analysis: 2026-01-19*
