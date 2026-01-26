# Phase 5: Self-Service Plan Editor

## Status: COMPLETE

## Objective
Build self-service plan editor allowing clients to modify their service plans with live pricing.

## What Was Built

### 1. PlanEditor Component
`components/portal/plan-editor/plan-editor.tsx`

**Features:**
- Inspection frequency selector (annual to bi-weekly)
- Add-on service toggles:
  - Digital Home Manual
  - Warranty Tracking
  - Emergency Response
  - Hurricane Monitoring
- Live pricing calculator with 20% builder markup
- Current vs Proposed price comparison
- Price difference indicator (increase/decrease)
- Breakdown of fees (base, tier, addons)
- Confirmation dialog before saving
- Immediate effect messaging

**Pricing Logic:**
```typescript
// 20% builder markup applied to all pricing
const BUILDER_MARKUP = 0.20

const proposedPricing = {
  baseFee: base.baseFee * (1 + BUILDER_MARKUP),
  tierFee: base.tierFee * (1 + BUILDER_MARKUP),
  addonsFee: base.addonsFee * (1 + BUILDER_MARKUP),
  monthlyTotal: base.monthlyTotal * (1 + BUILDER_MARKUP),
}
```

### 2. Updated Plans Page
`pages/portal/plans/index.tsx`

**Changes:**
- Added "Edit Plan" button to each property card
- Integrated Sheet/Drawer for plan editing
- Connected to `usePropertyProgram` hook for full program data
- Automatic refetch after save

### 3. Integration Points
- Uses existing `usePricingConfig` hook for price configuration
- Uses existing `calculateProgramPrice` function
- Uses existing `useUpdateProgram` mutation
- Triggers invoice creation for plan upgrades

## User Flow

1. Client navigates to `/portal/plans`
2. Clicks "Edit Plan" on a property
3. Sheet opens with current plan settings
4. Client modifies frequency or toggles addons
5. Live pricing updates show:
   - Current monthly cost
   - New monthly cost
   - Difference (+ or -)
   - Fee breakdown
6. Client clicks "Save Changes"
7. Confirmation dialog shows summary
8. Client confirms → changes saved immediately
9. Sheet closes, list refreshes

## Files Created/Modified

**Created:**
- `components/portal/plan-editor/plan-editor.tsx` (230 lines)
- `components/portal/plan-editor/index.ts`

**Modified:**
- `pages/portal/plans/index.tsx` (added edit functionality)

## Success Criteria Met

- [x] Client can view current plan settings
- [x] Client can toggle features (addons)
- [x] Client can change inspection frequency
- [x] Price updates instantly as options change
- [x] 20% builder markup included in pricing
- [x] Current vs proposed comparison visible
- [x] Confirmation before save
- [x] Changes take effect immediately
