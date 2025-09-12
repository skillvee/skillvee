# SkillVee Design System - Shadcn Theme Standards

## Overview
This document defines the standardized design approach for SkillVee using the installed shadcn theme from TweakCN.

## Color Palette (OKLCH)

### Primary Colors
- **Primary**: `hsl(var(--primary))` - Main brand color (purple-blue)
- **Primary Foreground**: `hsl(var(--primary-foreground))` - Text on primary
- **Secondary**: `hsl(var(--secondary))` - Supporting color
- **Accent**: `hsl(var(--accent))` - Highlight color

### Semantic Colors
- **Background**: `hsl(var(--background))` - Page background
- **Foreground**: `hsl(var(--foreground))` - Primary text
- **Muted**: `hsl(var(--muted))` - Subdued backgrounds
- **Muted Foreground**: `hsl(var(--muted-foreground))` - Secondary text
- **Border**: `hsl(var(--border))` - Borders and dividers
- **Input**: `hsl(var(--input))` - Input field borders

### Status Colors
- **Destructive**: `hsl(var(--destructive))` - Error/danger
- **Destructive Foreground**: `hsl(var(--destructive-foreground))` - Error text

## Typography

### Font Families
```css
--font-sans: Inter, sans-serif
--font-serif: Source Serif 4, ui-serif, serif
--font-mono: JetBrains Mono, monospace
```

### Letter Spacing
```css
--tracking-tighter: calc(var(--tracking-normal) - 0.05em)
--tracking-tight: calc(var(--tracking-normal) - 0.025em)
--tracking-normal: 0em
--tracking-wide: calc(var(--tracking-normal) + 0.025em)
--tracking-wider: calc(var(--tracking-normal) + 0.05em)
--tracking-widest: calc(var(--tracking-normal) + 0.1em)
```

## Design Tokens

### Border Radius
- **Standard**: `--radius: 0.375rem` (6px)
- **Usage**: Use `rounded-md` for standard radius

### Spacing
- **Base Unit**: `--spacing: 0.25rem` (4px)
- **Consistent spacing scale**: 4px, 8px, 12px, 16px, 20px, 24px, etc.

### Shadows
```css
--shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05)
--shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)
--shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)
--shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)
--shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)
--shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)
--shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25)
```

## Component Standards

### Cards
```tsx
// Standard Card
<Card className="rounded-md border shadow-sm">
  <CardContent className="p-6">
    Content here
  </CardContent>
</Card>

// Elevated Card
<Card className="rounded-md border shadow-md">
  <CardContent className="p-6">
    Content here
  </CardContent>
</Card>
```

### Buttons
```tsx
// Primary Button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary Button
<Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</Button>

// Outline Button
<Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
  Outline Action
</Button>
```

### Text Styles
```tsx
// Headings
<h1 className="text-3xl font-bold text-foreground">Main Heading</h1>
<h2 className="text-2xl font-semibold text-foreground">Section Heading</h2>
<h3 className="text-xl font-semibold text-foreground">Subsection</h3>

// Body Text
<p className="text-foreground">Primary body text</p>
<p className="text-muted-foreground">Secondary body text</p>

// Small Text
<span className="text-sm text-muted-foreground">Caption or helper text</span>
```

### Form Elements
```tsx
// Input
<Input className="bg-background border-input text-foreground" />

// Label
<Label className="text-sm font-medium text-foreground">Label Text</Label>

// Checkbox
<Checkbox className="border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
```

### Layout Components
```tsx
// Background containers
<div className="bg-background">Main content area</div>
<div className="bg-muted">Subtle background section</div>

// Borders and dividers
<div className="border-b border-border">Divider element</div>
<hr className="border-border" />
```

## Color Usage Guidelines

### DO ✅
- Use semantic color variables (`hsl(var(--primary))`) instead of hardcoded colors
- Maintain consistent contrast ratios with foreground/background pairs
- Use muted colors for secondary information
- Apply accent colors sparingly for highlights

### DON'T ❌
- Mix custom colors with the theme system
- Use hardcoded hex/rgb colors
- Override theme variables without purpose
- Use high contrast colors for non-critical elements

## Animation Standards
The theme includes custom animations:

```css
.animate-float         /* Subtle floating animation */
.animate-float-delayed /* Delayed floating animation */
.animate-bounce-slow   /* Slow bounce effect */
.animate-spin-slow     /* Slow rotation */
```

## Implementation Examples

### Navigation
```tsx
<nav className="bg-background border-b border-border">
  <div className="text-foreground">
    <Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
      Navigation Item
    </Button>
  </div>
</nav>
```

### Practice Results Cards (Current Implementation)
```tsx
<Card className={`
  relative cursor-pointer border transition-all duration-200 hover:shadow-lg rounded-xl
  ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 bg-card'}
`}>
  <CardContent className="p-6">
    <Icon className="w-8 h-8 text-primary mb-3" />
    <h3 className="font-bold text-foreground mb-1 text-lg">{title}</h3>
  </CardContent>
</Card>
```

## Accessibility
- All color combinations meet WCAG AA contrast requirements
- Focus states use the `--ring` color variable
- Interactive elements have proper hover/focus states

## Dark Mode Support
The theme automatically supports dark mode through CSS variables. No additional configuration needed.

---

**Remember**: Always use theme variables over hardcoded colors to maintain consistency and theme switching capabilities.