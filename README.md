# QuoteFlo

> Professional quotes in under 5 minutes for UK tradespeople.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Supabase account (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings → API** and copy:
   - Project URL
   - Anon/Public key

3. Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it

This creates:
- All tables (user_profiles, quotes, quote_line_items, customers, service_library)
- Row Level Security policies
- Indexes for performance
- Seed data for the service library (40+ pre-loaded services)

### 4. Enable Auth

1. In Supabase, go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. (Optional) Configure email templates under **Email Templates**

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. Set Up Automated Follow-ups (Optional)

To enable automated follow-up emails and expiry reminders:

1. Run the Step 8 migration in Supabase SQL Editor:
   - Copy the contents of `supabase/migrations/step8_reminders.sql`
   - Paste and run it

2. Add environment variables:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CRON_SECRET=your_random_secret_string
   ```

3. **For Vercel deployment:** Cron jobs are pre-configured in `vercel.json` to run daily at 9 AM UTC. The endpoint accepts both GET and POST (Vercel uses GET); ensure `CRON_SECRET` is set so only your scheduler can call it.

4. **For other hosts:** Set up a cron job to call:
   ```
   POST /api/cron/reminders
   Authorization: Bearer your_cron_secret
   ```

### 7. Set Up Stripe Billing (Optional)

To enable subscription billing:

1. Run the Step 9 migration in Supabase SQL Editor:
   - Copy the contents of `supabase/migrations/step9_billing.sql`
   - Paste and run it

2. Create a Stripe account at [stripe.com](https://stripe.com)

3. In Stripe Dashboard:
   - Create a Product called "QuoteFlo Professional"
   - Add a Price: £19/month recurring
   - Copy the Price ID (starts with `price_`)

4. Add environment variables:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxxxxxxxxxxx
   ```

5. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 📁 Project Structure

```
quoteflo/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard
│   │   ├── quotes/            # Quotes pages (coming soon)
│   │   ├── customers/         # Customers pages (coming soon)
│   │   └── settings/          # Settings pages (coming soon)
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── logo.tsx           # QuoteFlo logo
│   │   └── dashboard-shell.tsx # App shell with navigation
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   └── supabase/          # Supabase client setup
│   └── types/
│       └── index.ts           # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── public/                     # Static assets
└── middleware.ts              # Auth middleware
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Icons:** Lucide React

## 📋 Development Roadmap

### ✅ Step 1: Foundation (Complete)
- [x] Project setup
- [x] Tailwind + UI components
- [x] Supabase configuration
- [x] Database schema
- [x] App shell with navigation
- [x] Landing page
- [x] Dashboard layout

### ✅ Step 2: Authentication (Complete)
- [x] Sign up page with trade selection
- [x] Login page
- [x] Password reset
- [x] Profile completion

### ✅ Step 3: Quote Creation (Complete)
- [x] Quote form
- [x] Line items management
- [x] Service library picker
- [x] Price calculations
- [x] VAT handling

### ✅ Step 4: Quote Management (Complete)
- [x] Quotes list page
- [x] Quote detail view
- [x] Edit quotes
- [x] Duplicate quotes

### ✅ Step 5: Sending Quotes (Complete)
- [x] PDF generation
- [x] Email sending (Resend)
- [x] SMS sending (Twilio)
- [x] Public quote view page

### ✅ Step 6: Customer Management (Complete)
- [x] Customer list
- [x] Add/edit customers
- [x] Customer quote history

### ✅ Step 7: Settings & Billing (Complete)
- [x] Company settings
- [x] Branding customization
- [x] Stripe integration
- [x] Subscription management

### ✅ Step 8: Automated Follow-ups & Reminders (Complete)
- [x] Auto follow-up emails for unviewed quotes
- [x] Quote expiry reminders
- [x] Notification preferences in settings
- [x] Manual follow-up from quote detail
- [x] Activity timeline with follow-up events
- [x] Cron endpoint for automated processing

### ✅ Step 9: Stripe Billing (Complete)
- [x] Stripe integration
- [x] 14-day free trial
- [x] £19/month Professional plan
- [x] Stripe Checkout for upgrades
- [x] Customer Portal for subscription management
- [x] Webhook handling for subscription events
- [x] Trial countdown in settings

## 🎨 Brand Colors

```css
/* Primary Green */
--brand-500: #22c55e;
--brand-600: #16a34a;

/* Surface (Slate) */
--surface-900: #0f172a;
--surface-600: #475569;
--surface-100: #f1f5f9;
```

## Testing

- **Unit:** `npm run test:unit` — runs Vitest tests (e.g. `escapeHtml` in `src/lib/utils.test.ts`).
- **E2E:** `npm run test:e2e` — runs Playwright tests against the app.
- **XSS E2E:** To run the public-quote XSS test, run `supabase/seed_xss_test_quote.sql` in your Supabase SQL Editor (once), then set `TEST_XSS_QUOTE_TOKEN=aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee` (or the token from the seeded quote) when running `npm run test:e2e`.

## Project root

Config files live in the root (that’s where Next, Vercel, TypeScript, etc. look for them): `components.json` (shadcn), `middleware.ts`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `vercel.json`, `vitest.config.ts`, `playwright.config.ts`. Plus `.storybook/`, `e2e/`, `src/`, `supabase/`.

## 📝 License

MIT

---

Built with ❤️ for UK tradespeople.
