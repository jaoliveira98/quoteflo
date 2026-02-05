# QuoteFlo Changelog

All notable changes to this project are documented in this file.

---

## [Step 8] - Automated Follow-ups & Reminders

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
