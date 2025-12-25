# BookFlow - Multi-Tenancy Booking Platform MVP

## Overview
BookFlow is a scalable multi-tenant booking platform designed to serve various businesses through a single application. It provides both a public booking flow for customers and a comprehensive admin dashboard for business owners. The platform focuses on a premium user experience with a sophisticated design, oversized typography, and cinematic animations. It aims to provide a robust, app-store-ready solution for appointment and service management across multiple business verticals.

## User Preferences
- **Communication Style**: I prefer clear, concise, and direct communication.
- **Explanation Style**: Provide detailed explanations for complex concepts or decisions.
- **Workflow**: I prefer an iterative development approach.
- **Interaction**: Ask before making major architectural changes or introducing new dependencies.
- **Codebase Changes**:
    - Do not change the fundamental premium black & white color scheme.
    - Prioritize robust error handling and graceful fallbacks.
    - Ensure new features integrate seamlessly with existing haptic feedback patterns.
    - When updating dependencies, prioritize stability and production readiness.

## System Architecture
BookFlow is built with a decoupled frontend and backend architecture.

### UI/UX Decisions
- **Color Palette**: Premium black & white (`Pure Black`, `Charcoal`, `Graphite`, `Smoke`, `Silver`, `Pearl`).
- **Typography**: Oversized hierarchy (`Display 72-96px`, `H1 48-56px`, `Body 18-24px`).
- **Animation**: Spring physics with cinematic transitions (400ms ease-out for screen transitions).
- **Components**: Utilizes custom components like Circular Meters, Animated Cards, and Line Graphs with Bezier curves.
- **Haptic Feedback**: Comprehensive haptic feedback (Light, Medium, Heavy) implemented across all interactive elements for enhanced user experience.

### Technical Implementations
- **Frontend**: React Native (Expo) for cross-platform mobile and web interfaces. It features a 5-tab admin dashboard and a public booking flow. API communication is handled via `client/lib/api.ts` with a resilient `getApiUrl()` for Replit development and production environments.
- **Backend**: Express.js server running on port 5000, providing a multi-tenant REST API. It uses Drizzle ORM for PostgreSQL database interactions. Public booking pages are served at `/book/:businessSlug`.
- **Database**: PostgreSQL with a multi-tenant schema that includes tables for `businesses`, `services`, `customers`, `bookings`, `availability`, and `pushTokens`.
- **Navigation**: Structured with `MainTabNavigator` for admin functions and `BookingFlowNavigator` for the public booking process, alongside modal screens for editors.
- **Push Notifications**: Integrated with Expo Push Notifications for informing business owners of new bookings, including permission handling and token management.

### Feature Specifications
- **Dashboard**: Displays revenue metrics and booking graphs.
- **Calendar**: Day selection with booking previews.
- **Service Management**: CRUD operations for services.
- **Customer Management**: Lists customers with booking counts.
- **Settings**: Data management, booking link sharing, and notification settings.
- **Public Booking Flow**: A 4-screen process (Service → Time → Checkout → Confirmation) accessible via unique business slugs.
- **Demo Data**: Multi-business-type demo data feature with 5 pre-configured business verticals (Salon, Auto Detailing, Solar Installation, Coaching, Fitness) for showcase purposes.
- **QR Code Generation**: For sharing booking links.

### System Design Choices
- **Multi-Tenancy**: Implemented at the API and database levels, ensuring data isolation per business.
- **API Connectivity**: Robust `getApiUrl()` function handles dynamic environment detection for seamless operation across development (Replit, localhost), Expo Go, and production builds.
- **Error Handling**: Implemented client-side retry logic for initialization and server-side checks for duplicate business creation.
- **Production Readiness**: Addressed iOS-specific issues like animation bugs with `AnimatedPressable`, ensuring save operations persist correctly by awaiting asynchronous calls before UI dismissal, and adding necessary iOS permission declarations in `app.json`.

## External Dependencies
- **React Native (Expo)**: Frontend framework.
- **Express.js**: Backend web framework.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Database ORM for Node.js.
- **Expo Push Notifications Service**: For sending push notifications.
- **Stripe**: (Planned for next phase) Payment processing.
- **Twilio (or similar)**: (Planned for next phase) SMS notifications.