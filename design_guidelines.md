# Design Guidelines: Premium Multi-Tenancy Booking Platform

## Visual Identity

### Color Palette
**Premium Black & White Foundation**
- Pure Black (#000000) - Primary text, high-emphasis elements
- Charcoal (#1A1A1A) - Cards, elevated surfaces
- Graphite (#2D2D2D) - Secondary containers
- Slate (#4A4A4A) - Dividers, borders
- Smoke (#6B6B6B) - Secondary text
- Silver (#9E9E9E) - Tertiary text
- Fog (#D4D4D4) - Disabled states
- Whisper (#EBEBEB) - Subtle backgrounds
- Pearl (#F5F5F5) - Light surfaces
- Pure White (#FFFFFF) - Primary background

**Accent Shades** (for status/metrics)
- Success: #2D2D2D with 100% opacity for confirmed states
- Warning: #4A4A4A for pending states
- Critical: #1A1A1A with red undertones for cancellations

### Typography
**Oversized Hierarchy**
- Display: 72-96px - Hero numbers (revenue, booking counts)
- Headline 1: 48-56px - Section titles
- Headline 2: 32-40px - Card headers
- Body Large: 24px - Primary content
- Body: 18px - Standard text
- Caption: 14px - Metadata, timestamps

**Font Weight Contrast**
- Ultra Light (200) for large display numbers
- Regular (400) for body text
- Bold (700) for emphasis and CTAs

## Navigation Architecture

### Business Owner (Admin)
**Tab Navigation** (5 tabs)
- Home (Dashboard)
- Calendar
- Services (Center tab - core creation action)
- Customers
- Settings

### Public Booking Portal
**Stack-Only Navigation** - Linear booking flow
1. Service Selection
2. Date/Time Selection
3. Customer Details
4. Payment/Confirmation

## Screen Specifications

### Admin Dashboard (Home Tab)
**Layout:**
- Header: Transparent with greeting text (large 40px)
- Scrollable content with safe area: top inset = headerHeight + 32px, bottom = tabBarHeight + 32px
- No search bar in header

**Content Zones:**
1. **Hero Metrics Card**
   - Full-width card with subtle elevation
   - Large display typography (72px) for primary metric
   - Circular progress meters showing capacity utilization
   - Subtle parallax: metrics shift -20px on scroll

2. **Revenue Graph**
   - Cinematic line/bar chart with animated drawing
   - Black gridlines on white background
   - Numbers appear sequentially with fade-in
   - Smooth bezier curves, no hard angles

3. **Upcoming Bookings Preview**
   - Card-based list (3 visible)
   - Each card: 24px padding, 16px radius
   - Gentle hover lift (translateY: -4px, 300ms ease)

**Floating Elements:**
- Quick action button (bottom-right)
- Shadow: offset(0,2), opacity 0.10, radius 2
- Safe area bottom: tabBarHeight + 24px

### Calendar View
**Layout:**
- Header: Custom with month/year (48px), week/day toggle buttons
- Non-scrollable content (fixed calendar grid)
- Safe area top: headerHeight + 24px, bottom: tabBarHeight + 24px

**Visual Design:**
- Month view: Circular day indicators
- Booked days: filled black circles
- Available: outlined smoke circles
- Selected: white text on black
- Transition between month/week: 400ms ease-out with subtle scale

### Services Management (Center Tab)
**Layout:**
- Header: Transparent, right button = "Create Service"
- Scrollable grid/list
- Safe area: top = headerHeight + 32px, bottom = tabBarHeight + 32px

**Service Cards:**
- Large typography for service name (32px)
- Duration/price in oversized numbers (40px)
- Meter showing booking rate
- Tap animation: scale 0.98, 150ms

### Service Creation Modal
**Native Modal Screen**
- Full-screen form
- Header: opaque with "Cancel" (left), "Save" (right)
- Scrollable form content
- Submit/Cancel in header (not below form)
- Safe area top: default, bottom: insets.bottom + 24px

**Form Fields:**
- Oversized input labels (24px)
- Inputs with 16px padding, 8px radius
- Black borders (2px) on focus

### Booking Detail Screen
**Layout:**
- Header: Default navigation with back button
- Scrollable content
- Safe area: top = 24px (non-transparent header), bottom = insets.bottom + 24px

**Content:**
- Customer name in 48px headline
- Service/time details in 24px body
- Status indicator: circular badge with animation
- Action buttons (Confirm/Cancel/Complete) with visual press states

### Public Booking Portal - Service Selection
**Stack Screen (No Tabs)**
- Header: Transparent with business logo/name (40px)
- Scrollable grid of service cards
- Safe area: top = headerHeight + 32px, bottom = insets.bottom + 32px

**Service Cards:**
- Full-width cards with hero imagery (if available)
- Oversized service name (40px)
- Price in display typography (56px)
- Parallax: card images shift slightly on scroll

### Availability Calendar (Booking Flow)
**Stack Screen**
- Header: Default with "Select Time" title
- Calendar grid (non-scrollable)
- Available slots below calendar (scrollable list)
- Safe area top: 24px, bottom: insets.bottom + 32px

**Time Slots:**
- Large touchable cards (18px text)
- Selected: black background, white text
- Smooth selection animation (200ms)

### Checkout Screen
**Stack Screen**
- Header: Default with "Confirm Booking"
- Scrollable form
- Safe area: top = 24px, bottom = insets.bottom + 24px

**Summary Card:**
- Floating card above form
- Oversized total price (72px)
- Breakdown in 18px text
- Subtle shadow (as specified for floating elements)

**Submit Button:**
- Full-width, fixed at bottom
- Large text (24px)
- Safe area: insets.bottom + 24px
- Press state: opacity 0.85

## Design System Components

### Touchable Feedback
- Default touchables: opacity 0.7 on press, no shadow
- Floating buttons: subtle shadow (offset 0,2 / opacity 0.10 / radius 2)
- Cards: scale 0.98 on press
- Transition duration: 150-200ms

### Iconography
- Use Feather icons from @expo/vector-icons
- Icon sizes: 24px (standard), 32px (emphasis), 20px (small)
- No emoji usage

### Animations
**Cinematic Transitions:**
- Screen transitions: 400ms ease-out
- Graph animations: staggered 600ms with bezier(0.4, 0.0, 0.2, 1)
- Parallax scroll: -0.5 to -1.0 parallax ratio
- Micro-interactions: 200ms for toggles, 300ms for cards

**Loading States:**
- Skeleton screens with shimmer gradient
- Fade-in for loaded content (300ms)

## Accessibility
- Minimum touch target: 44x44px
- Text contrast: AAA rating (black on white, white on black)
- Large type option: scale all text +20%
- VoiceOver labels for all interactive elements
- Reduce motion: disable parallax, use simple fades

## Critical Assets
**Business Owner Portal:**
1. Generic business avatar placeholder (minimalist geometric icon in B&W)
2. Empty state illustrations (line art in black on white)
   - No bookings yet
   - No services created
   - No customers

**Public Booking Portal:**
1. Service category icons (8 standard icons: Haircut, Massage, Consultation, Class, Appointment, Cleaning, Repair, Custom)
2. Confirmation checkmark animation asset

**Profile Avatars:**
Not needed - business logos are custom uploads