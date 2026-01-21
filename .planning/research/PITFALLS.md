# Pitfalls Research: Home Care OS

**Researched:** 2026-01-19
**Domain:** Property Inspection / Home Care Management SaaS
**Overall Confidence:** MEDIUM-HIGH (majority verified through official docs and multiple sources)

## Executive Summary

Property inspection and home care management SaaS projects face critical risks across five dimensions: offline sync complexity (particularly on iOS), PDF generation reliability at scale, photo handling costs and performance, multi-tenant security, and AI integration rate limits. The highest-risk areas for Home Care OS are **offline-first PWA sync on iOS** (50MB cache limit, 7-day storage eviction), **PDF generation performance** (choosing wrong library leads to unusable latency), and **Supabase RLS misconfiguration** (single missing policy exposes tenant data). Projects in this space commonly fail due to underestimating sync complexity, choosing inappropriate PDF libraries for scale, and treating pricing as an afterthought. Business pitfalls center on pricing too low for luxury market and excessive feature scope for v1.

---

## Technical Pitfalls

### Offline Sync

**The Core Problem:** Offline-first PWAs face fundamentally different challenges than standard web apps. The complexity is not in caching data locally---it is in resolving conflicts when multiple devices edit the same data offline, handling iOS platform restrictions, and recovering gracefully from sync failures.

#### Warning Signs
- Assuming "offline support" just means caching GET requests
- No conflict resolution strategy defined before building
- Not testing with actual iOS devices in airplane mode
- Ignoring the Background Sync API limitations across browsers
- Planning to "add offline later" rather than designing offline-first

#### iOS-Specific Constraints (CRITICAL)
| Constraint | Impact | Source |
|------------|--------|--------|
| 50MB Cache API limit | Cannot cache large assets (photos, PDFs) | [MagicBell PWA Guide](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) |
| 7-day script-writable storage cap | Data can be evicted if PWA not accessed | [Brainhub PWA iOS](https://brainhub.eu/library/pwa-on-ios) |
| No Background Sync API | Cannot sync data when app is closed | [Codewave iOS Limitations](https://codewave.com/insights/progressive-web-apps-ios-limitations-status/) |
| Safari-only PWA support | No choice of browser engine | [Codewave iOS Limitations](https://codewave.com/insights/progressive-web-apps-ios-limitations-status/) |

#### Prevention Strategy
1. **Design offline-first from day one** - Treat network as unreliable, not the default
2. **Use IndexedDB for data, not Cache API** - IndexedDB quota is 500MB+ vs 50MB for Cache
3. **Implement CRDT-like conflict resolution** - Avoid "last write wins" for critical data
4. **Test on iOS in airplane mode extensively** - Real devices, not simulators
5. **Build sync status indicators** - Users must know if their data is synced
6. **Implement sync retry with exponential backoff** - Network is flaky in the field
7. **Design for graceful cache miss** - Assume cache is empty and handle it

#### Conflict Resolution Approaches
- **Last Write Wins (LWW):** Simple but loses data. Only use for non-critical fields.
- **Version vectors:** Track which device made changes. Requires server merge logic.
- **CRDT libraries (Yjs, Automerge):** Automatic merge but adds complexity. Best for collaborative editing.
- **Manual conflict UI:** Show user both versions. Best for inspections where human judgment needed.

**Recommendation:** For inspection data, use version vectors with server-side merge for most fields, but surface conflicts to users for critical findings. Real-world case: "Initial sync conflicts from concurrent edits were overcome with versioned updates and CRDT-like merging, reducing errors to less than 1%." [GTC Sys PWA Guide](https://gtcsys.com/comprehensive-faqs-guide-data-synchronization-in-pwas-offline-first-strategies-and-conflict-resolution/)

#### Phase to Address
- **Phase 1 (Foundation):** Design data model with sync in mind (timestamps, version fields, device IDs)
- **Phase 2 (Inspector PWA):** Full offline implementation with conflict resolution

---

### PDF Generation

**The Core Problem:** Beautiful, branded PDF reports are critical to the value proposition. Choosing the wrong generation approach leads to slow generation (unusable for field work), ugly output (destroys premium positioning), or scaling nightmares (crashes under load).

#### Warning Signs
- Choosing Puppeteer/headless browser for production ("it works in development")
- Attempting to use DOM-targeting React components (@react-pdf/renderer does NOT support MUI, Tailwind, etc.)
- Not testing with real inspection data (20+ photos, detailed findings)
- Assuming PDF generation is a "quick feature"
- Not accounting for server-side generation costs/latency

#### Library Comparison
| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| @react-pdf/renderer | React-native syntax, server or client, good for complex layouts | Cannot use DOM components, learning curve | **Best for our use case** |
| Puppeteer/headless | Can render any HTML | Huge PDFs, not searchable, no links work, massive latency, scaling nightmare | **Avoid** |
| jsPDF + html2canvas | Simple, works with existing HTML | Rasterizes (images not text), external CSS fails, huge file sizes | **Avoid for reports** |
| PDF API services | Offload complexity | Vendor lock-in, per-PDF costs add up, latency | Consider as backup |

#### Prevention Strategy
1. **Use @react-pdf/renderer from the start** - Do NOT plan to "migrate later"
2. **Build PDF components separately** - They cannot share UI components with your web app
3. **Design PDF template system early** - Clients will want customization
4. **Test with realistic data** - 30+ photos, long text, multi-page layouts
5. **Implement server-side generation** - Do not generate in browser (slow, memory issues)
6. **Cache generated PDFs** - Do not regenerate on every view
7. **Plan for 2-4 months of PDF UI development** - It is more work than expected

#### Puppeteer Problems (Why to Avoid)
From production experience: "Using puppeteer for PDF generation is often not production ready. Problems include: huge PDF size, no interactive PDF (images not text), no clickable links, and you cannot control pagination without trial and error. It requires two threads per user." [DEV Community - Puppeteer PDFs](https://dev.to/jordykoppen/turning-react-apps-into-pdfs-with-nextjs-nodejs-and-puppeteer-mfi)

#### Phase to Address
- **Phase 1 (Foundation):** Choose library, build basic template structure
- **Phase 3 (Reports):** Full PDF system with templates, branding, photo layouts

---

### Photo Handling

**The Core Problem:** Inspectors take many photos in the field. Photos are large (3MB+ from modern phones), upload over spotty cellular, need to sync offline, and storage costs compound quickly.

#### Warning Signs
- No client-side compression before upload
- Storing full-resolution photos when thumbnails suffice for most uses
- Single S3 bucket for originals and processed (causes Lambda recursion disaster)
- Not accounting for storage costs at scale
- Assuming uploads work reliably on mobile networks

#### Cost Math
| Scenario | Monthly Photos | Raw Size | Storage Cost | Bandwidth Cost |
|----------|---------------|----------|--------------|----------------|
| 10 inspectors, 50 photos/day | 15,000 | 45GB | ~$1 | ~$4 |
| 100 inspectors, 50 photos/day | 150,000 | 450GB | ~$10 | ~$40 |
| 500 inspectors, 50 photos/day | 750,000 | 2.25TB | ~$50 | ~$200 |

*Costs assume S3 standard pricing and typical egress. Actual costs vary.*

#### Prevention Strategy
1. **Compress on device before upload** - Use Canvas API to convert to WebP, target 200-500KB
2. **Generate thumbnails server-side** - Lambda trigger on S3 upload
3. **Use separate buckets** - Originals and processed, prevents Lambda recursion
4. **Implement chunked/resumable uploads** - TUS protocol or similar for large files
5. **Store photo metadata in DB, files in S3** - Never store binary in Postgres
6. **Plan for CDN** - CloudFront for delivery, reduces origin costs
7. **Consider progressive upload** - Upload low-res immediately, full-res when on WiFi

#### Compression Strategy
```
Field photo (iPhone): ~3MB JPEG
After WebP conversion + resize: ~200KB
Savings: 93%
```

"By shrinking and compressing images to around 10KB-200KB, you can reduce data out charges from 40GB/day to around 100MB/day." [DEV Community - S3 Image Compression](https://dev.to/aarongarvey/size-matters-image-compression-with-lambda-and-s3-40bf)

#### Lambda Recursion Warning
"If you store compressed images in the same bucket and don't configure the trigger properly, you might cause the Lambda function to be triggered recursively---Lambda will get triggered by the image it itself created over and over again. This may skyrocket your costs to an insane level." [Medium - S3 Lambda](https://medium.com/@aashari/resizing-and-optimize-images-uploaded-to-s3-using-aws-lambda-d23ebaa27b5)

#### Phase to Address
- **Phase 2 (Inspector PWA):** Upload flow with client compression
- **Phase 3 (Reports):** Photo storage optimization, CDN setup

---

### Real-time Sync

**The Core Problem:** Supabase Realtime is convenient but has gotchas that surface at scale or in production conditions (extended browser sessions, tab switching, mobile backgrounding).

#### Warning Signs
- Not handling subscription termination/reconnection
- Using Postgres Changes when Broadcast would scale better
- Multiple subscriptions to same channel (memory leaks)
- Not filtering realtime subscriptions (overloads connections)
- Assuming subscriptions persist through device sleep/wake

#### Common Supabase Realtime Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| Subscription dies after laptop lid close | Connection CLOSED but status not updated | Manually call `supabase.realtime.disconnect()` on status change |
| Channel Already Subscribed error | Subscribing without checking existing | Track subscription state, unsubscribe before resubscribe |
| Data delays | Not using indexes on filtered columns | Index tenant_id, user_id columns |
| Memory leaks | Not unsubscribing on component unmount | useEffect cleanup, subscription management |

#### Prevention Strategy
1. **Use Broadcast over Postgres Changes for scale** - Official Supabase recommendation
2. **Implement subscription lifecycle management** - Init on mount, cleanup on unmount
3. **Build reconnection logic** - Detect disconnection, auto-reconnect with backoff
4. **Filter subscriptions** - Never subscribe to all changes on a table
5. **Monitor peak connections** - $10/1000 peak connections adds up
6. **Plan for stale data** - Always have manual refresh option

#### Pricing Awareness
- $2.50 per 1 million messages
- $10 per 1,000 peak connections
- At scale, this adds up quickly for always-on dashboards

#### Phase to Address
- **Phase 1 (Foundation):** Basic realtime setup with proper lifecycle
- **Phase 4+ (Dashboard):** Optimized subscription management at scale

---

## Business Pitfalls

### Pricing

**The Core Problem:** Pricing for luxury market requires different strategy than mass-market SaaS. Most founders underprice, leave money on table, and attract wrong customers.

#### Warning Signs
- Setting price based on costs, not value delivered
- Single pricing tier (no room for upselling)
- Matching competitor prices (race to bottom)
- Not testing pricing with actual customers
- Discounting to close deals (destroys LTV)

#### Luxury Market Pricing Principles
| Principle | Explanation |
|-----------|-------------|
| Price on value, not cost | A report that prevents $50K in missed maintenance is worth more than $50/month |
| Fewer customers, higher ARPU | 100 customers at $500/month > 1000 at $50/month |
| Do not discount | Discounting reduces LTV by 30%+ and attracts price-sensitive churn risks |
| Charge for premium features | White-label reports, priority support, custom integrations |

#### Prevention Strategy
1. **Research competitor pricing thoroughly** - Spectora, HomeGauge, iAuditor pricing tiers
2. **Interview target customers about willingness to pay** - Before building
3. **Start higher than comfortable** - Easier to lower than raise
4. **Build pricing tiers from day one** - Even if only one tier at launch
5. **A/B test pricing on landing page** - Before any code
6. **Plan annual pricing** - 20% discount for annual vs monthly

#### Common Mistake: Treating Pricing as Afterthought
"A statistically small number of companies spend even a day's worth of time on their pricing strategy. Even up to the IPO stage, most pricing decision-makers are blindfolding themselves and throwing a dart." [Dock.us - SaaS Pricing](https://www.dock.us/library/saas-pricing-strategy)

#### Phase to Address
- **Pre-development:** Customer interviews, competitor analysis
- **Phase 1 (Foundation):** Pricing page, Stripe tiers configured

---

### Feature Scope

**The Core Problem:** Property inspection software has many "table stakes" features. Trying to build everything in v1 leads to either shipping nothing or shipping mediocrity.

#### Warning Signs
- Feature list keeps growing before v1 ships
- "We need feature parity with [competitor]" thinking
- Building integrations before core is solid
- Adding "one more thing" delays every milestone
- No clear definition of MVP vs v2 vs v3

#### Table Stakes vs Differentiators for Home Care OS
| Table Stakes (Must Have v1) | Differentiators (v1.5+) | Anti-Features (Never Build) |
|-----------------------------|-------------------------|----------------------------|
| Inspection checklists | AI-generated summaries | Built-in accounting |
| Photo capture + annotation | Predictive maintenance alerts | Property purchasing tools |
| PDF report generation | White-label client portal | General project management |
| Basic scheduling | Seasonal care recommendations | CRM features |
| Client management | Multi-property analytics | Marketing automation |

#### Prevention Strategy
1. **Define MVP ruthlessly** - What is the smallest product someone would pay for?
2. **Sequence features by dependency** - Build foundation before fancy
3. **Set scope freeze dates** - No new features after X date until launch
4. **Build admin tools last** - Operators can use SQL/Supabase dashboard initially
5. **Say no to integrations v1** - Every integration is a support burden
6. **Launch ugly, iterate pretty** - Internal tools do not need to be beautiful

#### Real Insight from Inspection Software Industry
"80 percent of inspectors who fail do so because of poor marketing, not poor software. 15% fail because of bad inspections." [Working RE](https://www.workingre.com/why-home-inspectors-fail-or-succeed/) - This suggests focusing on core inspection quality over feature breadth.

#### Phase to Address
- **Pre-development:** Define MVP scope, park everything else
- **Every phase:** Resist scope creep, maintain backlog discipline

---

### Target Market

**The Core Problem:** "Luxury home care" is a niche within a niche. Being too broad (all property management) or too narrow (only $10M+ homes) can doom the product.

#### Warning Signs
- Cannot describe ideal customer in one sentence
- Marketing materials try to appeal to everyone
- Feature requests from non-target customers drive roadmap
- Pricing does not match target market expectations
- Cannot find 10 potential customers to interview

#### Market Positioning Risks
| Risk | Symptom | Mitigation |
|------|---------|------------|
| Too narrow | Cannot find enough customers | Expand to adjacent segments (vacation homes, property managers) |
| Too broad | Features pulled in conflicting directions | Ruthlessly ignore non-target feedback |
| Wrong segment | High churn, price sensitivity | Revisit customer discovery |
| Undifferentiated | "Why not use Spectora?" | Lean into luxury-specific features |

#### Prevention Strategy
1. **Define ICP with specifics** - "Property managers of 5-20 luxury homes ($500K+) in HCOL markets"
2. **Interview 20+ potential customers before building** - Validate problem exists
3. **Identify 3 luxury-specific needs** - What do they need that HomeGauge does not provide?
4. **Build for the niche, not the mass market** - Luxury means premium experience everywhere
5. **Plan expansion path** - Luxury -> High-end -> General (not reverse)

#### Luxury-Specific Opportunities
- **Concierge-style reports** - Not just findings, but recommendations
- **Seasonal care programs** - Proactive, not reactive
- **Professional aesthetics** - Reports that match the property quality
- **Multi-property dashboards** - Wealthy clients have multiple homes
- **Trusted vendor networks** - Curated contractor recommendations

#### Phase to Address
- **Pre-development:** Customer discovery, ICP definition
- **Phase 1:** Build for one specific persona first

---

## UX Pitfalls

### Inspector App

**The Core Problem:** Inspectors are in the field, often in poor lighting, wearing gloves, with phones in one hand. The app must work under these conditions, not just on a developer's desk.

#### Warning Signs
- Designing for desktop-first, then "making it responsive"
- Small touch targets (buttons smaller than 44x44px)
- Complex forms with many fields per screen
- Not testing in actual field conditions
- Requiring precise gestures (pinch, swipe) for core actions
- No offline indication or sync status

#### Field-Specific UX Requirements
| Requirement | Reason | Implementation |
|-------------|--------|----------------|
| Large touch targets (48px+) | Gloves, one-handed use | Minimum 48x48px buttons |
| High contrast | Bright sunlight | Test in direct sunlight |
| Minimal typing | Error-prone in field | Dropdowns, checkboxes, voice notes |
| Clear sync status | Trust that data is saved | Prominent sync indicator |
| Offline-first design | Cellular dead spots | Queue actions, sync when connected |
| Photo-centric workflow | Photos are primary evidence | Camera as core navigation element |

#### Prevention Strategy
1. **Test on real devices in real conditions** - Outside, in sunlight, one-handed
2. **Design mobile-first, not responsive** - Different UI for mobile, not squeezed desktop
3. **Minimize text input** - Every text field is a friction point in the field
4. **Make camera access one tap** - Most common action should be fastest
5. **Show save/sync status constantly** - Inspectors need confidence data is not lost
6. **Support landscape and portrait** - Inspectors hold phones differently
7. **Allow quick issue logging** - Pre-built issue templates, not blank forms

#### Cognitive Load in Field Work
"Cognitive load---the mental effort required to operate the application---is a key usability attribute. In field conditions, cognitive load tolerance is much lower than at a desk." [arXiv Mobile Usability](https://arxiv.org/html/2502.05120v2)

#### Phase to Address
- **Phase 2 (Inspector PWA):** Primary UX focus
- **Pre-Phase 2:** Field observation with paper-based inspectors

---

### Client Portal

**The Core Problem:** Clients are not inspectors. They want to see their property status, understand findings, and take action---not navigate inspection software.

#### Warning Signs
- Showing clients the same interface as inspectors
- Jargon-heavy labels ("RH-23: HVAC Filtration Deficiency")
- Burying important information in reports
- No clear calls-to-action
- Requiring login for every interaction

#### Client Portal Priorities
| Feature | Client Need | Common Mistake |
|---------|-------------|----------------|
| Property overview | "Is my property OK?" | Showing all data, not summary |
| Report access | "What did you find?" | PDF-only, no web summary |
| Action items | "What should I do?" | No prioritization of issues |
| Service scheduling | "Fix this problem" | Requiring phone calls |
| Payment | "Pay my invoice" | Complex billing portal |

#### Prevention Strategy
1. **Design separate client experience** - Not "inspector minus features"
2. **Lead with status, not data** - "All good" / "3 items need attention"
3. **Translate findings to plain language** - Not inspection codes
4. **Minimize required actions** - Most clients want to view, not do
5. **Magic links over passwords** - Reduce friction for infrequent users
6. **Mobile-first client portal** - Clients check on phones

#### Phase to Address
- **Phase 4+ (Client Portal):** Dedicated design phase
- **Phase 1:** Plan data model to support client-friendly views

---

### Admin Dashboard

**The Core Problem:** Admins (property managers, company owners) have different needs than inspectors or clients. Building one dashboard for all roles leads to confusion.

#### Warning Signs
- Same navigation for all user types
- Showing inspectors admin-level data
- Complex permission systems that are hard to understand
- Building admin features before core product
- Over-engineering dashboard before having real usage data

#### Prevention Strategy
1. **Delay admin dashboard** - Use Supabase Studio / SQL for v1 admin needs
2. **Role-based navigation** - Different nav for different roles, not permission-hidden items
3. **Start with reports, not real-time** - Admins need weekly/monthly views, not live data
4. **Build what you observe** - Watch how early admins use the product, then optimize

#### Phase to Address
- **Phase 5+ (Admin):** After core workflows validated
- **Phase 1-4:** Manual admin via Supabase dashboard

---

## Architecture Pitfalls

### Multi-tenant

**The Core Problem:** Supabase RLS is powerful but unforgiving. A single missing policy exposes all tenant data. A poorly designed policy tanks performance.

#### Warning Signs
- Developing without RLS enabled ("we'll add it later")
- Using `USING (true)` policies during development
- No automated RLS policy testing
- Storing tenant_id in user_metadata (user-modifiable!)
- Complex JOIN policies without indexes
- Not understanding the auth.uid() vs tenant_id distinction

#### Critical Mistakes to Avoid
| Mistake | Impact | Prevention |
|---------|--------|------------|
| RLS disabled in dev | Forget to enable in prod, data breach | Enable RLS from day one |
| `USING (true)` policies | Every user sees all data | Never use, even temporarily |
| tenant_id in user_metadata | Users can modify their tenant | Store in app_metadata only |
| No index on tenant_id | Every query full table scans | Index tenant_id on all tables |
| Service role key in client | Bypasses all RLS | Server-side only |

#### Prevention Strategy
1. **Enable RLS on every table immediately** - No exceptions
2. **Store tenant_id in app_metadata** - Cannot be user-modified
3. **Create index on tenant_id for every table** - Performance critical
4. **Write RLS policy tests** - Automated tests that verify isolation
5. **Use row-level audit logging** - Track who accessed what
6. **Review RLS policies in code review** - Security-critical code

#### RLS Performance Pattern
```sql
-- BAD: Subquery per row
CREATE POLICY "tenant_isolation" ON inspections
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- GOOD: Direct comparison with app_metadata
CREATE POLICY "tenant_isolation" ON inspections
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
```

"Using a `tenants_to_users` table for lookups in RLS policies would incur an additional SELECT for every query you execute. Avoid this by storing `tenant_id` on the User's `app_metadata`." [Arda Beyazoglu - Supabase Multi-tenancy](https://arda.beyazoglu.com/supabase-multi-tenancy)

#### Phase to Address
- **Phase 1 (Foundation):** RLS architecture, tenant model
- **Every phase:** RLS policy for every new table

---

### Scaling

**The Core Problem:** Early architectural decisions create scaling ceilings. Some are easy to fix later; others require rewrites.

#### Warning Signs
- N+1 queries everywhere
- No pagination on list endpoints
- Real-time subscriptions without filtering
- Large images served without CDN
- No caching strategy
- Synchronous PDF generation in request handlers

#### Scaling Ceilings by Component
| Component | Ceiling | Fix Difficulty | Prevention |
|-----------|---------|----------------|------------|
| Postgres without indexes | ~10K rows | Easy | Add indexes from start |
| No pagination | ~100 items per page | Medium | Always paginate |
| Real-time without filters | ~100 connections | Medium | Filter subscriptions |
| No CDN for assets | ~1000 concurrent | Easy | Use CloudFront from start |
| Sync PDF generation | ~10 concurrent | Hard | Background job queue |
| Single region | Latency for distant users | Hard | Design for multi-region |

#### Prevention Strategy
1. **Paginate everything from day one** - Even if list has 5 items
2. **Index foreign keys and filter columns** - tenant_id, user_id, created_at
3. **Use background jobs for slow operations** - PDF generation, bulk operations
4. **Implement caching layer design** - Even if not used initially
5. **Monitor query performance early** - Supabase dashboard shows slow queries
6. **Load test before launch** - 10x expected traffic

#### Phase to Address
- **Phase 1 (Foundation):** Pagination, indexes, job queue architecture
- **Phase 3+:** CDN, caching, performance optimization

---

### Data Model

**The Core Problem:** Inspection data is hierarchical (Property -> Inspection -> Section -> Finding -> Photo). Wrong data model makes queries painful and sync complex.

#### Warning Signs
- Flat tables with JSON blobs for nested data
- No version tracking for sync
- Missing timestamps (created_at, updated_at)
- No soft delete (deleted_at)
- Inspection templates not separated from instances

#### Data Model Principles for Inspection Software
| Principle | Reason | Implementation |
|-----------|--------|----------------|
| Separate templates from instances | Templates evolve, instances are snapshots | inspection_templates, inspections tables |
| Track versions for sync | Offline conflict resolution | version, updated_at on all tables |
| Soft delete everything | Audit trail, undo capability | deleted_at nullable timestamp |
| Normalize to 3NF, then denormalize reads | Write consistency, read performance | Views or materialized views for reports |
| Store photo references, not photos | Binary in Postgres is disaster | photo_url pointing to S3 |

#### Prevention Strategy
1. **Design data model before coding** - Schema review with sync in mind
2. **Add sync metadata to all tables** - version, updated_at, device_id
3. **Use UUIDs for offline creation** - Client can generate IDs
4. **Plan for template evolution** - Separate template definition from inspection data
5. **Include audit fields everywhere** - created_at, updated_at, created_by

#### Phase to Address
- **Phase 1 (Foundation):** Core data model design
- **Pre-Phase 1:** Data model design review

---

## Integration Pitfalls

### Stripe

**The Core Problem:** Stripe is well-documented but subscription billing has many edge cases. Webhooks are critical and easy to get wrong.

#### Warning Signs
- Duplicating Stripe data in your database
- Not implementing webhook signature verification
- Not handling subscription state changes
- Assuming webhook delivery order
- Not using test mode clocks for subscription testing

#### Common Stripe Mistakes
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Storing subscription status locally | Out of sync with Stripe | Query Stripe or trust webhooks |
| Ignoring failed payments | Customers get free access | Handle `invoice.payment_failed` |
| No webhook retry handling | Duplicate subscription events | Idempotent handlers with event ID |
| Not testing renewal | Breaks in production after 30 days | Use test clocks |
| Hard-coded prices | Cannot change pricing | Use Stripe Price objects |

#### Prevention Strategy
1. **Trust Stripe as source of truth** - Minimal local subscription data
2. **Implement all subscription webhooks** - invoice.paid, payment_failed, subscription.updated, etc.
3. **Verify webhook signatures** - Security critical
4. **Use test clocks** - Test full subscription lifecycle before launch
5. **Handle dunning (failed payments)** - Grace period, not immediate cutoff
6. **Log all webhook events** - Debug production issues

#### Stripe Webhook Priority
| Webhook | Priority | Use |
|---------|----------|-----|
| checkout.session.completed | MUST | New subscription |
| invoice.paid | MUST | Renewal confirmation |
| invoice.payment_failed | MUST | Dunning flow trigger |
| customer.subscription.updated | SHOULD | Plan changes |
| customer.subscription.deleted | MUST | Churn handling |

"A common mistake developers make is unnecessarily duplicating data that was already available in Stripe. Simplifying it down to an `isSubscribed` field greatly reduced code and bugs." [Medium - Stripe Subscriptions](https://medium.com/@mustafaturan/stripe-subscription-notes-from-a-first-time-saas-builder-d2034f5d0006)

#### Phase to Address
- **Phase 1 (Foundation):** Basic Stripe setup, checkout flow
- **Phase 4+ (Billing):** Full subscription management, dunning

---

### Email/SMS

**The Core Problem:** Transactional email deliverability is not guaranteed. Emails land in spam, SMS fails silently, and users blame your product.

#### Warning Signs
- No email deliverability monitoring
- Using shared IP for high-volume sending
- No DMARC/DKIM/SPF configuration
- Sending from noreply@ addresses
- Not testing across email providers (Gmail, Outlook, Yahoo)

#### Resend-Specific Considerations
| Feature | Status | Note |
|---------|--------|------|
| Developer experience | Excellent | Modern API, React Email support |
| Deliverability tools | Basic | Less advanced than established ESPs |
| Dedicated IPs | Scale plan only | Shared IP reputation risk on lower tiers |
| Scaling pricing | Expensive at volume | Compare to Postmark/SendGrid for high volume |

#### Prevention Strategy
1. **Configure DMARC/DKIM/SPF from day one** - Required by Gmail/Yahoo as of 2024
2. **Disable click tracking for auth emails** - Can trigger spam filters
3. **Test across email providers** - Gmail, Outlook, Apple Mail, Yahoo
4. **Monitor deliverability metrics** - Bounce rate, spam complaints
5. **Plan for dedicated IP at scale** - Shared IP reputation is risk
6. **Implement email verification for user signups** - Reduces bounces

#### Phase to Address
- **Phase 1 (Foundation):** Basic transactional email (auth, welcome)
- **Phase 4+ (Notifications):** Full notification system, deliverability optimization

---

### AI (Claude API)

**The Core Problem:** LLM APIs have rate limits, variable latency, and costs that scale with usage. Uncontrolled usage leads to cost overruns and service degradation.

#### Warning Signs
- No rate limit handling
- Synchronous AI calls in request handlers
- No cost monitoring or alerts
- Unbounded input (users can submit massive prompts)
- No fallback when API is unavailable
- Using most expensive model for all tasks

#### Claude API Constraints (2025)
| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Rate limits (requests/min) | 429 errors during traffic spikes | Implement queue with backoff |
| Token costs | Unbounded costs if not limited | Set max_tokens, monitor usage |
| Variable latency | Bad UX for real-time features | Background jobs, streaming |
| Weekly caps (as of Aug 2025) | Hard ceiling on usage | Monitor, plan for limits |
| Context window costs | Large inputs expensive | Summarize/truncate inputs |

#### Prevention Strategy
1. **Background jobs for AI features** - Never block HTTP requests on AI calls
2. **Implement exponential backoff** - Handle 429 errors gracefully
3. **Set max_tokens on all requests** - Prevent runaway costs
4. **Monitor costs weekly** - Alerts before budget exceeded
5. **Use appropriate model** - Haiku for simple tasks, Sonnet for complex
6. **Cache AI responses** - Same input should not regenerate
7. **Implement fallbacks** - Degrade gracefully when API unavailable

#### Cost Control
"Set max_tokens parameters between 2,000-15,000 for most code generation tasks to control costs effectively. Mid-size organizations (50 developers) average $3,000/month without controls." [TrueFoundry - Claude Limits](https://www.truefoundry.com/blog/claude-code-limits-explained)

#### Phase to Address
- **Phase 1 (Foundation):** API client setup with rate limiting
- **Phase 3+ (AI Features):** Full AI integration with cost controls

---

## Priority Matrix

### Highest Risk / Highest Impact (Address First)
| Pitfall | Risk | Impact | Phase |
|---------|------|--------|-------|
| iOS PWA storage limits | HIGH | Inspector app unusable | Phase 2 |
| RLS misconfiguration | HIGH | Data breach | Phase 1 |
| PDF library choice | HIGH | Core value prop broken | Phase 1 |
| Offline conflict resolution | HIGH | Data loss | Phase 2 |

### Medium Risk / High Impact (Address Early)
| Pitfall | Risk | Impact | Phase |
|---------|------|--------|-------|
| Photo storage costs | MEDIUM | Cost overrun | Phase 2-3 |
| Pricing strategy | MEDIUM | Business failure | Pre-dev |
| Claude API rate limits | MEDIUM | Feature degradation | Phase 3+ |
| Stripe webhook handling | MEDIUM | Revenue loss | Phase 1 |

### Lower Risk / Still Important (Address When Relevant)
| Pitfall | Risk | Impact | Phase |
|---------|------|--------|-------|
| Admin dashboard complexity | LOW | Internal friction | Phase 5+ |
| Email deliverability | LOW | User frustration | Phase 4+ |
| Real-time subscription leaks | LOW | Performance issues | Phase 4+ |
| Feature scope creep | MEDIUM | Delayed launch | Every phase |

---

## Sources

### Primary (HIGH Confidence)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Subscription Integration Docs](https://docs.stripe.com/billing/subscriptions/build-subscriptions)
- [MDN PWA Offline Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [@react-pdf/renderer Documentation](https://react-pdf.org/)

### Secondary (MEDIUM Confidence)
- [MagicBell PWA iOS Limitations Guide](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [Brainhub PWA on iOS 2025](https://brainhub.eu/library/pwa-on-ios)
- [GTC Sys PWA Offline-First Strategies](https://gtcsys.com/comprehensive-faqs-guide-data-synchronization-in-pwas-offline-first-strategies-and-conflict-resolution/)
- [AntStack Multi-tenant RLS](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [Leanware Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [DEV Community S3 Image Compression](https://dev.to/aarongarvey/size-matters-image-compression-with-lambda-and-s3-40bf)
- [LogRocket React PDF Generation](https://blog.logrocket.com/generating-pdfs-react/)
- [Dock.us SaaS Pricing Strategy](https://www.dock.us/library/saas-pricing-strategy)
- [TrueFoundry Claude Code Limits](https://www.truefoundry.com/blog/claude-code-limits-explained)

### Tertiary (LOW Confidence - Community Sources)
- [Medium Stripe Subscription Notes](https://medium.com/@mustafaturan/stripe-subscription-notes-from-a-first-time-saas-builder-d2034f5d0006)
- [Reddit/HN discussions on inspection software UX](https://www.workingre.com/why-home-inspectors-fail-or-succeed/)
- [arXiv Mobile Usability Research](https://arxiv.org/html/2502.05120v2)

---

## Metadata

**Research Confidence:**
- Technical pitfalls (offline, PDF, photos): HIGH - Multiple authoritative sources, documented limitations
- Business pitfalls (pricing, scope): MEDIUM - Synthesized from general SaaS sources, not domain-specific postmortems
- UX pitfalls: MEDIUM - General mobile UX research applied to field inspection context
- Architecture pitfalls: HIGH - Supabase official docs, well-documented patterns
- Integration pitfalls: HIGH - Official docs for Stripe, Claude API

**Research Date:** 2026-01-19
**Valid Until:** ~30 days for technical specifics, ~90 days for architectural patterns
