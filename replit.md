# BookFlow - Multi-Tenancy Booking Platform MVP

## Project Overview
A premium mobile and web booking platform built with React Native (Expo), Express.js, and AsyncStorage. Features a sophisticated black/white color scheme with oversized typography, cinematic animations, and circular progress meters.

## Design System
- **Color Palette**: Premium black & white (Pure Black, Charcoal, Graphite, Smoke, Silver, Pearl)
- **Typography**: Oversized hierarchy (Display 72-96px, H1 48-56px, Body 18-24px)
- **Animation**: Spring physics with cinematic transitions (400ms ease-out for screens)
- **Components**: Circular meters, animated cards, line graphs with bezier curves

## Architecture
### Frontend (React Native)
- 5-tab admin dashboard (Home, Calendar, Services, Customers, Settings)
- Public booking flow (Service → Time → Checkout → Confirmation)
- Reusable components: CircularMeter, AnimatedMetricCard, LineGraph, BookingCard, ServiceCard, CustomerCard
- AsyncStorage for local persistence

### Backend (Express.js)
- Running on port 5000
- REST API endpoints for services, bookings, customers
- Static file serving

### Navigation Structure
- MainTabNavigator: 5 tabs for admin
- BookingFlowNavigator: 4-screen booking flow
- Modal screens: Service editor with cancel/save

## MVP Features Completed
✓ Dashboard with revenue metrics and booking graphs
✓ Calendar with day selection and booking preview
✓ Services management (CRUD ready)
✓ Customers list with booking counts
✓ Settings screen with data management
✓ Public booking flow (all 4 screens)
✓ AsyncStorage data persistence with demo data
✓ Premium UI components with animations

## Data Models
- Service: id, name, duration, price, description
- Booking: id, customerId, serviceId, date, time, status, totalPrice
- Customer: id, name, email, phone, totalBookings

## Next Phase Features
- Form implementation for service/customer editing
- Backend API integration
- User authentication/multi-tenancy
- Payment processing (Stripe)
- Email/SMS notifications
- Multi-location support
- Advanced analytics
