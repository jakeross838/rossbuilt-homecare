# Ross Built Construction Management - Styling Guide

## Color System

Use **semantic design tokens** for all colors. Never use direct color values like `bg-white`, `text-black`, or arbitrary values.

### Core Colors

| Token | Usage | Tailwind Class |
|-------|-------|----------------|
| `background` | Main page background | `bg-background` |
| `foreground` | Primary text color | `text-foreground` |
| `card` | Card/panel backgrounds | `bg-card` |
| `card-foreground` | Text on cards | `text-card-foreground` |
| `muted` | Subtle backgrounds | `bg-muted` |
| `muted-foreground` | Secondary/helper text | `text-muted-foreground` |

### Accent Colors

| Token | Usage | Tailwind Class |
|-------|-------|----------------|
| `primary` | Primary actions, CTAs, highlights | `bg-primary`, `text-primary` |
| `primary-foreground` | Text on primary backgrounds | `text-primary-foreground` |
| `accent` | Hover states, secondary highlights | `bg-accent` |
| `accent-foreground` | Text on accent backgrounds | `text-accent-foreground` |
| `destructive` | Errors, delete actions | `bg-destructive`, `text-destructive` |
| `destructive-foreground` | Text on destructive backgrounds | `text-destructive-foreground` |

### Borders & Inputs

| Token | Usage | Tailwind Class |
|-------|-------|----------------|
| `border` | Standard borders | `border-border` |
| `input` | Input field borders | `border-input` |
| `ring` | Focus ring color | `ring-ring` |

### Ross Built Brand Colors

Our color scheme is inspired by **rossbuilt.com** - a sophisticated, minimalist approach using clean black and white with subtle gray accents.

**Color Palette:**
- Primary: Deep black for text and primary actions
- Background: Pure white
- Neutral: Subtle grays for backgrounds and borders
- Accent: Light gray for hover states
- Total: 4 colors (black, white, light gray, medium gray)

**Design Philosophy:**
- Clean and minimalist
- High contrast for readability
- Timeless and professional
- Focus on content and typography
- Subtle borders and shadows

---

## Typography

We use the **Geist font family** for clean, modern readability.

### Font Families

```tsx
// Apply in layout.tsx (already configured)
font-sans  // Geist - for body text and UI
font-mono  // Geist Mono - for code/technical data
```

### Type Scale

| Element | Classes | Usage |
|---------|---------|-------|
| **Page Title** | `text-3xl font-bold` | Main page headings |
| **Section Title** | `text-2xl font-semibold` | Major sections |
| **Card Title** | `text-lg font-semibold` | Card headers |
| **Subsection** | `text-base font-medium` | Sub-headings |
| **Body Text** | `text-base` | Main content |
| **Small Text** | `text-sm text-muted-foreground` | Helper text, captions |
| **Tiny Text** | `text-xs text-muted-foreground` | Timestamps, labels |

### Line Height

Always use proper line-height for readability:
- Body text: `leading-relaxed` (1.625)
- Headings: `leading-tight` (1.25)
- Small text: `leading-normal` (1.5)

### Balance & Pretty Text

Use these utilities for better text rendering:
```tsx
<h1 className="text-3xl font-bold text-balance">Your Title Here</h1>
<p className="text-pretty">Your paragraph text here for optimal line breaks.</p>
```

---

## Layout Structure

### Layout Priority

Follow this hierarchy for layout decisions:

1. **Flexbox** (use for most layouts)
   ```tsx
   <div className="flex items-center justify-between gap-4">
   ```

2. **CSS Grid** (only for complex 2D layouts)
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
   ```

3. **Never use floats or absolute positioning** unless absolutely necessary

### Spacing Scale

Use Tailwind's spacing scale, never arbitrary values:

**Preferred:**
```tsx
<div className="p-6 space-y-4">  ✅
<div className="mx-4 my-8">       ✅
```

**Avoid:**
```tsx
<div className="p-[24px]">        ❌
<div className="mx-[16px]">       ❌
```

### Gap Over Margins

Prefer `gap` classes for spacing between items:

```tsx
// ✅ Good
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ❌ Avoid
<div className="flex">
  <div className="mr-4">Item 1</div>
  <div>Item 2</div>
</div>
```

### Responsive Design

Mobile-first approach using responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // Stacks on mobile, 2 columns on tablet, 3 columns on desktop
</div>
```

---

## Component Patterns

### Cards

Standard card pattern for construction software:

```tsx
<Card className="border-border hover:shadow-sm transition-shadow">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Project Name</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Additional details
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content here */}
  </CardContent>
</Card>
```

### Buttons

Button hierarchy for actions:

```tsx
// Primary action - black background
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Create Project
</Button>

// Secondary action - outlined
<Button variant="outline">
  Cancel
</Button>

// Destructive action
<Button variant="destructive">
  Delete
</Button>
```

### Status Badges

Consistent badge styling for project status:

```tsx
<Badge className="bg-primary text-primary-foreground">
  Active
</Badge>

<Badge variant="secondary">
  Pending
</Badge>

<Badge variant="destructive">
  Overdue
</Badge>
```

### Progress Indicators

Visual progress for construction projects:

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">Progress</span>
    <span className="font-medium">65%</span>
  </div>
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div 
      className="h-full bg-primary rounded-full transition-all" 
      style={{ width: '65%' }}
    />
  </div>
</div>
```

---

## Whitespace & Density

### Page Layout

```tsx
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-4 py-8">
    {/* Content with proper padding */}
  </div>
</div>
```

### Section Spacing

```tsx
<div className="space-y-6">  // Between major sections
  <section className="space-y-4">  // Within a section
    <h2>Section Title</h2>
    <div className="space-y-2">  // Between tightly related items
      {/* Items */}
    </div>
  </section>
</div>
```

---

## Border Radius

Use consistent border radius values:

```tsx
// Default radius (0.25rem - smaller for minimal aesthetic)
<Card className="rounded-lg">

// Small radius
<Badge className="rounded-md">

// Large radius
<div className="rounded-xl">
```

---

## Interactive States

### Hover States

```tsx
<Card className="hover:shadow-sm hover:border-foreground/10 transition-all">

<Button className="hover:bg-primary/90 transition-colors">
```

### Focus States

Focus rings are automatically applied via the design tokens:

```tsx
<input className="focus:ring-2 focus:ring-ring focus:ring-offset-2" />
```

---

## Accessibility

### Semantic HTML

Always use semantic elements:

```tsx
<main>       // Main content
<header>     // Page/section headers
<nav>        // Navigation
<article>    // Independent content
<section>    // Thematic grouping
```

### Screen Reader Only

```tsx
<span className="sr-only">Screen reader only text</span>
```

### Image Alt Text

Always include descriptive alt text:

```tsx
<img src="/photo.jpg" alt="Construction site progress at Ross Building Project" />
```

---

## Common Patterns

### Dashboard Stats Card

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Active Projects
    </CardTitle>
    <Briefcase className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">12</div>
    <p className="text-xs text-muted-foreground mt-1">
      +2 from last month
    </p>
  </CardContent>
</Card>
```

### Data Table Row

```tsx
<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
  <div className="space-y-1">
    <p className="font-medium">Project Name</p>
    <p className="text-sm text-muted-foreground">Location details</p>
  </div>
  <Badge>Status</Badge>
</div>
```

### Icon + Text Pattern

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <MapPin className="h-4 w-4" />
  <span>Denver, CO</span>
</div>
```

---

## Examples in Action

### Professional Project Card

```tsx
<Card className="hover:shadow-sm transition-shadow">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <CardTitle className="text-lg font-semibold">
          Downtown Office Complex
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Denver, CO</span>
        </div>
      </div>
      <Badge className="bg-primary text-primary-foreground">
        Active
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">65%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all" 
          style={{ width: '65%' }}
        />
      </div>
    </div>
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Dec 2025</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">8 members</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### Clean Stats Dashboard

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Total Projects
      </CardTitle>
      <Briefcase className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">24</div>
      <p className="text-xs text-muted-foreground mt-1">
        +3 from last month
      </p>
    </CardContent>
  </Card>
  {/* More stat cards... */}
</div>
```

---

This styling guide ensures consistency, professionalism, and accessibility across your entire construction management application.
