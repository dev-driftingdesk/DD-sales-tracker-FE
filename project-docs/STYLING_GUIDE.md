# Ceedpods Sky - Complete Styling Documentation

This comprehensive guide documents all styling patterns, design tokens, and UI conventions used in the Ceedpods Sky project. Use this as a reference when creating new projects with the same design system.

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography System](#typography-system)
3. [Spacing System](#spacing-system)
4. [Border Styles](#border-styles)
5. [Shadow Styles](#shadow-styles)
6. [Component Styling Patterns](#component-styling-patterns)
7. [Layout Patterns](#layout-patterns)
8. [Animation & Transitions](#animation--transitions)
9. [Responsive Design](#responsive-design)
10. [Special Effects](#special-effects)
11. [Utility Patterns](#utility-patterns)
12. [Tailwind Configuration](#tailwind-configuration)

## Color Palette

### Primary Brand Colors
```css
/* Teal/Cyan Family - Main brand colors */
--color-teal-600: #0D9488;     /* Primary brand color */
--color-teal-700: #0F766E;     /* Hover states */
--color-teal-500: #14B8A6;     /* Focus rings, accents */
--color-teal-100-20: rgba(204, 251, 241, 0.2); /* Light backgrounds */

/* Custom Teal Values */
--color-custom-teal: #0B5D6A;  /* Client/contractor UI */
--color-custom-teal-dark: #094552; /* Hover state */
--color-cyan-900: #06465C;     /* Dashboard gradients */
```

### Neutral Colors
```css
/* Gray Scale - Text and UI elements */
--color-gray-900: #111827;     /* Primary text */
--color-gray-700: #374151;     /* Secondary text */
--color-gray-600: #4B5563;     /* Labels, muted text */
--color-gray-500: #6B7280;     /* Placeholder text */
--color-gray-400: #9CA3AF;     /* Icons, very muted */
--color-gray-300: #D1D5DB;     /* Borders, dividers */
--color-gray-200: #E5E7EB;     /* Light borders */
--color-gray-100: #F3F4F6;     /* Hover backgrounds */
--color-gray-50: #F9FAFB;      /* Light backgrounds */
--color-white: #FFFFFF;        /* Primary backgrounds */
```

### Special Purpose Colors
```css
/* Navy */
--color-navy: #1e3a5f;         /* Earnings cards, special sections */

/* Light Blue */
--color-light-blue: #E8F4F8;   /* Dropdown backgrounds */

/* Blue Family */
--color-blue-600: #2563EB;     /* Icons, buttons */
--color-blue-500: #3B82F6;     /* Avatars, primary blue */
--color-blue-200: #BFDBFE;     /* Light borders */
--color-blue-100: #DBEAFE;     /* Timeline highlights */
--color-blue-50: #EFF6FF;      /* Table headers */
```

### Status/Semantic Colors
```css
/* Success - Green */
--color-green-600: #059669;     /* Success text */
--color-green-500: #10B981;     /* Success backgrounds */
--color-green-500-20: rgba(16, 185, 129, 0.2); /* Light success */
--color-green-400: #34D399;     /* Bright accents */
--color-green-100: #D1FAE5;     /* Light backgrounds */

/* Error/Danger - Red */
--color-red-500: #EF4444;       /* Error states */
--color-red-600: #DC2626;       /* Danger buttons */
--color-red-700: #B91C1C;       /* Danger hover */

/* Accent Colors */
--color-pink-400: #F472B6;      /* Special accents */
--color-yellow-400: #FACC15;    /* Gradient start */
--color-yellow-500: #EAB308;    /* Gradient end */
```

### Color Usage Patterns

#### Backgrounds
- **Primary**: `bg-white`
- **Secondary**: `bg-gray-50`
- **Cards**: `bg-white` with `border-gray-200`
- **Hover**: `bg-gray-100`
- **Selected**: `bg-teal-100/20`
- **Special**: `bg-[#1e3a5f]` (navy cards)

#### Text Colors
- **Primary**: `text-gray-900`
- **Secondary**: `text-gray-700`
- **Muted**: `text-gray-500`
- **Placeholder**: `text-gray-400`
- **Link**: `text-teal-600 hover:text-teal-700`
- **White**: `text-white` (on dark backgrounds)

## Typography System

### Font Family
Default Tailwind font stack with system fonts:
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
```

### Font Sizes
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }  /* Major headings */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* Values, stats */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }     /* Section headings */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }  /* Subsections */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* Card titles */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }    /* Default */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* UI text */
.text-xs { font-size: 0.75rem; line-height: 1rem; }     /* Small labels */
.text-[10px] { font-size: 10px; }                       /* Tiny text */
```

### Font Weights
```css
.font-bold { font-weight: 700; }      /* Major headings */
.font-semibold { font-weight: 600; }  /* Section titles */
.font-medium { font-weight: 500; }    /* Buttons, labels */
.font-normal { font-weight: 400; }    /* Body text */
```

### Typography Patterns

#### Headings
```html
<!-- Page Title -->
<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

<!-- Section Title -->
<h2 class="text-xl font-semibold text-gray-900">Recent Projects</h2>

<!-- Card Title -->
<h3 class="text-lg font-semibold text-gray-900">Project Name</h3>
```

#### Body Text
```html
<!-- Primary Text -->
<p class="text-sm text-gray-700">Description text...</p>

<!-- Muted Text -->
<p class="text-xs text-gray-500">Helper text...</p>

<!-- Label -->
<label class="text-sm font-medium text-gray-700">Field Label</label>
```

## Spacing System

### Padding Scale
```css
.p-1 { padding: 0.25rem; }    /* 4px - Minimal */
.p-2 { padding: 0.5rem; }     /* 8px - Very small */
.p-3 { padding: 0.75rem; }    /* 12px - Small */
.p-4 { padding: 1rem; }       /* 16px - Standard small */
.p-5 { padding: 1.25rem; }    /* 20px - Medium */
.p-6 { padding: 1.5rem; }     /* 24px - Standard */
.p-8 { padding: 2rem; }       /* 32px - Large */
```

### Common Padding Patterns
```css
/* Cards */
.card-small { @apply p-4; }
.card-medium { @apply p-5; }
.card-large { @apply p-6; }

/* Buttons */
.btn-small { @apply px-3 py-2; }
.btn-medium { @apply px-4 py-3; }
.btn-large { @apply px-6 py-4; }

/* Forms */
.input-default { @apply px-4 py-3; }

/* Modals */
.modal-header { @apply px-6 py-4; }
.modal-body { @apply px-6 py-6; }
```

### Margin Scale
```css
/* Bottom Margins - Most Common */
.mb-1 { margin-bottom: 0.25rem; }  /* 4px */
.mb-2 { margin-bottom: 0.5rem; }   /* 8px */
.mb-3 { margin-bottom: 0.75rem; }  /* 12px */
.mb-4 { margin-bottom: 1rem; }     /* 16px - Common */
.mb-6 { margin-bottom: 1.5rem; }   /* 24px - Common */
.mb-8 { margin-bottom: 2rem; }     /* 32px - Common */

/* Top Margins */
.mt-4 { margin-top: 1rem; }        /* 16px */
.mt-6 { margin-top: 1.5rem; }      /* 24px */
.mt-8 { margin-top: 2rem; }        /* 32px */
.mt-12 { margin-top: 3rem; }       /* 48px */
```

### Gap Scale (Flexbox/Grid)
```css
.gap-1 { gap: 0.25rem; }   /* 4px - Tight */
.gap-2 { gap: 0.5rem; }    /* 8px - Icon/text pairs */
.gap-3 { gap: 0.75rem; }   /* 12px - Small */
.gap-4 { gap: 1rem; }      /* 16px - Standard */
.gap-5 { gap: 1.25rem; }   /* 20px - Medium */
.gap-6 { gap: 1.5rem; }    /* 24px - Large */
.gap-7 { gap: 1.75rem; }   /* 28px - Extra large */
.gap-8 { gap: 2rem; }      /* 32px - Maximum */
```

## Border Styles

### Border Width
```css
.border { border-width: 1px; }    /* Default */
.border-2 { border-width: 2px; }  /* Avatars, focus states */
```

### Border Radius
```css
.rounded { border-radius: 0.25rem; }      /* 4px - Small */
.rounded-md { border-radius: 0.375rem; }  /* 6px - Medium */
.rounded-lg { border-radius: 0.5rem; }    /* 8px - Large (most common) */
.rounded-xl { border-radius: 0.75rem; }   /* 12px - Extra large */
.rounded-2xl { border-radius: 1rem; }     /* 16px - 2x large */
.rounded-full { border-radius: 9999px; }  /* Circular */
```

### Border Colors
```css
.border-gray-200    /* Default borders */
.border-gray-300    /* Stronger borders */
.border-gray-100    /* Subtle borders */
.border-white       /* White borders (overlapping avatars) */
.border-transparent /* Invisible borders */
```

### Border Patterns
```css
/* Card Border */
.card {
  @apply border border-gray-200 rounded-lg;
}

/* Input Border */
.input {
  @apply border border-gray-300 rounded-lg;
  @apply focus:ring-2 focus:ring-teal-600 focus:border-teal-600;
}

/* Divider */
.divider {
  @apply border-t border-gray-200;
}
```

## Shadow Styles

### Shadow Scale
```css
.shadow-sm { /* Subtle shadow */ }
.shadow    { /* Default shadow */ }
.shadow-md { /* Medium shadow - hover states */ }
.shadow-lg { /* Large shadow - dropdowns, modals */ }
.shadow-xl { /* Extra large - modal panels */ }
```

### Shadow Patterns
```css
/* Card Shadow */
.card {
  @apply shadow-sm hover:shadow-lg;
}

/* Dropdown Shadow */
.dropdown {
  @apply shadow-lg;
}

/* Modal Shadow */
.modal {
  @apply shadow-xl;
}
```

## Component Styling Patterns

### Buttons

#### Primary Button
```jsx
<button className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200">
  Click me
</button>
```

#### Secondary Button
```jsx
<button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-4 py-3 rounded-lg transition-all duration-200">
  Click me
</button>
```

#### Ghost Button
```jsx
<button className="bg-transparent hover:bg-gray-100 text-gray-700 font-medium px-4 py-3 rounded-lg transition-all duration-200">
  Click me
</button>
```

#### Danger Button
```jsx
<button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200">
  Delete
</button>
```

### Cards

#### Basic Card
```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Card content */}
</div>
```

#### Hover Card
```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
  {/* Card content */}
</div>
```

#### Special Card (Navy)
```jsx
<div className="bg-[#1e3a5f] rounded-lg p-6 text-white">
  {/* Card content */}
</div>
```

### Form Inputs

#### Text Input
```jsx
<input
  type="text"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
  placeholder="Enter text..."
/>
```

#### Error State
```jsx
<input
  type="text"
  className="w-full border border-red-500 rounded-lg px-4 py-3 text-sm text-gray-900"
/>
<p className="mt-1 text-xs text-red-500">Error message</p>
```

### Modals

#### Modal Structure
```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40" />

{/* Modal Panel */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Modal Title</h3>
    </div>
    
    {/* Content */}
    <div className="px-6 py-6">
      {/* Modal content */}
    </div>
    
    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
      {/* Actions */}
    </div>
  </div>
</div>
```

### Badges

#### Status Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
  Active
</span>
```

#### Count Badge
```jsx
<span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
  12
</span>
```

## Layout Patterns

### Grid Layouts

#### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

#### Dashboard Grid
```jsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 lg:col-span-8">
    {/* Main content */}
  </div>
  <div className="col-span-12 lg:col-span-4">
    {/* Sidebar */}
  </div>
</div>
```

### Flexbox Patterns

#### Header Pattern
```jsx
<header className="flex items-center justify-between p-6 border-b border-gray-200">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="...">Action</button>
</header>
```

#### Icon + Text
```jsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4 text-gray-500" />
  <span className="text-sm text-gray-700">Label</span>
</div>
```

#### Overlapping Avatars
```jsx
<div className="flex -space-x-2">
  <img className="w-8 h-8 rounded-full border-2 border-white" />
  <img className="w-8 h-8 rounded-full border-2 border-white" />
  <img className="w-8 h-8 rounded-full border-2 border-white" />
</div>
```

## Animation & Transitions

### Transition Classes
```css
.transition-colors { transition-property: background-color, border-color, color, fill, stroke; }
.transition-all { transition-property: all; }
.transition-shadow { transition-property: box-shadow; }
.transition-transform { transition-property: transform; }
```

### Duration
```css
.duration-200 { transition-duration: 200ms; } /* Standard */
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }
```

### Custom Animations

#### Spinner
```jsx
<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
```

#### Slide Animation (tailwind.config.js)
```js
animation: {
  'slide-in-right': 'slideInRight 0.3s ease-out forwards',
},
keyframes: {
  slideInRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
}
```

## Responsive Design

### Breakpoints
```css
/* sm: 640px - Small devices */
/* md: 768px - Medium devices (tablets) */
/* lg: 1024px - Large devices (desktop) */
/* xl: 1280px - Extra large devices */
/* 2xl: 1536px - 2x large devices */
```

### Common Responsive Patterns

#### Hide/Show
```jsx
{/* Hide on mobile, show on desktop */}
<div className="hidden lg:flex">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="lg:hidden">Mobile only</div>
```

#### Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive grid items */}
</div>
```

#### Responsive Text
```jsx
<h1 className="text-xl md:text-2xl lg:text-3xl">Responsive Heading</h1>
```

#### Responsive Spacing
```jsx
<div className="p-4 md:p-6 lg:p-8">
  <div className="mb-4 md:mb-6 lg:mb-8">
    {/* Content */}
  </div>
</div>
```

## Special Effects

### Glass Morphism
```jsx
{/* Login page glass effect */}
<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
  {/* Glass content */}
</div>

{/* Lighter glass */}
<div className="bg-white/20 backdrop-blur rounded-lg p-6">
  {/* Glass content */}
</div>
```

### Gradients
```jsx
{/* Background gradient */}
<div className="bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900">
  {/* Content */}
</div>

{/* Yellow gradient */}
<div className="bg-gradient-to-r from-yellow-400 to-yellow-500">
  {/* Content */}
</div>
```

### Status Indicators
```jsx
{/* Green dot */}
<span className="w-2 h-2 bg-green-600 rounded-full" />

{/* With animation */}
<span className="relative">
  <span className="w-2 h-2 bg-green-600 rounded-full absolute animate-ping" />
  <span className="w-2 h-2 bg-green-600 rounded-full relative" />
</span>
```

## Utility Patterns

### Text Utilities

#### Truncation
```jsx
{/* Single line */}
<p className="truncate">Long text that will be truncated...</p>

{/* Multi-line */}
<p className="line-clamp-2">Long text that will be clamped to 2 lines...</p>
```

#### Text Alignment
```jsx
<div className="text-left">Left aligned</div>
<div className="text-center">Center aligned</div>
<div className="text-right">Right aligned</div>
```

### Overflow
```jsx
{/* Hide overflow */}
<div className="overflow-hidden">...</div>

{/* Scrollable */}
<div className="overflow-y-auto max-h-96">...</div>
<div className="overflow-x-auto">...</div>
```

### Opacity
```jsx
<div className="opacity-50">50% opacity</div>
<div className="opacity-70">70% opacity</div>
<div className="opacity-90">90% opacity</div>
```

### Cursor
```jsx
<button className="cursor-pointer">Clickable</button>
<button className="cursor-not-allowed opacity-50" disabled>Disabled</button>
```

### Z-Index
```jsx
<div className="z-10">Layer 1</div>
<div className="z-20">Layer 2</div>
<div className="z-50">Modal/Dropdown layer</div>
```

## Tailwind Configuration

### Custom Theme Extensions
```js
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### PostCSS Configuration
```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Global CSS Setup
```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility classes can be added here */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## Usage Guidelines

### 1. Component Creation
- Always check existing components before creating new ones
- Use consistent spacing and color patterns
- Apply transitions for interactive elements
- Ensure responsive behavior

### 2. Color Usage
- Use semantic colors for status (green = success, red = error)
- Maintain contrast ratios for accessibility
- Use brand colors (teal) for primary actions
- Keep neutral colors for UI structure

### 3. Spacing Consistency
- Use the spacing scale consistently
- Common patterns: `mb-4`, `mb-6`, `mb-8` for vertical rhythm
- Card padding: `p-4` (small), `p-6` (standard)
- Button padding: `px-4 py-3` (standard)

### 4. Responsive Design
- Mobile-first approach
- Test all breakpoints
- Use responsive utilities for layout changes
- Maintain readability across devices

### 5. Accessibility
- Ensure color contrast meets WCAG standards
- Add focus states to interactive elements
- Use semantic HTML elements
- Include ARIA labels where needed

This styling guide provides a complete reference for maintaining visual consistency when building with the Ceedpods Sky design system.