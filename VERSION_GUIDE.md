# Version Tracking System

## Overview
The version number is displayed in the left sidebar, below the navigation items. This helps track changes and deployments.

## Location
- **Display:** Left sidebar, bottom section (below Settings, above Collapse button)
- **File:** `apps/admin/public/version.json`
- **Component:** `apps/admin/src/components/layout/version-display.tsx`

## Version Format
- **Version:** Semantic versioning (e.g., 1.0.0)
- **Build:** Auto-incrementing build number
- **Display:** Shows as "v1.0.0" with "Build 123" underneath

## Usage

### View Current Version
```bash
npm run version:show
```

### Increment Build Number
```bash
# Without message
npm run version:bump

# With changelog message
npm run version:bump "Fixed login bug"
```

### Set New Version
```bash
npm run version:set 1.2.0
```

### Recommended Workflow

**Before committing changes:**
```bash
npm run version:bump "Your change description"
git add -A
git commit -m "Your commit message"
git push
```

**For major releases:**
```bash
npm run version:set 2.0.0
npm run version:bump "Major release with new features"
```

## What Gets Tracked

The `version.json` file contains:
- `version`: Current semantic version (1.0.0)
- `build`: Auto-incrementing build number
- `lastUpdated`: ISO timestamp of last update
- `changelog`: Last 20 version updates with messages

## Verification

After pushing to GitHub, you can:
1. Check the version number in the sidebar on localhost
2. Run `npm run version:show` to see current version
3. Compare build numbers before/after changes to verify updates were made

## Example Session

```bash
# Start work
npm run version:show
# Output: v1.0.0, Build 5

# Make changes to code...

# Bump version before commit
npm run version:bump "Added user dashboard"
# Output: ✓ Version updated: v1.0.0 (Build 6)

# Commit and push
git add -A && git commit -m "Add user dashboard" && git push

# Verify in app - sidebar now shows Build 6
```
