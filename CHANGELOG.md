# QuoteFlo Changelog

All notable changes to this project are documented in this file.

---

## [Step 12] - Loading Skeletons & UI Polish

### Added
- **Skeleton Component** (`src/components/ui/skeleton.tsx`)
  - Base `Skeleton` component with pulse animation
  - Pre-built patterns: `SkeletonCard`, `SkeletonTable`, `SkeletonStats`
  - Page-specific skeletons: `SkeletonQuoteDetail`, `SkeletonCustomerDetail`, `SkeletonDashboard`, `SkeletonAnalytics`, `SkeletonSettings`

- **Loading States for All Pages**
  - `src/app/dashboard/loading.tsx` - Dashboard skeleton
  - `src/app/quotes/loading.tsx` - Quotes list skeleton
  - `src/app/quotes/[id]/loading.tsx` - Quote detail skeleton
  - `src/app/customers/loading.tsx` - Customers list skeleton
  - `src/app/customers/[id]/loading.tsx` - Customer detail skeleton
  - `src/app/analytics/loading.tsx` - Analytics skeleton
  - `src/app/settings/loading.tsx` - Settings skeleton

- **Instant Navigation Feedback** (`src/components/dashboard-shell.tsx`)
  - Top loading bar animation when navigating
  - Spinner icon on clicked nav item
  - Content fades to 60% opacity during navigation
  - Uses React's `useTransition` for non-blocking updates
  - Prevents double-clicks during navigation

- **Loading Bar Animation** (`src/app/globals.css`)
  - Smooth animated loading bar at top of screen
  - Brand-colored with subtle animation

### Changed
- **Card Component** (`src/components/ui/card.tsx`)
  - Fixed background color to explicitly use `bg-white` instead of `bg-card` CSS variable
  - Added `border-surface-200` for consistent border color
  - Ensures all modals have correct white background

- **Dashboard Shell** - Converted from Link components to buttons with programmatic navigation for instant feedback

### How It Works
1. **Instant feedback**: When you click a nav link, the icon immediately changes to a spinner
2. **Top loading bar**: A brand-colored bar animates across the top of the screen
3. **Content fades**: The current page content fades slightly to indicate loading
4. **Skeleton shows**: Next.js then shows the loading skeleton while fetching data
5. **Content appears**: Finally, the actual page content loads

---

## [Step 11] - Enhanced Customer Management

### Added
- **Database Migration** (`supabase/migrations/step11_enhanced_customers.sql`)
  - Added `emails` and `phones` array columns for multiple contact methods
  - Added `merged_from` array to track merged customer IDs
  - `ensure_customer_from_quote()` trigger function - automatically creates/links customers when quotes are created
  - `merge_customers()` function - combines two customers into one
  - Backfill script to create customer records for existing quotes without customer_id

- **Customer Detail Page** (`src/app/customers/[id]/page.tsx`)
  - Full customer profile with all contact information
  - Stats cards: total quotes, won quotes, total value, won value
  - Complete quote history with status, date, and value
  - Support for multiple emails and phones with "Primary" badge

- **Customer Actions** (`src/app/customers/[id]/customer-actions.tsx`)
  - **Edit Customer**: Update name, add/remove multiple emails and phones, address, postcode, notes
  - **Delete Customer**: Confirmation modal, unlinks quotes before deleting
  - **Merge Customers**: Search and select another customer to merge into current one
    - Combines all emails and phones
    - Transfers all quotes to primary customer
    - Appends notes from merged customer

- **Improved Customers List** (`src/app/customers/page.tsx`)
  - Cards are now clickable (link to detail page)
  - Fixed quote count - now properly counts linked quotes
  - Shows total value and won count per customer
  - Displays badges for multiple emails/phones (+N indicator)
  - Info banner when orphan quotes exist (quotes without customer_id)

### Changed
- Updated `src/types/index.ts` - Customer type now includes `emails`, `phones`, `merged_from`, `updated_at`
- Updated `src/components/ui/button.tsx` - Fixed destructive variant colors

### How It Works
1. **Auto-linking**: When you create a quote, the system automatically:
   - Searches for existing customer by email
   - If not found, searches by name + postcode
   - Creates new customer if no match found
   - Links the quote to the customer

2. **Multiple Contact Methods**: Customers can have multiple emails and phones
   - First entry is marked as "Primary"
   - New contact info from quotes is automatically added if not already present

3. **Merging**: When you merge customers:
   - All unique emails/phones are combined
   - All quotes are transferred to the primary customer
   - Notes are appended
   - Secondary customer is deleted

### Required Migration
Run `supabase/migrations/step11_enhanced_customers.sql` to:
- Add new columns to customers table
- Create trigger for auto-linking quotes to customers
- Backfill existing quotes with customer records

---

## [Step 10] - Analytics Dashboard

### Added
- **Analytics Page** (`src/app/analytics/page.tsx`)
  - Comprehensive analytics dashboard for tracking quoting performance
  - Period comparison: current 30 days vs previous 30 days with % change indicators
  - Key metrics: quotes created, total value, won quotes, conversion rate
  
- **Conversion Funnel**
  - Visual funnel showing: Created → Sent → Viewed → Accepted/Declined
  - Percentage breakdown at each stage
  - Color-coded status bars

- **Performance Metrics**
  - Average quote value
  - Average accepted quote value
  - Average time to accept (in hours/days)
  - View rate (% of sent quotes that were opened)

- **Charts** (`src/app/analytics/analytics-charts.tsx`)
  - Quotes over time: 6-month bar chart showing quote count and value
  - Status distribution: Donut chart with breakdown by status
  - Interactive tooltips on hover
  - Empty states for new users

- **Top Customers**
  - Top 5 customers by total quote value
  - Shows quote count and won count per customer
  - Customer avatar with initial

- **All-Time Summary**
  - Total quotes created
  - Total value quoted
  - Total value won
  - Overall win rate

- **Navigation**
  - Added "Analytics" link to sidebar navigation with chart icon

### Changed
- Updated `src/components/dashboard-shell.tsx` to include Analytics in navigation

---

## [Step 9] - Stripe Billing

### Added
- **Database Schema Updates** (`supabase/migrations/step9_billing.sql`)
  - `user_profiles` table: Added `trial_ends_at`, `stripe_subscription_id`, `stripe_price_id`, `billing_cycle_anchor` columns
  - New `billing_events` table for audit trail of billing events
  - SQL functions: `is_subscription_active()` and `get_trial_days_remaining()`
  - Updated `handle_new_user()` trigger to set 14-day trial

- **Stripe Integration** (`src/lib/stripe.ts`)
  - Stripe client initialization
  - Price configuration and plan definitions
  - Helper functions for formatting and URLs

- **API Endpoints**
  - `POST /api/billing/checkout` - Create Stripe Checkout session for upgrades
  - `POST /api/billing/portal` - Create Stripe Customer Portal session
  - `POST /api/billing/webhook` - Handle Stripe webhook events

- **Settings Page Updates** (`src/app/settings/settings-form.tsx`)
  - New `SubscriptionCard` component with:
    - Trial status and days remaining
    - Upgrade button (redirects to Stripe Checkout)
    - Manage billing button (opens Stripe Customer Portal)
    - Success/cancel message handling
    - Feature list for Professional plan

- **TypeScript Types** (`src/types/index.ts`)
  - Added `stripe_subscription_id`, `stripe_price_id`, `trial_ends_at` to `UserProfile`

- **Dependencies**
  - Added `stripe` package

### Webhook Events Handled
- `checkout.session.completed` - User completed checkout
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed (updates status to past_due)

---

## [Step 8] - Automated Follow-ups & Reminders

### Fixed
- **TypeScript Build Errors** - Fixed all implicit `any` types that caused Vercel build failures:
  - `src/lib/supabase/middleware.ts` - Added `CookieToSet` type for `cookiesToSet` parameter
  - `src/lib/supabase/server.ts` - Added `CookieToSet` type for `cookiesToSet` parameter
  - `src/app/api/quotes/[id]/pdf/route.ts` - Changed `any` types to proper `Quote`, `QuoteLineItem`, `UserProfile` types
  - `src/app/api/quotes/[id]/pdf/public/route.ts` - Changed `any` types to proper types
- **Next.js 15 Suspense Boundary** - Fixed `useSearchParams()` error:
  - `src/app/(auth)/login/page.tsx` - Wrapped component in Suspense boundary
  - `src/app/quotes/quotes-filter.tsx` - Removed unused `useSearchParams` import
- **SSR Window Access** - Fixed `window is not defined` errors during build:
  - `src/app/quotes/[id]/quote-detail-actions.tsx` - Added typeof check for window
  - `src/app/(auth)/forgot-password/page.tsx` - Added typeof check for window

### Added
- **Database Schema Updates** (`supabase/migrations/step8_reminders.sql`)
  - `user_profiles` table: Added `auto_followup_enabled`, `auto_followup_days`, `expiry_reminder_enabled`, `expiry_reminder_days` columns
  - `quotes` table: Added `follow_up_count`, `last_follow_up_at`, `expiry_reminder_sent`, `expiry_reminder_sent_at` columns
  - New `notification_log` table for audit trail of all sent notifications
  - SQL functions: `get_quotes_needing_followup()` and `get_quotes_expiring_soon()`

- **API Endpoints**
  - `POST /api/quotes/[id]/follow-up` - Send manual follow-up email for a quote
  - `POST /api/cron/reminders` - Automated cron endpoint for batch processing follow-ups and expiry reminders

- **Settings Page Updates** (`src/app/settings/settings-form.tsx`)
  - New "Automated Follow-ups" card with toggle switches
  - Auto follow-up configuration (1-7 days after sending, up to 3 follow-ups)
  - Expiry reminder configuration (1-7 days before quote expires)

- **Quote Detail Page Updates** (`src/app/quotes/[id]/page.tsx`)
  - "Follow-up" button showing count (e.g., "Follow-up (1/3)")
  - Activity timeline now shows follow-up events and expiry reminder events

- **TypeScript Types** (`src/types/index.ts`)
  - Added notification preference fields to `UserProfile`
  - Added follow-up tracking fields to `Quote`
  - New types: `NotificationLog`, `NotificationType`, `NotificationChannel`, `NotificationStatus`

- **Vercel Configuration** (`vercel.json`)
  - Pre-configured cron job to run daily at 9 AM UTC

- **Environment Variables** (`.env.example`)
  - `SUPABASE_SERVICE_ROLE_KEY` - Required for cron jobs
  - `CRON_SECRET` - For authenticating cron requests

### Changed
- Updated `src/app/quotes/[id]/quote-detail-actions.tsx` to include follow-up button and state management

---

## [Step 7] - Search & Filtering

### Added
- **Quotes Page** (`src/app/quotes/page.tsx`)
  - Search by customer name, email, or quote number
  - Status filter tabs: All, Draft, Sent, Viewed, Accepted, Declined
  - Each tab shows count badge
  - URL params support for bookmarkable filters

- **Quotes Filter Component** (`src/app/quotes/quotes-filter.tsx`)
  - Client-side filter component with search input
  - Status filter buttons with active state

- **Customers Page** (`src/app/customers/page.tsx`)
  - Search by name, email, phone, or postcode

- **Customers Search Component** (`src/app/customers/customers-search.tsx`)
  - Client-side search input component

---

## [Step 6 Fixes] - Bug Fixes & Improvements

### Added
- **Public PDF Download** (`src/app/api/quotes/[id]/pdf/public/route.ts`)
  - New API route for unauthenticated PDF downloads
  - "Download PDF" button on public quote page

- **Download PDF Button** (`src/app/q/[token]/download-pdf-button.tsx`)
  - Client component for PDF download on public page

### Fixed
- **Dashboard Quick Actions** - Now shows real counts instead of hardcoded values
- **Duplicate Service Items** - Adding same service now increments quantity instead of creating duplicate line
- **Quote Items on Public Page** - Required RLS policy update (documented in README)

### Changed
- Updated `src/app/q/[token]/page.tsx` to include download PDF button
- Updated `src/app/dashboard/page.tsx` with real counts
- Updated `src/app/quotes/new/quote-form.tsx` to handle duplicate services
- Updated `src/app/quotes/[id]/edit/edit-quote-form.tsx` to handle duplicate services

---

## [Step 6] - Quote Editing

### Added
- **Edit Quote Page** (`src/app/quotes/[id]/edit/page.tsx`)
  - Server component wrapper for edit form

- **Edit Quote Form** (`src/app/quotes/[id]/edit/edit-quote-form.tsx`)
  - Full quote editing with same UI as creation
  - Edit customer details, job description, line items
  - Service library picker
  - Auto-recalculates totals
  - Tracks new vs existing items for proper database updates

- **Quote Detail Actions** (`src/app/quotes/[id]/quote-detail-actions.tsx`)
  - Client component for Send, PDF, Copy Link, Preview actions
  - Edit button (only for draft, sent, viewed quotes)

- **Delete Quote Card** (`src/app/quotes/[id]/delete-quote-card.tsx`)
  - Confirmation UI before deleting

- **Delete Quote API** (`src/app/api/quotes/[id]/route.ts`)
  - DELETE endpoint for removing quotes

### Changed
- Updated `src/app/quotes/[id]/page.tsx` to use new action components

---

## [Step 5] - Settings & Customer Management

### Added
- **Settings Page** (`src/app/settings/page.tsx`, `src/app/settings/settings-form.tsx`)
  - Edit company name, phone, postcode
  - Change trade (updates service library)
  - Brand color picker (10 colors)
  - Live preview of branding
  - Subscription status display

- **Customers Page** (`src/app/customers/page.tsx`)
  - Grid view of all customers
  - Customer avatars, contact info, quote counts

- **Add Customer Button** (`src/app/customers/add-customer-button.tsx`)
  - Modal form for adding new customers
  - "Quote" button to start quote with customer pre-filled

### Changed
- Updated quote form to support pre-selecting customer from URL params

---

## [Step 4] - Quote Delivery (PDF, Email, Public View)

### Added
- **PDF Generation** (`src/app/api/quotes/[id]/pdf/route.ts`)
  - Professional HTML quote document
  - Opens in browser for printing/saving

- **Email Sending** (`src/app/api/quotes/[id]/send/route.ts`)
  - Sends quote via Resend
  - Beautiful HTML email template
  - Works without Resend (marks as sent)

- **Public Quote Page** (`src/app/q/[token]/page.tsx`)
  - Customer-facing quote view
  - Accept/Decline buttons
  - Marks as "viewed" when opened
  - Company contact info
  - Handles expired quotes

- **Quote Actions** (`src/app/q/[token]/quote-actions.tsx`)
  - Client component for Accept/Decline functionality

### Dependencies Added
- `@react-pdf/renderer` - PDF generation
- `resend` - Email sending

---

## [Step 3] - Quote Creation

### Added
- **Quotes List Page** (`src/app/quotes/page.tsx`)
  - Shows all quotes with status badges
  - Empty state for new users

- **Quote Form** (`src/app/quotes/new/page.tsx`, `src/app/quotes/new/quote-form.tsx`)
  - Customer details form
  - Job description field
  - Service library picker grouped by category
  - Compliance badges (Part P, Gas Safe, Building Regs)
  - Line items with quantity, unit price, totals
  - Auto-calculating subtotal, VAT, total
  - Save as Draft or Save & Send

- **Quote Detail Page** (`src/app/quotes/[id]/page.tsx`)
  - Full quote details with status
  - Customer info with contact details
  - Line items breakdown
  - Activity timeline

---

## [Step 2] - Authentication

### Added
- **Auth Layout** (`src/app/(auth)/layout.tsx`)
  - Clean wrapper for auth pages

- **Signup Page** (`src/app/(auth)/signup/page.tsx`)
  - Two-step flow: trade selection → details
  - Trade options: Electrician, Plumber, Builder

- **Login Page** (`src/app/(auth)/login/page.tsx`)
  - Email/password login
  - Redirect support

- **Forgot Password** (`src/app/(auth)/forgot-password/page.tsx`)
  - Password reset request

- **Reset Password** (`src/app/(auth)/reset-password/page.tsx`)
  - Set new password

- **Auth Helpers** (`src/lib/auth.ts`)
  - `getUser()`, `getUserProfile()`, `requireAuth()`, `requireAuthWithProfile()`

### Changed
- Updated dashboard to fetch real user data
- Added working logout button to dashboard shell

---

## [Step 1] - Foundation

### Added
- **Project Setup**
  - Next.js 15 + TypeScript + Tailwind CSS
  - shadcn/ui components (Button, Card, Input, Label, Badge)
  - Supabase client configuration

- **Database Schema** (`supabase/schema.sql`)
  - `user_profiles` table
  - `customers` table
  - `quotes` table
  - `quote_line_items` table
  - `service_library` table with 40+ pre-loaded services
  - Row Level Security policies
  - Triggers for quote number generation and total calculation

- **UI Components**
  - QuoteFlo logo component
  - Responsive dashboard shell with mobile sidebar

- **Pages**
  - Landing page with hero, features, pricing
  - Dashboard with stats cards

- **Middleware** (`middleware.ts`)
  - Protected routes configuration

---

## Database Migrations

### Required SQL Scripts (run in order)

1. **Initial Schema** - `supabase/schema.sql`
   - Run when first setting up the project

2. **Step 6 Fix: Public Line Items Access**
   ```sql
   CREATE POLICY "Anyone can view quote line items" ON quote_line_items
     FOR SELECT USING (true);
   ```

3. **Step 8: Reminders** - `supabase/migrations/step8_reminders.sql`
   - Run to enable automated follow-ups and reminders

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - Email sending
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_DOMAIN=yourdomain.com

# Optional - Automated reminders (Step 8)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret_string

# Future - Stripe billing
# STRIPE_SECRET_KEY=your_stripe_secret_key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Future - SMS
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number
```
