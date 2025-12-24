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
  - `EXPO_PUBLIC_DOMAIN`: Set to `elegant-canvas--wealthmastermin.replit.app` for production
  - Auto-detects Replit dev domains and routes to localhost:5000 for development
  
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

## Testing & Deployment
- Local dev: Run `npm run server:dev && npm run expo:dev`, access web version at http://localhost:8081
- TestFlight: App needs static build with `EXPO_PUBLIC_DOMAIN=elegant-canvas--wealthmastermin.replit.app`
- Booking flow: Navigate to `/book/demo-business` to test public booking

## Notes
- Prices stored in cents (integer) in database, divided by 100 for display
- Demo business auto-created as "demo-business" slug if none exists
- Public booking URL format: http://localhost:5000/book/{businessSlug}
- QR codes redirect to booking page via generated QR code endpoint

## Next Phase Features
- ServiceEditor form implementation with API save
- User authentication/login
- Payment processing (Stripe)
- Email/SMS notifications
- Multi-location support
- Advanced analytics
