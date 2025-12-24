# BookFlow - Multi-Tenancy Booking Platform MVP

## Project Overview
A scalable multi-tenant booking platform built with React Native (Expo), Express.js, and PostgreSQL. ONE app serves ALL businesses through unique booking URLs (/book/:businessSlug). Features premium design with sophisticated black/white color scheme, oversized typography, cinematic animations, and circular progress meters.

## Design System
- **Color Palette**: Premium black & white (Pure Black, Charcoal, Graphite, Smoke, Silver, Pearl)
- **Typography**: Oversized hierarchy (Display 72-96px, H1 48-56px, Body 18-24px)
- **Animation**: Spring physics with cinematic transitions (400ms ease-out for screens)
- **Components**: Circular meters, animated cards, line graphs with bezier curves

## Architecture
### Frontend (React Native - Expo)
- 5-tab admin dashboard (Home, Calendar, Services, Customers, Settings)
- Public booking flow (Service → Time → Checkout → Confirmation)
- Reusable components: CircularMeter, AnimatedMetricCard, LineGraph, BookingCard, ServiceCard, CustomerCard
- API client (`client/lib/api.ts`) for all backend communication
- Resilient `getApiUrl()` in `client/lib/query-client.ts` that auto-detects Replit dev domains

### Backend (Express.js + PostgreSQL)
- Running on port 5000
- Multi-tenant REST API with businessId filtering
- Drizzle ORM for database operations
- Public booking page served at `/book/:businessSlug`
- Smart business creation: checks for existing business by slug before creating

### Database Schema (PostgreSQL with Drizzle)
- businesses: id, name, slug, email, phone, website, notificationsEnabled
- services: id, businessId, name, duration, price (cents), description
- customers: id, businessId, name, email, phone
- bookings: id, businessId, customerId, serviceId, date, time, status, totalPrice (cents)
- availability: id, businessId, dayOfWeek, startTime, endTime, isAvailable

### Navigation Structure
- MainTabNavigator: 5 tabs for admin
- BookingFlowNavigator: 4-screen booking flow
- Modal screens: Service editor with cancel/save

## MVP Features Completed
✓ Dashboard with revenue metrics and booking graphs
✓ Calendar with day selection and booking preview
✓ Services management (CRUD ready)
✓ Customers list with booking counts
✓ Settings screen with data management and booking link sharing
✓ QR code generation and sharing for booking links
✓ Public booking flow (all 4 screens) at /book/:businessSlug
✓ PostgreSQL database with multi-tenant schema
✓ Full API integration (all screens use backend API)
✓ Demo data initialization
✓ Premium UI components with animations
✓ Resilient app initialization with retry logic (3 attempts)
✓ Smart duplicate business handling (server checks before creating)
✓ Comprehensive haptic feedback on all interactive elements (Light/Medium/Heavy)

## API Endpoints
- GET/POST /api/business - Business management
- GET/POST /api/services - Service CRUD (businessId filtered)
- GET/POST /api/bookings - Booking CRUD (businessId filtered)
- GET /api/customers - Customer list (businessId filtered)
- GET /api/stats - Dashboard statistics
- POST /api/demo-data - Initialize demo data
- DELETE /api/data - Clear all business data
- GET /api/businesses/:businessId/qrcode - Generate QR code for booking link

## Key Files
- `shared/schema.ts` - Database schema definitions
- `server/storage.ts` - Database operations
- `server/routes.ts` - API route handlers
- `server/templates/booking.html` - Public booking page
- `client/lib/api.ts` - Frontend API client with retry logic
- `client/lib/query-client.ts` - Query client with smart URL detection
- `client/screens/*.tsx` - Admin dashboard screens

## Deployment Configuration
- **Environment Variables:**
  - `EXPO_PUBLIC_DOMAIN`: Set to `bookflowx.cerolauto.store` for production
  - Auto-detects Replit dev domains and routes to localhost:5000 for development
  - `getBookingDomain()` helper function ensures all booking links use the correct domain
  
- **Exposed Ports:**
  - 5000: Express backend (API and public booking page)
  - 8081: Expo dev server (web version)

## Known Issues & Resolutions
1. **App Initialization Stuck on Loading** - RESOLVED
   - Issue: App was failing when trying to create duplicate demo-business
   - Fix 1: Client now retries initialization 3 times with exponential backoff
   - Fix 2: Server checks for existing business before creating, returns existing instead of error
   - Fix 3: getApiUrl() now detects Replit dev domains and routes to localhost:5000

2. **Missing EXPO_PUBLIC_DOMAIN** - RESOLVED
   - Fixed getApiUrl() to fallback gracefully to localhost:5000 if not set
   - Properly handles both http and https protocols

3. **Demo Data Initialization Failures in Production** - RESOLVED
   - Issue: Demo data endpoint was returning error on production domain
   - Root Cause: Demo customer emails were hardcoded (not unique), causing database constraint violations on repeated calls
   - Fix: Demo customers now use unique email addresses with timestamps (e.g., john-{timestamp}@example.com)
   - Status: Fixed and tested locally, production domain needs re-deployment to apply changes

4. **Booking Page 404 Error** - RESOLVED (Dec 24, 2025)
   - Issue: Booking page at /book/:slug returning 404 "Cannot find templates/booking.html"
   - Root Cause: Path resolution issue when server was compiled to server_dist directory
   - Fix: Added path resolution error handling and logging in booking page routes
   - Status: Fixed - booking page now serves correctly at bookflowx.cerolauto.store/book/:slug
   - QR codes now correctly generate with production domain

5. **API Connectivity Issues (Web & Expo Go)** - RESOLVED (Dec 24, 2025)
   - Issue: Web preview worked but Expo Go native app couldn't reach API
   - Root Cause: Browser uses window.location for dynamic URL detection, but native Expo Go needed environment variable handling
   - Fix: Enhanced getApiUrl() to:
     - Check window.location in browser (works for web preview and production)
     - Handle literal $REPLIT_DEV_DOMAIN in EXPO_PUBLIC_DOMAIN by falling back to REACT_NATIVE_PACKAGER_HOSTNAME
     - Fallback to localhost:5000 for local development
   - Status: FIXED - Both web preview and Expo Go now connect to API successfully

## Testing & Deployment
- Local dev: Run `npm run server:dev && npm run expo:dev`, access web version at http://localhost:8081
- TestFlight: App needs static build with `EXPO_PUBLIC_DOMAIN=elegant-canvas--wealthmastermin.replit.app`
- Booking flow: Navigate to `/book/demo-business` to test public booking

## Notes
- Prices stored in cents (integer) in database, divided by 100 for display
- Demo business auto-created as "demo-business" slug if none exists
- Public booking URL format: http://localhost:5000/book/{businessSlug}
- QR codes redirect to booking page via generated QR code endpoint

## Recent Updates (Dec 24, 2025)
- Added comprehensive haptic feedback throughout the app:
  - Light haptics: Buttons, service cards, settings rows, month navigation
  - Medium haptics: Calendar day selection, customer details, QR code generation, data operations
  - Heavy haptics: Floating action button (primary actions)
- Fixed booking page 404 error - now serving correctly at /book/:slug
- Created `getBookingDomain()` helper function to centralize production domain handling
- Updated all booking link references to use new helper
- Verified production domain bookflowx.cerolauto.store is properly configured across all features
- **APP STORE READY (Dec 24, 2025):**
  - ✅ Booking page HTML loaded into memory for production reliability
  - ✅ Business initialization error logging improved
  - ✅ All core services verified working (Web app, API, Booking page)
  - ✅ ErrorBoundary wrapping entire app
  - ✅ App configuration (app.json) complete with bundle IDs, icons, splash screen
  - ✅ Version set to 1.0.0
  - ✅ All 5 dashboard screens functional
  - ✅ Public booking flow fully operational
  - ✅ Database schema and API integration complete

## Service Editor Features (Completed Dec 24, 2025)
✅ **Fully Functional Service Editor** with:
- Service Details tab: name, duration, price, description inputs
- Links management tab: Add/remove/organize service links
- Link categories: gallery, video, external, social
- Tab-based navigation with link count badge
- Haptic feedback on all interactions
- Form validation (name, duration required)
- Save and Cancel actions
- Link cards with remove functionality

## Next Phase Features
- User authentication/login
- Payment processing (Stripe)
- Email/SMS notifications
- Multi-location support
- Advanced analytics
- ServiceEditor API integration (server-side link persistence)
