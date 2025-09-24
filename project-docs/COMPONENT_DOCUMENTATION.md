# Ceedpods Sky - Component Documentation & Design Guidelines

This document provides comprehensive documentation for all components in the Ceedpods Sky project, including usage examples, props, and design guidelines.

## Table of Contents

### Core Components
1. [Button Component](#button-component)
2. [Input Component](#input-component)
3. [Card Component](#card-component)
4. [Logo Component](#logo-component)
5. [Modal Component](#modal-component)
6. [DropdownSelect Component](#dropdownselect-component)

### Layout Components
7. [DashboardLayout](#dashboardlayout)
8. [SplitLayout](#splitlayout)
9. [ClientDashboardLayout](#clientdashboardlayout)
10. [ContractorDashboardLayout](#contractordashboardlayout)

### Project Components
11. [ProjectCard](#projectcard)
12. [PlacementCard](#placementcard)
13. [ProjectSidebar](#projectsidebar)
14. [TechStackCard](#techstackcard)

### Contractor & Team Components
15. [ContractorCard](#contractorcard)
16. [SavedContractorRow](#savedcontractorrow)
17. [TeamCard](#teamcard)
18. [SavedTeamCard](#savedteamcard)
19. [TeamMemberCard](#teammembercard)
20. [AdditionalTeamCard](#additionalteamcard)

### Financial Components
21. [EarningsCard](#earningscard)
22. [ChartCard](#chartcard)
23. [TransactionRow](#transactionrow)
24. [ActivityItem](#activityitem)
25. [StatsCard](#statscard)
26. [MonthlySpendingCard](#monthlyspendingcard)

### Modal Components
27. [BidSuccessModal](#bidsuccessmodal)
28. [ContractorAdditionModal](#contractoradditionmodal)
29. [ScheduleMeetingModal](#schedulemeetingmodal)
30. [MeetingConfirmModal](#meetingconfirmmodal)
31. [MeetingSentModal](#meetingsentmodal)

### Other Components
32. [FilterSidebar](#filtersidebar)
33. [CartSidebar](#cartsidebar)
34. [RecentActivity](#recentactivity)

---

## Core Components

### Button Component

**Location**: `/src/components/common/Button.jsx`

**Description**: A reusable button component with multiple variants and states.

**Props**:
- `variant` (string): 'primary' | 'secondary' | 'ghost' | 'danger' - Default: 'primary'
- `size` (string): 'small' | 'medium' | 'large' - Default: 'medium'
- `isLoading` (boolean): Shows loading spinner - Default: false
- `disabled` (boolean): Disables the button - Default: false
- `onClick` (function): Click handler
- `children` (node): Button content
- `className` (string): Additional CSS classes
- `type` (string): Button type - Default: 'button'

**Usage Example**:
```jsx
import { Button } from '@/components/common/Button';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Loading state
<Button variant="primary" isLoading={true}>
  Saving...
</Button>

// Secondary button
<Button variant="secondary" size="small">
  Cancel
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

**Styling Classes**:
- Primary: `bg-teal-600 hover:bg-teal-700 text-white`
- Secondary: `bg-white hover:bg-gray-50 text-gray-700 border border-gray-300`
- Ghost: `bg-transparent hover:bg-gray-100 text-gray-700`
- Danger: `bg-red-600 hover:bg-red-700 text-white`

---

### Input Component

**Location**: `/src/components/common/Input.jsx`

**Description**: Form input component with validation and password toggle functionality.

**Props**:
- `type` (string): Input type - Default: 'text'
- `label` (string): Field label
- `placeholder` (string): Placeholder text
- `value` (string): Input value
- `onChange` (function): Change handler
- `error` (string): Error message
- `required` (boolean): Required field - Default: false
- `disabled` (boolean): Disabled state - Default: false
- `showPasswordToggle` (boolean): Show password visibility toggle
- `className` (string): Additional CSS classes

**Usage Example**:
```jsx
import { Input } from '@/components/common/Input';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// Password input with toggle
<Input
  label="Password"
  type="password"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  showPasswordToggle
  error={passwordError}
/>

// Input with error
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error="Username already exists"
/>
```

**Styling Classes**:
- Base: `border border-gray-300 rounded-lg px-4 py-3`
- Focus: `focus:ring-2 focus:ring-teal-600 focus:border-teal-600`
- Error: `border-red-500`
- Label: `text-sm font-medium text-gray-700`

---

### Card Component

**Location**: `/src/components/common/Card.jsx`

**Description**: A flexible container component for content grouping.

**Props**:
- `children` (node): Card content
- `className` (string): Additional CSS classes
- `onClick` (function): Click handler (makes card clickable)
- `hover` (boolean): Enable hover effects - Default: false
- `noPadding` (boolean): Remove default padding - Default: false
- `variant` (string): 'default' | 'special' - Default: 'default'

**Usage Example**:
```jsx
import { Card } from '@/components/common/Card';

// Basic card
<Card>
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</Card>

// Clickable card with hover
<Card hover onClick={handleCardClick}>
  <div>Interactive content</div>
</Card>

// Special variant (navy)
<Card variant="special">
  <div className="text-white">Special content</div>
</Card>

// No padding
<Card noPadding>
  <img src="..." className="w-full rounded-t-lg" />
  <div className="p-6">Content with custom padding</div>
</Card>
```

**Styling Classes**:
- Default: `bg-white rounded-lg border border-gray-200`
- Hover: `hover:shadow-lg hover:border-gray-300 transition-all duration-200`
- Special: `bg-[#1e3a5f] text-white`
- With padding: `p-6`

---

### Logo Component

**Location**: `/src/components/common/Logo.jsx`

**Description**: Brand logo component with customizable size and colors.

**Props**:
- `size` (string): 'small' | 'medium' | 'large' - Default: 'medium'
- `variant` (string): 'default' | 'white' - Default: 'default'
- `className` (string): Additional CSS classes

**Usage Example**:
```jsx
import { Logo } from '@/components/common/Logo';

// Default logo
<Logo />

// Large white logo
<Logo size="large" variant="white" />

// Small logo with custom class
<Logo size="small" className="mb-4" />
```

**Size Mappings**:
- Small: `h-8`
- Medium: `h-10`
- Large: `h-12`

---

### Modal Component

**Location**: `/src/components/common/Modal.jsx`

**Description**: Base modal component for dialogs and overlays.

**Props**:
- `isOpen` (boolean): Show/hide modal
- `onClose` (function): Close handler
- `title` (string): Modal title
- `children` (node): Modal content
- `showCloseButton` (boolean): Show X button - Default: true
- `showBackButton` (boolean): Show back button - Default: false
- `onBack` (function): Back button handler
- `size` (string): 'small' | 'medium' | 'large' | 'full' - Default: 'medium'
- `className` (string): Additional CSS classes

**Usage Example**:
```jsx
import { Modal } from '@/components/common/Modal';

// Basic modal
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-3 mt-6">
    <Button variant="primary">Confirm</Button>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
  </div>
</Modal>

// Modal with back button
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Step 2"
  showBackButton
  onBack={handleBack}
  size="large"
>
  <div>Multi-step content</div>
</Modal>
```

**Size Mappings**:
- Small: `max-w-sm`
- Medium: `max-w-md`
- Large: `max-w-lg`
- Full: `max-w-2xl`

---

### DropdownSelect Component

**Location**: `/src/components/common/DropdownSelect.jsx`

**Description**: Custom dropdown select with click-outside handling.

**Props**:
- `options` (array): Array of {value, label} objects
- `value` (string): Selected value
- `onChange` (function): Change handler
- `placeholder` (string): Placeholder text - Default: 'Select an option'
- `label` (string): Field label
- `disabled` (boolean): Disabled state - Default: false
- `className` (string): Additional CSS classes

**Usage Example**:
```jsx
import { DropdownSelect } from '@/components/common/DropdownSelect';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

<DropdownSelect
  label="Select Option"
  options={options}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  placeholder="Choose an option"
/>
```

**Styling**:
- Trigger: `bg-white border border-gray-300 rounded-lg px-4 py-3`
- Dropdown: `bg-white border border-gray-200 rounded-lg shadow-lg`
- Option: `hover:bg-[#E8F4F8]`
- Selected: `bg-[#E8F4F8] font-medium`

---

## Layout Components

### DashboardLayout

**Location**: `/src/components/layout/DashboardLayout.jsx`

**Description**: Main dashboard layout with sidebar navigation and header.

**Props**:
- `children` (node): Page content
- `userType` (string): 'consultant' | 'client' | 'contractor' - Default: 'consultant'
- `userName` (string): User's display name
- `userEmail` (string): User's email

**Usage Example**:
```jsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';

<DashboardLayout 
  userType="consultant"
  userName="John Doe"
  userEmail="john@example.com"
>
  <div className="p-8">
    {/* Page content */}
  </div>
</DashboardLayout>
```

**Features**:
- Responsive sidebar (collapsible on mobile)
- User dropdown menu
- Navigation items based on user type
- Breadcrumb support

---

### SplitLayout

**Location**: `/src/components/layout/SplitLayout.jsx`

**Description**: Two-panel layout for authentication pages.

**Props**:
- `children` (node): Form content (left panel)
- `rightPanelContent` (node): Right panel content
- `rightPanelGradient` (string): Custom gradient class

**Usage Example**:
```jsx
import { SplitLayout } from '@/components/layout/SplitLayout';

<SplitLayout
  rightPanelContent={
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
      <p>Sign in to continue your journey</p>
    </div>
  }
  rightPanelGradient="from-teal-700 via-teal-800 to-cyan-900"
>
  <LoginForm />
</SplitLayout>
```

---

### ClientDashboardLayout

**Location**: `/src/client/components/ClientDashboardLayout.jsx`

**Description**: Client-specific dashboard layout with custom navigation.

**Props**:
- `children` (node): Page content
- `activeTab` (string): Currently active navigation item

**Features**:
- Custom header with logo and user menu
- Icon-based sidebar navigation
- Responsive design
- Notification bell

---

### ContractorDashboardLayout

**Location**: `/src/contractor/components/ContractorDashboardLayout.jsx`

**Description**: Contractor-specific dashboard layout with icon sidebar.

**Props**:
- `children` (node): Page content
- `activeItem` (string): Currently active navigation item

**Features**:
- Vertical icon sidebar
- Tooltip navigation labels
- Notification indicator
- User profile section

---

## Project Components

### ProjectCard

**Location**: `/src/components/common/ProjectCard.jsx`

**Description**: Displays project information in a card format.

**Props**:
- `project` (object): Project data
  - `title` (string): Project title
  - `company` (string): Company name
  - `description` (string): Project description
  - `budget` (object): {min, max} budget range
  - `space` (string): Industry space
  - `tags` (array): Technology tags
  - `location` (string): Project location
  - `posted` (string): Posted date
- `onApply` (function): Apply button handler
- `onViewDetails` (function): View details handler
- `showActions` (boolean): Show action buttons - Default: true

**Usage Example**:
```jsx
import { ProjectCard } from '@/components/common/ProjectCard';

<ProjectCard
  project={{
    title: "E-Learning Platform",
    company: "EduTech Inc",
    description: "Build a modern e-learning platform...",
    budget: { min: 5000, max: 10000 },
    space: "EDTECH",
    tags: ["React", "Node.js", "MongoDB"],
    location: "Remote",
    posted: "2 days ago"
  }}
  onApply={handleApply}
  onViewDetails={handleViewDetails}
/>
```

---

### PlacementCard

**Location**: `/src/consultant/components/PlacementCard.jsx`

**Description**: Shows project placement status with bid information.

**Props**:
- `placement` (object): Placement data
  - `projectName` (string): Project name
  - `bidAmount` (number): Bid amount
  - `status` (string): 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  - `timeline` (array): Status timeline events
  - `earnings` (number): Potential earnings
- `onClick` (function): Card click handler

**Usage Example**:
```jsx
import { PlacementCard } from '@/consultant/components/PlacementCard';

<PlacementCard
  placement={{
    projectName: "Mobile App Development",
    bidAmount: 8000,
    status: "shortlisted",
    timeline: [
      { status: "Applied", date: "Jan 15, 2024", completed: true },
      { status: "Shortlisted", date: "Jan 18, 2024", completed: true },
      { status: "Interview", date: "Jan 22, 2024", completed: false }
    ],
    earnings: 800
  }}
  onClick={handlePlacementClick}
/>
```

---

### ProjectSidebar

**Location**: `/src/consultant/components/ProjectSidebar.jsx`

**Description**: Navigation sidebar for project detail pages.

**Props**:
- `activeTab` (string): Currently active tab
- `onTabChange` (function): Tab change handler
- `projectStatus` (string): Project status for conditional tabs

**Tabs**:
- Project Brief
- Your Bid (if applicable)
- Messages
- Files

---

### TechStackCard

**Location**: `/src/consultant/components/TechStackCard.jsx`

**Description**: Displays technical requirements and stack.

**Props**:
- `technologies` (array): List of technologies
- `title` (string): Card title - Default: 'Technical Requirements'
- `showIcons` (boolean): Show tech icons - Default: true

**Usage Example**:
```jsx
import { TechStackCard } from '@/consultant/components/TechStackCard';

<TechStackCard
  title="Required Skills"
  technologies={["React", "TypeScript", "Node.js", "PostgreSQL"]}
  showIcons={true}
/>
```

---

## Contractor & Team Components

### ContractorCard

**Location**: `/src/components/common/ContractorCard.jsx`

**Description**: Individual contractor profile card.

**Props**:
- `contractor` (object): Contractor data
  - `name` (string): Contractor name
  - `title` (string): Professional title
  - `avatar` (string): Avatar URL
  - `skills` (array): Skill list
  - `rate` (number): Hourly rate
  - `rating` (number): Rating (0-5)
  - `availability` (string): Availability status
  - `experience` (string): Years of experience
- `onSelect` (function): Selection handler
- `isSelected` (boolean): Selected state
- `showActions` (boolean): Show action buttons - Default: true

**Usage Example**:
```jsx
import { ContractorCard } from '@/components/common/ContractorCard';

<ContractorCard
  contractor={{
    name: "Jane Smith",
    title: "Full Stack Developer",
    avatar: "/avatars/jane.jpg",
    skills: ["React", "Node.js", "AWS"],
    rate: 75,
    rating: 4.8,
    availability: "Available",
    experience: "5 years"
  }}
  onSelect={handleSelect}
  isSelected={selectedContractors.includes('jane-smith')}
/>
```

---

### SavedContractorRow

**Location**: `/src/consultant/components/SavedContractorRow.jsx`

**Description**: Table row for saved contractors list.

**Props**:
- `contractor` (object): Contractor data
- `onRemove` (function): Remove handler
- `onMessage` (function): Message handler
- `onViewProfile` (function): View profile handler

**Features**:
- Detailed contractor information in table format
- Action buttons (remove, message, view)
- Skill badges
- Availability indicator

---

### TeamCard

**Location**: `/src/consultant/components/TeamCard.jsx`

**Description**: Basic team display card.

**Props**:
- `team` (object): Team data
  - `name` (string): Team name
  - `description` (string): Team description
  - `members` (array): Team member list
  - `skills` (array): Team skills
  - `projectCount` (number): Completed projects
- `onClick` (function): Click handler
- `variant` (string): 'default' | 'compact' - Default: 'default'

**Usage Example**:
```jsx
import { TeamCard } from '@/consultant/components/TeamCard';

<TeamCard
  team={{
    name: "Alpha Dev Team",
    description: "Expert full-stack development team",
    members: [
      { id: 1, name: "John", avatar: "/john.jpg" },
      { id: 2, name: "Jane", avatar: "/jane.jpg" }
    ],
    skills: ["React", "Node.js", "AWS"],
    projectCount: 15
  }}
  onClick={handleTeamClick}
  variant="default"
/>
```

---

### SavedTeamCard

**Location**: `/src/consultant/components/SavedTeamCard.jsx`

**Description**: Interactive saved team card with management actions.

**Props**:
- `team` (object): Team data
- `onRemove` (function): Remove handler
- `onAddContractors` (function): Add contractors handler
- `onViewDetails` (function): View details handler
- `isExpanded` (boolean): Expanded state

**Features**:
- Expandable team member list
- Action buttons
- Team statistics
- Member avatars

---

### TeamMemberCard

**Location**: `/src/consultant/components/TeamMemberCard.jsx`

**Description**: Individual team member display.

**Props**:
- `member` (object): Member data
  - `name` (string): Member name
  - `role` (string): Role in team
  - `avatar` (string): Avatar URL
  - `skills` (array): Member skills
  - `experience` (string): Experience level
- `onRemove` (function): Remove handler
- `showRemove` (boolean): Show remove button - Default: false

---

### AdditionalTeamCard

**Location**: `/src/consultant/components/AdditionalTeamCard.jsx`

**Description**: Suggests additional teams for projects.

**Props**:
- `team` (object): Team suggestion data
- `onAdd` (function): Add team handler
- `reason` (string): Recommendation reason

---

## Financial Components

### EarningsCard

**Location**: `/src/components/common/EarningsCard.jsx`

**Description**: Displays earnings information with variants.

**Props**:
- `title` (string): Card title
- `amount` (number): Earnings amount
- `period` (string): Time period
- `change` (number): Percentage change
- `variant` (string): 'default' | 'dark' | 'highlight' - Default: 'default'
- `icon` (component): Icon component
- `showTrend` (boolean): Show trend indicator - Default: true

**Usage Example**:
```jsx
import { EarningsCard } from '@/components/common/EarningsCard';
import { DollarSign } from 'lucide-react';

<EarningsCard
  title="Total Earnings"
  amount={25000}
  period="This Month"
  change={12.5}
  variant="dark"
  icon={DollarSign}
  showTrend={true}
/>
```

**Variants**:
- Default: White background
- Dark: Navy background (`bg-[#1e3a5f]`)
- Highlight: Teal background

---

### ChartCard

**Location**: `/src/components/common/ChartCard.jsx`

**Description**: Analytics card with chart visualization.

**Props**:
- `title` (string): Chart title
- `subtitle` (string): Chart subtitle
- `children` (node): Chart content
- `timeRange` (string): Selected time range
- `onTimeRangeChange` (function): Time range handler
- `showLegend` (boolean): Show chart legend - Default: false

**Usage Example**:
```jsx
import { ChartCard } from '@/components/common/ChartCard';

<ChartCard
  title="Monthly Revenue"
  subtitle="Revenue breakdown by source"
  timeRange="month"
  onTimeRangeChange={handleTimeRangeChange}
  showLegend={true}
>
  <LineChart data={revenueData} />
</ChartCard>
```

---

### TransactionRow

**Location**: `/src/consultant/components/TransactionRow.jsx`

**Description**: Table row for transaction history.

**Props**:
- `transaction` (object): Transaction data
  - `id` (string): Transaction ID
  - `description` (string): Description
  - `amount` (number): Amount
  - `date` (string): Transaction date
  - `status` (string): 'completed' | 'pending' | 'failed'
  - `type` (string): 'credit' | 'debit'
- `onViewDetails` (function): View details handler

**Status Indicators**:
- Completed: Green dot
- Pending: Yellow dot
- Failed: Red dot

---

### ActivityItem

**Location**: `/src/components/common/ActivityItem.jsx`

**Description**: Activity feed item display.

**Props**:
- `activity` (object): Activity data
  - `type` (string): Activity type
  - `title` (string): Activity title
  - `description` (string): Description
  - `timestamp` (string): Time of activity
  - `icon` (component): Activity icon
  - `user` (object): User who performed activity

**Usage Example**:
```jsx
import { ActivityItem } from '@/components/common/ActivityItem';
import { UserPlus } from 'lucide-react';

<ActivityItem
  activity={{
    type: "contractor_added",
    title: "New Contractor Added",
    description: "John Doe joined the team",
    timestamp: "2 hours ago",
    icon: UserPlus,
    user: {
      name: "Admin",
      avatar: "/admin.jpg"
    }
  }}
/>
```

---

### StatsCard

**Location**: `/src/client/components/StatsCard.jsx`

**Description**: Statistics display with trend indicators.

**Props**:
- `title` (string): Stat title
- `value` (string|number): Main value
- `change` (number): Percentage change
- `trend` (string): 'up' | 'down' - Based on change
- `icon` (component): Stat icon
- `format` (string): 'number' | 'currency' - Default: 'number'

**Usage Example**:
```jsx
import { StatsCard } from '@/client/components/StatsCard';
import { Users } from 'lucide-react';

<StatsCard
  title="Active Contractors"
  value={156}
  change={8.2}
  icon={Users}
  format="number"
/>

<StatsCard
  title="Monthly Spending"
  value={45000}
  change={-3.5}
  format="currency"
/>
```

---

### MonthlySpendingCard

**Location**: `/src/client/components/MonthlySpendingCard.jsx`

**Description**: Interactive spending visualization with line chart.

**Props**:
- `data` (array): Spending data points
- `timeRange` (string): Selected time range
- `onTimeRangeChange` (function): Time range change handler

**Features**:
- SVG line chart implementation
- Interactive hover states
- Time period dropdown
- Responsive design

---

## Modal Components

### BidSuccessModal

**Location**: `/src/consultant/components/BidSuccessModal.jsx`

**Description**: Success confirmation after placing a bid.

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `projectName` (string): Project name
- `bidAmount` (number): Bid amount
- `onViewBids` (function): View bids handler
- `onBackToProjects` (function): Back to projects handler

**Features**:
- Success animation
- Next steps information
- Action buttons

---

### ContractorAdditionModal

**Location**: `/src/consultant/components/ContractorAdditionModal.jsx`

**Description**: Two-step modal for adding contractors to teams.

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `contractor` (object): Contractor to add
- `teams` (array): Available teams
- `onAdd` (function): Add contractor handler

**Steps**:
1. Select team
2. Set proficiency level

---

### ScheduleMeetingModal

**Location**: `/src/client/components/ScheduleMeetingModal.jsx`

**Description**: Complex meeting scheduling interface.

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `selectedContractors` (array): Contractors to meet
- `onSchedule` (function): Schedule handler

**Features**:
- Date range picker
- Day selection (weekdays/weekends)
- Time slot configuration
- Timezone selection
- Notes field

---

### MeetingConfirmModal

**Location**: `/src/client/components/MeetingConfirmModal.jsx`

**Description**: Meeting details confirmation.

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `meetingDetails` (object): Meeting information
- `onConfirm` (function): Confirm handler
- `onBack` (function): Back handler

---

### MeetingSentModal

**Location**: `/src/client/components/MeetingSentModal.jsx`

**Description**: Success modal after scheduling meetings.

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `contractors` (array): Scheduled contractors
- `onBackToDashboard` (function): Dashboard navigation

---

## Other Components

### FilterSidebar

**Location**: `/src/consultant/components/FilterSidebar.jsx`

**Description**: Advanced filtering interface for searches.

**Props**:
- `filters` (object): Current filter values
- `onFilterChange` (function): Filter change handler
- `onReset` (function): Reset filters handler
- `filterOptions` (object): Available filter options

**Filter Categories**:
- Industry space
- Location
- Budget range
- Experience level
- Availability
- Skills/Technologies

---

### CartSidebar

**Location**: `/src/client/components/CartSidebar.jsx`

**Description**: Complex contractor selection cart with clustering.

**Props**:
- `isOpen` (boolean): Sidebar visibility
- `contractors` (array): Selected contractors
- `onRemove` (function): Remove contractor handler
- `onScheduleMeeting` (function): Schedule meeting handler
- `onClose` (function): Close sidebar handler

**Features**:
- Automatic expertise clustering
- Bulk actions
- Meeting scheduling
- Contractor count badges

---

### RecentActivity

**Location**: `/src/client/components/RecentActivity.jsx`

**Description**: Activity feed for recent events.

**Props**:
- `activities` (array): Activity list
- `maxItems` (number): Maximum items to show - Default: 5
- `showViewAll` (boolean): Show view all link - Default: true
- `onViewAll` (function): View all handler

---

## Design Guidelines

### 1. Component Hierarchy

Follow this hierarchy when building interfaces:

```
Page Component
  └─ Layout Component (DashboardLayout, etc.)
      └─ Section Containers
          └─ Cards/Panels
              └─ Core Components (Button, Input, etc.)
                  └─ Icons/Badges/Small Elements
```

### 2. Spacing Principles

**Between Sections**: Use `mb-8` or `gap-8`
```jsx
<div className="mb-8">
  <SectionOne />
</div>
<div className="mb-8">
  <SectionTwo />
</div>
```

**Within Cards**: Use `mb-4` or `gap-4`
```jsx
<Card>
  <h3 className="text-lg font-semibold mb-4">Title</h3>
  <div className="space-y-4">
    {/* Content items */}
  </div>
</Card>
```

**Form Elements**: Use `mb-4` between fields
```jsx
<form className="space-y-4">
  <Input label="Email" />
  <Input label="Password" />
  <Button type="submit">Submit</Button>
</form>
```

### 3. Color Usage Guidelines

**Primary Actions**: Always use teal
```jsx
<Button variant="primary">Save</Button>  // bg-teal-600
```

**Destructive Actions**: Always use red
```jsx
<Button variant="danger">Delete</Button>  // bg-red-600
```

**Status Indicators**:
- Success: `text-green-600` or `bg-green-100 text-green-600`
- Error: `text-red-500` or `bg-red-100 text-red-500`
- Warning: `text-yellow-600` or `bg-yellow-100 text-yellow-600`
- Info: `text-blue-600` or `bg-blue-100 text-blue-600`

**Text Hierarchy**:
- Primary: `text-gray-900`
- Secondary: `text-gray-700`
- Muted: `text-gray-500`
- Disabled: `text-gray-400`

### 4. Typography Guidelines

**Page Titles**: 
```jsx
<h1 className="text-2xl font-bold text-gray-900 mb-6">Page Title</h1>
```

**Section Headers**:
```jsx
<h2 className="text-xl font-semibold text-gray-900 mb-4">Section Title</h2>
```

**Card Headers**:
```jsx
<h3 className="text-lg font-semibold text-gray-900 mb-3">Card Title</h3>
```

**Body Text**:
```jsx
<p className="text-sm text-gray-700">Regular paragraph text</p>
<p className="text-xs text-gray-500">Helper or secondary text</p>
```

### 5. Interactive Elements

**Hover States**: All interactive elements should have hover states
```jsx
// Button
className="hover:bg-teal-700"

// Card
className="hover:shadow-lg hover:border-gray-300"

// Link
className="hover:text-teal-700 hover:underline"
```

**Focus States**: Ensure keyboard accessibility
```jsx
className="focus:ring-2 focus:ring-teal-600 focus:outline-none"
```

**Loading States**: Use consistent loading indicators
```jsx
{isLoading ? (
  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
) : (
  <span>Submit</span>
)}
```

### 6. Responsive Design Patterns

**Mobile First**: Start with mobile layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

**Hide/Show Elements**:
```jsx
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile only</div>
```

**Responsive Text**:
```jsx
<h1 className="text-xl md:text-2xl lg:text-3xl">Responsive Title</h1>
```

### 7. Form Design Guidelines

**Field Grouping**: Group related fields
```jsx
<div className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="First Name" />
    <Input label="Last Name" />
  </div>
  <Input label="Email" type="email" />
</div>
```

**Error Handling**: Show errors below fields
```jsx
<div>
  <Input error={errors.email} />
  {errors.email && (
    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
  )}
</div>
```

**Required Fields**: Mark with asterisk
```jsx
<label className="text-sm font-medium text-gray-700">
  Email <span className="text-red-500">*</span>
</label>
```

### 8. Icon Usage

**Size Conventions**:
- Small (buttons, labels): `w-4 h-4`
- Medium (cards): `w-5 h-5`
- Large (empty states): `w-6 h-6` or larger

**Color Matching**:
```jsx
// Match text color
<Icon className="w-4 h-4 text-gray-500" />

// Primary action
<Icon className="w-4 h-4 text-teal-600" />
```

### 9. Empty States

Always provide meaningful empty states:
```jsx
<div className="text-center py-12">
  <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
  <p className="text-sm text-gray-500">Try adjusting your filters</p>
</div>
```

### 10. Animation Guidelines

**Transitions**: Use for smooth interactions
```jsx
className="transition-all duration-200"
```

**Loading Spinners**: Consistent style
```jsx
<div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full" />
```

**Hover Animations**: Subtle and smooth
```jsx
className="transform hover:scale-105 transition-transform duration-200"
```

## Best Practices

### 1. Component Composition
- Keep components focused and single-purpose
- Use composition over complex props
- Extract repeated patterns into separate components

### 2. Prop Naming
- Use clear, descriptive prop names
- Boolean props should start with 'is', 'has', or 'show'
- Handler props should start with 'on'

### 3. Accessibility
- Always include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Use semantic HTML elements

### 4. Performance
- Use React.memo for expensive components
- Implement proper key props in lists
- Lazy load heavy components
- Optimize images and assets

### 5. Testing
- Write tests for critical user flows
- Test error states and edge cases
- Ensure responsive behavior
- Validate accessibility

This documentation provides a comprehensive guide to all components in the Ceedpods Sky project. Use it as a reference when building new features or maintaining existing ones.