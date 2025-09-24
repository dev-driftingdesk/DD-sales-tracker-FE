# Ceedpods Sky - Design Guidelines

This document outlines the design principles, patterns, and best practices for the Ceedpods Sky platform to ensure consistency and quality across all interfaces.

## Table of Contents
1. [Design Principles](#design-principles)
2. [Visual Hierarchy](#visual-hierarchy)
3. [Layout Guidelines](#layout-guidelines)
4. [Component Design Patterns](#component-design-patterns)
5. [Interaction Design](#interaction-design)
6. [Responsive Design Strategy](#responsive-design-strategy)
7. [Accessibility Standards](#accessibility-standards)
8. [Motion & Animation](#motion--animation)
9. [Data Visualization](#data-visualization)
10. [Form Design](#form-design)
11. [Error Handling & Feedback](#error-handling--feedback)
12. [Performance Considerations](#performance-considerations)

## Design Principles

### 1. Clarity First
- **Clear Visual Hierarchy**: Use size, color, and spacing to guide users
- **Readable Typography**: Maintain proper contrast and sizing
- **Intuitive Navigation**: Users should always know where they are
- **Consistent Patterns**: Similar actions should look and behave similarly

### 2. Professional & Trustworthy
- **Clean Aesthetics**: Minimize visual clutter
- **Balanced Layouts**: Use whitespace effectively
- **Polished Details**: Attention to micro-interactions and states
- **Business-Appropriate**: Design for professional users

### 3. Efficiency & Speed
- **Quick Actions**: Minimize clicks to complete tasks
- **Smart Defaults**: Pre-fill common values
- **Batch Operations**: Allow bulk actions where appropriate
- **Keyboard Shortcuts**: Support power users

### 4. User-Centric
- **Role-Based Design**: Tailor experiences for consultants, clients, and contractors
- **Progressive Disclosure**: Show information when needed
- **Helpful Feedback**: Guide users through complex processes
- **Error Prevention**: Design to prevent mistakes

## Visual Hierarchy

### Typography Scale
```
Page Title:       text-2xl font-bold    (24px, 700)
Section Title:    text-xl font-semibold (20px, 600)
Card Title:       text-lg font-semibold (18px, 600)
Subtitle:         text-base font-medium (16px, 500)
Body Text:        text-sm              (14px, 400)
Small Text:       text-xs              (12px, 400)
Tiny Text:        text-[10px]          (10px, 400)
```

### Color Hierarchy

#### Primary Actions
- **Teal-600**: Primary buttons, links, active states
- **Teal-700**: Hover states for primary elements

#### Content Structure
- **Gray-900**: Primary text, headings
- **Gray-700**: Secondary text, descriptions
- **Gray-500**: Muted text, placeholders
- **Gray-400**: Disabled text, very muted elements

#### Feedback Colors
- **Green**: Success, positive changes, available status
- **Red**: Errors, destructive actions, urgent items
- **Yellow**: Warnings, pending states
- **Blue**: Information, neutral highlights

### Spacing Rhythm
```
Base unit: 4px (0.25rem)

Micro:   4px  (p-1)
Small:   8px  (p-2)
Regular: 16px (p-4)
Medium:  24px (p-6)
Large:   32px (p-8)
XLarge:  48px (p-12)
```

## Layout Guidelines

### Grid System

#### Desktop Layout (1024px+)
- **12-column grid** for complex layouts
- **3-column grid** for card layouts
- **Sidebar + Content**: 280px sidebar + fluid content

#### Tablet Layout (768px-1023px)
- **8-column grid** for flexibility
- **2-column grid** for cards
- **Collapsible sidebar** to save space

#### Mobile Layout (<768px)
- **Single column** for all content
- **Full-width cards** with padding
- **Bottom navigation** for key actions

### Container Widths
```css
.container-small  { max-width: 640px; }  /* Forms, modals */
.container-medium { max-width: 768px; }  /* Content pages */
.container-large  { max-width: 1024px; } /* Dashboards */
.container-full   { max-width: 1280px; } /* Wide layouts */
```

### Page Structure
```
Header (64px height)
  └─ Logo + Navigation + User Menu
Main Content
  └─ Page Title + Actions
  └─ Filters/Tabs (if applicable)
  └─ Content Grid/List
  └─ Pagination (if applicable)
Footer (optional)
```

## Component Design Patterns

### Card Design

#### Basic Card Structure
```jsx
<Card>
  <CardHeader>
    <Title />
    <Actions />
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <SecondaryInfo />
    <PrimaryAction />
  </CardFooter>
</Card>
```

#### Card Variations
1. **Information Card**: Display-only content
2. **Interactive Card**: Clickable with hover state
3. **Action Card**: Contains form or buttons
4. **Status Card**: Shows progress or state

### Button Hierarchy

1. **Primary Button**: Main action (1 per view)
   - Color: `bg-teal-600`
   - Use: Submit, Save, Continue

2. **Secondary Button**: Alternative actions
   - Color: `bg-white border-gray-300`
   - Use: Cancel, Back, Skip

3. **Ghost Button**: Tertiary actions
   - Color: `bg-transparent`
   - Use: Learn more, Advanced options

4. **Danger Button**: Destructive actions
   - Color: `bg-red-600`
   - Use: Delete, Remove, Reject

### Navigation Patterns

#### Primary Navigation
- **Desktop**: Horizontal top nav or vertical sidebar
- **Mobile**: Bottom tab bar or hamburger menu
- **Active State**: Teal-600 color with background highlight

#### Secondary Navigation
- **Tabs**: For switching between related views
- **Breadcrumbs**: For hierarchical navigation
- **Filters**: For refining content

### List & Table Design

#### List Items
```jsx
<ListItem>
  <Avatar />
  <Content>
    <Title />
    <Description />
  </Content>
  <Metadata />
  <Actions />
</ListItem>
```

#### Table Design
- **Sticky headers** for long lists
- **Hover states** on rows
- **Sortable columns** with indicators
- **Responsive**: Convert to cards on mobile

## Interaction Design

### Hover States
- **Cards**: Elevate with shadow + border color
- **Buttons**: Darken background color
- **Links**: Underline + color change
- **Rows**: Light background highlight

### Focus States
- **Ring**: 2px teal-600 ring
- **Outline**: Never remove, only style
- **Tab Order**: Logical flow through page

### Loading States

#### Skeleton Screens
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

#### Spinners
- **Small**: In buttons (16px)
- **Medium**: In cards (24px)
- **Large**: Full page (40px)

### Micro-interactions
- **Button clicks**: Scale down slightly (0.95)
- **Toggle switches**: Smooth slide animation
- **Dropdowns**: Fade + slide in
- **Modals**: Fade overlay + scale content

## Responsive Design Strategy

### Breakpoint Philosophy
```
Mobile First: Design for mobile, enhance for desktop
Content-Based: Let content determine breakpoints
Device-Agnostic: Don't target specific devices
```

### Responsive Patterns

#### Navigation
- **Mobile**: Bottom tabs or hamburger
- **Tablet**: Collapsible sidebar
- **Desktop**: Full sidebar or top nav

#### Grid Layouts
```jsx
// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### Typography
```jsx
// Responsive heading
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Responsive Title
</h1>
```

#### Spacing
```jsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {content}
</div>
```

### Touch Targets
- **Minimum size**: 44x44px for touch
- **Spacing**: 8px between targets
- **Mobile buttons**: Full width or large

## Accessibility Standards

### Color Contrast
- **Normal text**: 4.5:1 ratio minimum
- **Large text**: 3:1 ratio minimum
- **Interactive elements**: 3:1 ratio minimum
- **Test all color combinations**

### Keyboard Navigation
- **Tab order**: Logical flow
- **Focus indicators**: Always visible
- **Skip links**: For main content
- **Escape key**: Close modals/dropdowns

### Screen Reader Support
```jsx
// Descriptive labels
<button aria-label="Delete project">
  <TrashIcon />
</button>

// Live regions
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>

// Semantic HTML
<nav> <main> <section> <article>
```

### ARIA Guidelines
- **Use semantic HTML first**
- **Label all interactive elements**
- **Announce dynamic changes**
- **Provide text alternatives**

## Motion & Animation

### Animation Principles
1. **Purpose**: Every animation should have a reason
2. **Performance**: Keep animations smooth (60fps)
3. **Duration**: 200-300ms for most transitions
4. **Easing**: Use ease-out for natural feel

### Standard Animations

#### Transitions
```css
/* Color/Background changes */
transition: all 200ms ease-out;

/* Position changes */
transition: transform 300ms ease-out;

/* Opacity changes */
transition: opacity 200ms ease-out;
```

#### Common Patterns
- **Fade In**: Modals, tooltips
- **Slide**: Sidebars, dropdowns
- **Scale**: Buttons on press
- **Rotate**: Loading spinners

### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Data Visualization

### Chart Guidelines
1. **Simplicity**: Show only necessary data
2. **Color Usage**: Max 6 distinct colors
3. **Labels**: Always label axes and data
4. **Responsiveness**: Adapt to container size

### Chart Types
- **Line Charts**: Trends over time
- **Bar Charts**: Comparisons
- **Pie Charts**: Parts of whole (avoid if >5 segments)
- **Metrics**: Single important numbers

### Visual Encoding
- **Color**: Categories or status
- **Size**: Quantities or importance
- **Position**: Relationships or ranking
- **Shape**: Different types

## Form Design

### Field Layout
```jsx
<div className="space-y-4">
  {/* Single fields */}
  <Input label="Email" type="email" required />
  
  {/* Field groups */}
  <div className="grid grid-cols-2 gap-4">
    <Input label="First Name" required />
    <Input label="Last Name" required />
  </div>
</div>
```

### Input States
1. **Default**: Gray border
2. **Focus**: Teal border + ring
3. **Error**: Red border + message
4. **Disabled**: Gray background
5. **Success**: Green check icon

### Form Validation
- **Inline validation**: As user types (for format)
- **On blur**: When leaving field
- **On submit**: Final validation
- **Clear messaging**: Specific error text

### Multi-step Forms
```jsx
<div className="mb-8">
  {/* Progress indicator */}
  <StepIndicator currentStep={2} totalSteps={4} />
</div>

<form>
  {/* Current step content */}
  {renderStep(currentStep)}
  
  {/* Navigation */}
  <div className="flex justify-between mt-8">
    <Button variant="secondary" onClick={prevStep}>
      Back
    </Button>
    <Button variant="primary" onClick={nextStep}>
      Continue
    </Button>
  </div>
</form>
```

## Error Handling & Feedback

### Error Messages
```jsx
// Field error
<p className="mt-1 text-xs text-red-500">
  Please enter a valid email address
</p>

// Form error
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-red-700">
    Unable to save changes. Please try again.
  </p>
</div>
```

### Success Feedback
```jsx
// Toast notification
<div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4">
  <p className="text-sm text-green-700">
    Changes saved successfully
  </p>
</div>

// Inline success
<div className="flex items-center gap-2 text-green-600">
  <CheckIcon className="w-4 h-4" />
  <span className="text-sm">Saved</span>
</div>
```

### Loading Feedback
- **Inline loaders**: Replace content
- **Overlay loaders**: For page transitions
- **Progress bars**: For long operations
- **Skeleton screens**: For initial loads

### Empty States
```jsx
<div className="text-center py-12">
  <IllustrationIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    No projects found
  </h3>
  <p className="text-sm text-gray-500 mb-6">
    Start by creating your first project
  </p>
  <Button variant="primary">
    Create Project
  </Button>
</div>
```

## Performance Considerations

### Image Optimization
- **Format**: Use WebP with fallbacks
- **Sizing**: Serve appropriate sizes
- **Lazy loading**: For below-fold images
- **Placeholders**: Show while loading

### Code Splitting
```jsx
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Show loading state
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Render Optimization
- **Memoization**: For expensive components
- **Virtualization**: For long lists
- **Debouncing**: For search/filter inputs
- **Pagination**: Limit data per page

### Perceived Performance
- **Optimistic updates**: Update UI immediately
- **Progressive enhancement**: Core functionality first
- **Skeleton screens**: Show structure while loading
- **Smooth transitions**: Mask loading delays

## Design Checklist

### Before Implementation
- [ ] Follows existing patterns
- [ ] Responsive design planned
- [ ] Accessibility considered
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined

### During Implementation
- [ ] Using design system colors
- [ ] Following spacing guidelines
- [ ] Consistent typography
- [ ] Proper component hierarchy
- [ ] Keyboard navigation works
- [ ] ARIA labels added

### After Implementation
- [ ] Tested on all breakpoints
- [ ] Checked color contrast
- [ ] Verified focus states
- [ ] Tested with keyboard only
- [ ] Performance optimized
- [ ] Cross-browser tested

## Design Resources

### Tools
- **Figma**: Primary design tool
- **Tailwind CSS**: Styling framework
- **Lucide Icons**: Icon library
- **React**: Component framework

### References
- **Material Design**: Interaction patterns
- **Human Interface Guidelines**: Best practices
- **WCAG 2.1**: Accessibility standards
- **Nielsen Norman Group**: UX research

This design guide ensures consistency and quality across the Ceedpods Sky platform. Always refer to these guidelines when creating new features or updating existing ones.