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

### Backend (Express.js + PostgreSQL)
- Running on port 5000
- Multi-tenant REST API with businessId filtering
- Drizzle ORM for database operations
- Public booking page served at `/book/:businessSlug`

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
✓ Public booking flow (all 4 screens) at /book/:businessSlug
✓ PostgreSQL database with multi-tenant schema
✓ Full API integration (all screens use backend API)
✓ Demo data initialization
✓ Premium UI components with animations

## API Endpoints
- GET/POST /api/business - Business management
- GET/POST /api/services - Service CRUD (businessId filtered)
- GET/POST /api/bookings - Booking CRUD (businessId filtered)
- GET /api/customers - Customer list (businessId filtered)
- GET /api/stats - Dashboard statistics
- POST /api/demo-data - Initialize demo data
- DELETE /api/data - Clear all business data

## Key Files
- `shared/schema.ts` - Database schema definitions
- `server/storage.ts` - Database operations
- `server/routes.ts` - API route handlers
- `server/templates/booking.html` - Public booking page
- `client/lib/api.ts` - Frontend API client
- `client/screens/*.tsx` - Admin dashboard screens

## Notes
- Prices stored in cents (integer) in database, divided by 100 for display
- Demo business auto-created as "demo-business" slug if none exists
- Public booking URL format: /book/{businessSlug}

## Next Phase Features
- ServiceEditor form implementation with API save
- User authentication/login
- Payment processing (Stripe)
- Email/SMS notifications
- Multi-location support
- Advanced analytics
