# Stack Research: Home Care OS

**Researched:** 2026-01-19
**Domain:** Property Inspection / Home Care Management SaaS
**Confidence:** HIGH

---

## Executive Summary

The locked stack (Supabase + React + TypeScript + shadcn/ui + Tailwind + Vercel) is **validated as an excellent choice** for building a property inspection/home care management SaaS in 2025. This combination represents the modern "indie hacker to scale" stack with strong typing, rapid UI development, and managed infrastructure.

**Key validation points:**
- Supabase is production-ready for SaaS with built-in auth, storage, real-time, and PostgreSQL
- React 19.2 is stable with React Compiler for automatic performance optimization
- shadcn/ui with Tailwind 4 provides professional, accessible components with full customization
- TypeScript ensures type safety across the entire stack
- Vercel handles deployment complexity but requires cost monitoring at scale

**Critical additions needed:** PDF generation (@react-pdf/renderer), offline-first sync (PowerSync), image optimization, and email/SMS services.

**Primary concern:** Vercel costs can escalate with usage-based billing. Monitor closely; have Cloudflare/Railway as backup options.

---

## Core Stack (Locked) - VALIDATED

### React + TypeScript

| Aspect | Details |
|--------|---------|
| **Version** | React 19.2 (stable October 2025) |
| **Status** | Production-ready, widely adopted |
| **Confidence** | HIGH |

**Why it's correct:**
- React 19 includes the React Compiler (production-ready), eliminating manual useMemo/useCallback optimization
- Server Components reduce bundle size by 25-40%
- 38% faster initial loads, 32% fewer re-renders compared to React 18
- New Actions API simplifies async operations (form submissions, API calls)
- New `use` API for cleaner data fetching patterns
- TypeScript provides compile-time type safety, catching bugs before runtime

**What's new in 2025:**
- `<Activity />` component for pre-rendering hidden UI without performance impact
- Document metadata support (title, meta tags) natively in components
- Refs as standard props (no more forwardRef boilerplate)

**Sources:**
- [React 19.2 Release Notes](https://react.dev/blog/2025/10/01/react-19-2)
- [React v19 Announcement](https://react.dev/blog/2024/12/05/react-19)

---

### Supabase

| Aspect | Details |
|--------|---------|
| **Status** | Production-ready, scales MVP to enterprise |
| **Confidence** | HIGH |

**Why it's correct:**
- All-in-one backend: PostgreSQL database, auth, storage, real-time, edge functions
- Row Level Security (RLS) provides multi-tenant data isolation out of the box
- Built-in image transformations for inspection photos
- Automatic daily backups (Point-in-Time Recovery on higher plans)
- Native integration with PowerSync for offline-first (critical for inspector PWA)
- Companies like Vercel, Linear use Supabase in production

**Best practices to implement:**
- Enable RLS from day one for all tables with sensitive data
- Use database migrations via Supabase CLI (never manual schema changes in prod)
- Separate Supabase projects per environment (dev/staging/prod)
- Index frequently queried columns
- Enable real-time only on necessary tables (not everywhere)
- Monitor with pg_stat_statements for slow queries

**Concerns:**
- No native offline-first support (addressed with PowerSync addition)
- Real-time has connection limits on lower tiers

**Sources:**
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)

---

### shadcn/ui + Tailwind CSS

| Aspect | Details |
|--------|---------|
| **Versions** | shadcn/ui (latest), Tailwind CSS 4.x |
| **Confidence** | HIGH |

**Why it's correct:**
- shadcn/ui is built on Radix UI primitives (accessibility-first, WAI-ARIA compliant)
- Components copied into your codebase (full ownership, no lock-in)
- Tailwind 4 brings CSS-first configuration, OKLCH colors, and microsecond builds
- Most projects ship <10kB of CSS
- Professional appearance suitable for luxury home care clients

**Tailwind 4 changes (2025):**
- No more tailwind.config.js - configuration in CSS via `@theme` directive
- HSL colors converted to OKLCH for better color manipulation
- New `size-*` utility replaces `w-* h-*` combinations
- tw-animate-css replaces tailwindcss-animate

**shadcn/ui 2025 updates:**
- Full Tailwind v4 and React 19 support
- New visual styles: Vega, Nova, Maia, Lyra, Mira
- Can choose between Radix or Base UI as component foundation
- All primitives have `data-slot` attribute for styling
- Toast component deprecated in favor of Sonner

**Sources:**
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [Tailwind CSS 4 Features](https://medium.com/@sureshdotariya/shadcn-ui-tailwind-css-4-next-js-15-building-scalable-uis-in-2025-4de669b202fa)

---

### Vercel

| Aspect | Details |
|--------|---------|
| **Plans** | Hobby (Free), Pro ($20/user/mo), Enterprise ($3,500+/mo) |
| **Confidence** | MEDIUM (cost concerns) |

**Why it's a reasonable choice:**
- Zero-config deployment for React/Vite apps
- Edge Functions for performance-heavy logic
- Built-in analytics and observability
- Excellent DX for rapid iteration

**Concerns (monitor closely):**
- Usage-based billing can escalate quickly at production scale
- Pro plan includes 1TB bandwidth, overage is $0.15/GB
- Serverless function execution: 40 hours/month included, $5/hour overage
- Gap between Pro ($20/user) and Enterprise ($3,500+/mo) is significant
- No self-serve path to Enterprise tier

**Mitigation strategies:**
- Implement aggressive caching (Cache-Control headers)
- Use Edge Functions for performance-heavy logic
- Monitor bandwidth and function execution weekly
- Have Cloudflare Pages or Railway as backup deployment targets
- Consider hybrid: Vercel for frontend, separate backend hosting if costs spike

**Sources:**
- [Vercel Pricing Breakdown](https://flexprice.io/blog/vercel-pricing-breakdown)
- [Vercel Cost Optimization Guide](https://pagepro.co/blog/vercel-hosting-costs/)

---

## Required Additions

### PDF Generation

| Library | Version | Purpose |
|---------|---------|---------|
| **@react-pdf/renderer** | ^4.x | Professional inspection report PDFs |

**Confidence:** HIGH

**Why @react-pdf/renderer:**
- React component-based PDF creation (familiar JSX/CSS-like syntax)
- 860,000+ weekly downloads, 15,900+ GitHub stars
- Perfect for branded, data-driven documents (inspection reports)
- Full control over layout, typography, images
- Works in browser and server (can generate during inspection or later)

**Why NOT jsPDF:**
- jsPDF is better for simple HTML-to-PDF conversion
- Lacks React integration and component-based workflow
- Less suitable for complex, multi-page branded reports

**Implementation pattern:**
```typescript
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const InspectionReport = ({ inspection, photos, findings }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={companyLogo} style={styles.logo} />
        <Text style={styles.title}>Property Inspection Report</Text>
      </View>
      {/* Report content */}
    </Page>
  </Document>
);
```

**Sources:**
- [React-PDF Official Site](https://react-pdf.org/)
- [PDF Libraries Comparison](https://blog.react-pdf.dev/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025)

---

### PWA / Offline-First

| Library | Version | Purpose |
|---------|---------|---------|
| **PowerSync** | @powersync/web | Offline-first sync with Supabase |
| **vite-plugin-pwa** | ^0.17+ | PWA manifest and service worker |

**Confidence:** HIGH

**Why PowerSync (not raw Workbox):**
- Purpose-built for Supabase offline-first
- Embeds SQLite in browser/app for local-first data
- Automatic bidirectional sync with conflict resolution
- Upload queue persists writes until connectivity restored
- No schema changes required on Supabase side
- Integrates with Supabase Auth natively
- React demo app is PWA-compatible and works fully offline

**How it works:**
1. App reads/writes to local SQLite (instant, no spinners)
2. PowerSync syncs changes to Supabase when online
3. Sync Rules control what data syncs to which users
4. Inspector can complete full inspection offline, sync later

**Why vite-plugin-pwa:**
- Zero-config PWA setup for Vite projects
- Generates Web App Manifest and Service Worker automatically
- Uses Workbox under the hood with sensible defaults
- Supports prompt for new content (update notifications)
- Framework-agnostic (works with React, Vue, etc.)

**Sources:**
- [PowerSync + Supabase Integration](https://docs.powersync.com/integration-guides/supabase-+-powersync)
- [PowerSync JS SDK](https://github.com/powersync-ja/powersync-js)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/guide/)

---

### Real-time Sync

| Feature | Provider | Purpose |
|---------|----------|---------|
| **Realtime Channels** | Supabase (built-in) | Live updates, presence |
| **Postgres Changes** | Supabase (built-in) | Database change notifications |

**Confidence:** HIGH

**Use Supabase Realtime for:**
- Dashboard updates when inspections complete
- Presence (who's viewing what property)
- Live notifications to clients

**Best practices:**
- Enable real-time only on necessary tables (not everything)
- Disable UPDATE/DELETE events if only INSERT needed
- Batch/debounce client updates to reduce re-renders
- Real-time isn't free - use where latency matters

**Note:** For offline-capable real-time, PowerSync handles sync. Supabase Realtime is for online-only features (dashboards, admin panels).

**Sources:**
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

---

### AI Integration

| Library | Version | Purpose |
|---------|---------|---------|
| **@anthropic-ai/sdk** | ^0.x | Claude API for AI features |

**Confidence:** HIGH

**Why Anthropic SDK:**
- Official TypeScript SDK with full type definitions
- Streaming responses via SSE
- File upload support (inspection photos for analysis)
- Beta API access for new features

**Use cases for Home Care OS:**
- Auto-generate inspection findings from photos
- Summarize inspection reports
- Draft client communications
- Suggest maintenance recommendations

**Authentication:**
- Set `ANTHROPIC_API_KEY` environment variable
- Also supports Bedrock and Vertex AI for enterprise deployments

**Sources:**
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript)

---

### Image Handling

| Library | Version | Purpose |
|---------|---------|---------|
| **browser-image-compression** | ^2.x | Client-side image compression |
| **Supabase Storage** | (built-in) | Image storage and CDN |

**Confidence:** HIGH

**Why browser-image-compression:**
- Compress images before upload (4MB -> 500KB typical)
- Supports JPEG, PNG, WebP, BMP
- Web Worker support for non-blocking compression
- Configurable maxSizeMB and maxWidthOrHeight

**Why Supabase Storage:**
- Built-in image transformations (resize, crop on-the-fly)
- CDN delivery with caching
- RLS policies for access control
- Resumable uploads via TUS protocol for large files

**Best practices:**
- Compress on client before upload (save bandwidth, storage)
- Set max upload size per bucket
- Pre-generate common variants for inspection reports
- Use high Cache-Control values for assets
- Convert to WebP where browser support allows

**Implementation pattern:**
```typescript
import imageCompression from 'browser-image-compression';

const compressAndUpload = async (file: File) => {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const { data, error } = await supabase.storage
    .from('inspection-photos')
    .upload(`${inspectionId}/${file.name}`, compressed);
};
```

**Sources:**
- [browser-image-compression npm](https://www.npmjs.com/package/browser-image-compression)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

### Notifications (Email/SMS)

| Service | Purpose | Pricing |
|---------|---------|---------|
| **Resend** | Transactional email | Free tier + pay-as-you-go |
| **Twilio** or **Plivo** | SMS notifications | Usage-based |

**Confidence:** HIGH (Email), MEDIUM (SMS - evaluate alternatives)

**Why Resend for Email:**
- Built by React Email creators (tight integration)
- React Email components for beautiful, responsive templates
- React 19 and Tailwind 4 support
- Simple API, excellent deliverability
- DKIM/SPF/DMARC authentication included

**Email use cases:**
- Inspection scheduled notifications
- Report ready for review
- Invoice/billing notifications
- Password reset, account alerts

**Why Twilio for SMS (with caveats):**
- Industry standard, reliable delivery
- Global coverage (160+ countries)
- BUT: Usage-based billing can be unpredictable

**Twilio alternatives to evaluate:**
- **Plivo:** Lower cost, good fraud prevention, 220+ countries
- **Telnyx:** Lowest per-message cost ($0.004), owns network end-to-end
- **Vonage:** 1,600 carriers, reliable but higher cost

**SMS use cases:**
- Inspection reminder (day before)
- Inspector arrival notification
- Urgent maintenance alerts

**Sources:**
- [Resend Official Site](https://resend.com/)
- [React Email Integration](https://react.email/docs/integrations/resend)
- [Twilio Alternatives Comparison](https://www.textla.com/post/twilio-alternatives)

---

### Other Critical Libraries

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **TanStack Query** | ^5.x | Server state management | HIGH |
| **React Hook Form** | ^7.x | Form handling | HIGH |
| **Zod** | ^3.x | Schema validation | HIGH |
| **Zustand** | ^5.x | Client state management | HIGH |
| **date-fns** | ^3.x | Date manipulation | HIGH |
| **Lucide React** | ^0.x | Icons | HIGH |
| **Sonner** | ^1.x | Toast notifications | HIGH |
| **@stripe/react-stripe-js** | ^2.x | Payment processing | HIGH |

#### TanStack Query
- Server state != client state. TanStack Query handles caching, deduplication, background sync
- Eliminates need for Redux for API data
- 5+ compatible with React 19
- Use for all Supabase data fetching

#### React Hook Form + Zod
- 12.7M weekly downloads, most popular form library
- Minimal re-renders (only on submit, not every keystroke)
- Zod provides TypeScript type inference from schemas
- Zero dependencies in Zod, compile-time + runtime validation

#### Zustand
- Lightweight global state (UI state, user preferences)
- 5.0.6 requires React 18+ (we're on 19)
- Hook-based API, no providers needed
- Use for true client state only (not server data)

#### date-fns
- Functional approach, tree-shakable
- ~18KB gzipped without locales
- Faster than dayjs due to no wrapper objects
- Better for TypeScript projects

#### Lucide React
- 1,500+ icons, clean consistent design
- Tree-shakable (only imported icons in bundle)
- Works seamlessly with shadcn/ui
- More icons than Heroicons (300+)

#### Sonner
- shadcn/ui's recommended toast library (deprecated their own)
- Beautiful, accessible toast notifications
- Supports custom styling, themes

#### Stripe
- @stripe/react-stripe-js for payment forms
- PCI-compliant iframe approach
- Supports subscriptions, invoices, payment links
- Test mode available for development

**Sources:**
- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Hook Form](https://react-hook-form.com/)
- [Zod vs Yup Comparison](https://betterstack.com/community/guides/scaling-nodejs/yup-vs-zod/)
- [Zustand Comparison](https://zustand.docs.pmnd.rs/getting-started/comparison)

---

## What NOT to Use

| Avoid | Use Instead | Rationale |
|-------|-------------|-----------|
| **Redux** | Zustand + TanStack Query | Overkill for this project. Zustand for client state, TanStack Query for server state eliminates Redux complexity |
| **Moment.js** | date-fns | Moment is deprecated, massive bundle (66KB), mutable API |
| **jsPDF** | @react-pdf/renderer | jsPDF lacks React integration, harder to maintain complex branded reports |
| **Formik** | React Hook Form | Formik has more re-renders, React Hook Form is faster and more popular in 2025 |
| **Yup** | Zod | Yup requires manual TypeScript types, Zod infers them automatically |
| **Custom service workers** | vite-plugin-pwa + PowerSync | Hand-rolling offline is complex, error-prone, and unnecessary |
| **Firebase** | Supabase | Already locked Supabase; Firebase is more complex, vendor-locked |
| **Axios** | fetch + TanStack Query | Native fetch is sufficient, TanStack Query handles retries/caching |
| **CSS Modules** | Tailwind CSS | Already locked Tailwind; mixing approaches adds complexity |
| **Material UI** | shadcn/ui | Already locked shadcn; MUI has heavier bundle, less customizable |

---

## Confidence Assessment

| Category | Confidence | Rationale |
|----------|------------|-----------|
| Core Stack Validation | HIGH | Supabase, React 19, shadcn/ui, Tailwind 4 all production-proven in 2025 |
| PDF Generation | HIGH | @react-pdf/renderer is the clear choice for React component-based PDFs |
| Offline/PWA | HIGH | PowerSync is purpose-built for Supabase offline, widely adopted |
| AI Integration | HIGH | Official Anthropic SDK, straightforward integration |
| Image Handling | HIGH | browser-image-compression + Supabase Storage is standard pattern |
| Email (Resend) | HIGH | Built for this exact use case, excellent DX |
| SMS Provider | MEDIUM | Twilio works but evaluate Plivo/Telnyx for cost optimization |
| Vercel Costs | MEDIUM | Works well but requires monitoring; have backup deployment target |
| Form Libraries | HIGH | React Hook Form + Zod is 2025 standard |
| State Management | HIGH | Zustand + TanStack Query is modern best practice |

---

## Summary: Complete Stack

### Core (Locked)
- React 19.2 + TypeScript
- Supabase (DB, Auth, Storage, Realtime)
- shadcn/ui + Tailwind CSS 4
- Vercel (with cost monitoring)

### Required Additions
```bash
# PDF Generation
npm install @react-pdf/renderer

# PWA & Offline
npm install vite-plugin-pwa @powersync/web

# Data & Forms
npm install @tanstack/react-query react-hook-form zod @hookform/resolvers

# State
npm install zustand

# AI
npm install @anthropic-ai/sdk

# Images
npm install browser-image-compression

# Payments
npm install @stripe/react-stripe-js @stripe/stripe-js

# Email (server-side)
npm install resend @react-email/components

# Utilities
npm install date-fns lucide-react sonner
```

### Architecture Summary
```
Frontend (Vercel)
├── React 19.2 + TypeScript
├── shadcn/ui + Tailwind CSS 4
├── TanStack Query (server state)
├── Zustand (client state)
├── React Hook Form + Zod (forms)
├── PowerSync (offline SQLite)
└── vite-plugin-pwa (service worker)

Backend (Supabase)
├── PostgreSQL database
├── Row Level Security (multi-tenant)
├── Supabase Auth
├── Supabase Storage (images)
├── Supabase Realtime
└── Edge Functions (if needed)

External Services
├── Stripe (payments)
├── Resend (email)
├── Twilio/Plivo (SMS)
└── Anthropic Claude (AI)
```

---

## Sources

### Primary (HIGH confidence)
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [PowerSync + Supabase](https://docs.powersync.com/integration-guides/supabase-+-powersync)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Hook Form](https://react-hook-form.com/)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)

### Secondary (MEDIUM confidence)
- [Vercel Pricing Analysis](https://flexprice.io/blog/vercel-pricing-breakdown)
- [Zod vs Yup Comparison](https://betterstack.com/community/guides/scaling-nodejs/yup-vs-zod/)
- [Zustand vs Redux 2025](https://www.edstem.com/blog/zustand-vs-redux-why-simplicity-wins-in-modern-react-state-management/)
- [Resend Official](https://resend.com/)
- [Twilio Alternatives](https://www.textla.com/post/twilio-alternatives)

### Tertiary (LOW confidence - validate if needed)
- Community blog posts on specific integration patterns
- npm download comparisons (popularity proxy only)

---

**Research completed:** 2026-01-19
**Valid until:** ~2026-03-19 (re-validate for fast-moving libraries like PowerSync, shadcn/ui)
