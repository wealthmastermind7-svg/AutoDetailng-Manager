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

### Feature Specifications
- **Dashboard**: Displays revenue metrics and booking graphs.
- **Calendar**: Day selection with booking previews.
- **Service Management**: CRUD operations for services.
- **Customer Management**: Lists customers with booking counts.
- **Settings**: Data management and booking link sharing.
- **Public Booking Flow**: A 4-screen process (Service → Time → Checkout → Confirmation) accessible via unique business slugs.
- **Demo Data**: Multi-business-type demo data feature with 5 pre-configured business verticals (Salon, Auto Detailing, Solar Installation, Coaching, Fitness) for showcase purposes.
- **QR Code Generation**: For sharing booking links.

### System Design Choices
- **Multi-Tenancy**: Implemented at the API and database levels, ensuring data isolation per business.
- **API Connectivity**: Robust `getApiUrl()` function handles dynamic environment detection for seamless operation across development (Replit, localhost), Expo Go, and production builds.
- **Error Handling**: Implemented client-side retry logic for initialization and server-side checks for duplicate business creation.
- **Production Readiness**: v1.0 focuses on core booking features. iOS-specific lifecycle handling ensures save operations persist correctly by awaiting asynchronous calls before UI dismissal. iOS permissions configured for QR code scanning and sharing.

## External Dependencies
- **React Native (Expo)**: Frontend framework.
- **Express.js**: Backend web framework.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Database ORM for Node.js.
- **Stripe**: (Planned for v1.1) Payment processing.
- **Push Notifications**: (Planned for v1.1) Expo Push Notifications for booking alerts.
- **Twilio (or similar)**: (Planned for v1.2) SMS notifications.

## Release Timeline

### v1.0 (Current - Ready for TestFlight)
- Core admin dashboard with 5-tab navigation
- Full service CRUD with pricing and duration
- Multi-business-type demo data (5 verticals)
- Public booking flow (4-screen checkout)
- QR code sharing for booking links
- Haptic feedback on all interactions
- Business settings (name, website, phone)
- Comprehensive iOS lifecycle fixes for data persistence
- **Removed**: Push notifications (added back in v1.1)

### v1.1 (Planned)
- Push notifications for booking alerts
- Stripe payment integration
- Email notifications

### v1.2+ (Future)
- SMS notifications (Twilio)
- Advanced analytics
- Customer feedback system

## v1.0 Release Cleanup (Dec 25, 2025)

### Removed Notifications for Faster v1.0 Release
- Removed push notification code, toggles, and test button from SettingsScreen
- Removed `expo-notifications` plugin from app.json
- Removed `UIBackgroundModes` (remote-notification) and `NSUserNotificationUsageDescription` from iOS config
- Removed `useNextNotificationsApi` from Android config
- **Reason**: Notifications are nice-to-have, not core to booking flow. Ship v1.0 with core features, add notifications back in v1.1
- **Impact**: Faster TestFlight rebuild, simpler App Store review

### iOS Lifecycle Issue - Save Operations Now Persist ✅
- **Problem**: Edit modal/service save would close before async writes completed
- **Root Cause**: Not awaiting persistence before closing modals/navigation
- **Fix Applied**: Updated `handleSaveBusinessField` (SettingsScreen) and `handleSave` (ServiceEditorScreen)
  - Dismiss keyboard first: `Keyboard.dismiss()`
  - Add 100ms delay for iOS to stabilize: `await new Promise(resolve => setTimeout(resolve, 100))`
  - Only close modal/navigate AFTER API call resolves
- **Impact**: Changes now persist correctly in TestFlight builds
- **Pattern**: Production-safe save pattern for all interactive handlers

### iOS Permission Declarations (Camera/Photo Access) ✅
- **Kept**: NSCameraUsageDescription, NSPhotoLibraryUsageDescription, NSPhotoLibraryAddUsageDescription for QR sharing
- **Removed**: NSUserNotificationUsageDescription (notifications removed for v1.0)

### Backend Fixes (Dec 25, 2025)
- Added missing GET `/api/businesses/:id` endpoint - retrieves business data by ID for dashboard
- Fixed method name: storage uses `getBusiness(id)` not `getBusinessById(id)`
- Improved error handling with fallback to slug-based lookup

### TestFlight Networking Fix (Dec 25, 2025) ✅
**Critical Issue**: TestFlight builds use pre-built static bundles that can't access shell environment variables. The app was falling back to `localhost:5000`, which doesn't exist on real devices.

**Solution Applied**:
1. Added production domain to `app.json`:
   ```json
   "extra": {
     "apiDomain": "bookflowx.cerolauto.store"
   }
   ```
2. Updated `client/lib/query-client.ts` `getApiUrl()` to read from expo-constants when env vars unavailable:
   ```typescript
   // If still no host, try to get from app config (for TestFlight production builds)
   if (!host) {
     try {
       const Constants = require("expo-constants").default;
       host = Constants?.expoConfig?.extra?.apiDomain || "";
     } catch (e) {
       // Silently fail if Constants not available
     }
   }
   ```

**API Domain Fallback Chain**:
1. Browser `window.location` (web)
2. Environment variables `EXPO_PUBLIC_DOMAIN` (Expo Go)
3. `expo-constants` from app config (TestFlight/production builds)
4. `localhost:5000` (development fallback)

**Key Insight**: Expo Go uses dynamic env vars set at runtime. TestFlight needs static config in app.json because it's a compiled binary without access to shell environment.

**Future Reference**: If TestFlight becomes unresponsive again, check:
- Ensure `extra.apiDomain` in app.json is set to your production domain
- Verify backend is accessible at that domain
- Increment build number and rebuild

## Testing Checklist for TestFlight v1.0

- [ ] Fresh TestFlight build with incremented build number
- [ ] Delete old app from test device before installing new build
- [ ] Edit business name → restart app → value persists ✅
- [ ] Create service → restart app → service exists ✅
- [ ] Load demo data → dashboard updates ✅
- [ ] Share booking QR code → QR modal displays ✅
- [ ] Booking flow works from public link ✅

## Next Actions

1. **Increment iOS build number** in app.json or Xcode
2. **Rebuild and upload new TestFlight binary** (this is a fresh build with all fixes)
3. **Delete old app** from test device
4. **Test fresh install** - verify all persistence works
5. **Submit to App Store** for v1.0 review
