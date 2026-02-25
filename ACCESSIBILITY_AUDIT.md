# QuoteFlo Accessibility Audit Report

**Standard:** WCAG 2.1 Level AA (EU EN 301 549 / UK Equality Act 2010)
**Date:** 25 February 2026
**Tool:** axe-core 4.11 via Playwright + manual code review
**Pages Scanned:** 17 (8 public, 9 authenticated)

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 1 | Blocks assistive-technology users entirely |
| Serious  | 6 | Major barriers for disabled users |
| Moderate | 4 | Usability issues for assistive-technology users |
| Minor    | 8 | Best-practice improvements |
| **Total** | **19** | |

---

## 1. Critical Issues

### 1.1 Unlabelled Select / Combobox — Quotes Filter Date Picker

| Field | Value |
|-------|-------|
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Critical |
| **Pages** | `/quotes` |
| **Component** | `src/app/quotes/quotes-filter.tsx` line 114–129 |

**Problem:** The `<Select>` for date-range filtering renders a `<button role="combobox">` with no accessible name. Screen readers announce it as "combobox, collapsed" with no indication of purpose.

**Fix:** Add `aria-label` to `SelectTrigger`:

```tsx
// src/app/quotes/quotes-filter.tsx — line 119
// Before:
<SelectTrigger className="w-full sm:w-[180px] h-11">

// After:
<SelectTrigger className="w-full sm:w-[180px] h-11" aria-label="Filter by date range">
```

---

## 2. Serious Issues

### 2.1 Colour Contrast — Brand Green on White (3.29:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | All pages (landing, auth, dashboard, quotes, settings, etc.) |
| **Elements** | Primary buttons (`bg-brand-600`), brand links (`text-brand-600`), logo "Flo" text |

**Problem:** The brand green `#16a34a` on white `#ffffff` has a contrast ratio of **3.29:1**. WCAG AA requires **4.5:1** for normal text and **3:1** for large text (≥18pt or ≥14pt bold). Most affected elements are normal-sized text.

**Affected Tailwind classes:** `text-brand-600`, `bg-brand-600` (button text is white on green).

**Fix:** Darken the brand-600 shade from `#16a34a` to `#15803d` (Tailwind `green-700`) which gives **4.58:1** against white. Update in `tailwind.config.ts`:

```ts
// tailwind.config.ts — brand color scale
// Change brand-600 from #16a34a to #15803d
// Or adjust the CSS custom property --brand-600
brand: {
  // ...
  600: "#15803d", // was #16a34a (3.29:1 → now 4.58:1)
  // ...
}
```

Alternatively, for buttons with white text on green background, use `#15803d` as the button background.

### 2.2 Colour Contrast — Sidebar Section Labels (2.56:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | All dashboard pages |
| **Component** | `src/components/dashboard-shell.tsx` line 157 |

**Problem:** Sidebar group labels ("Overview", "Work", "Settings") use `text-surface-400` (`#94a3b8`) at 11px on white background — contrast ratio **2.56:1**. Minimum required: **4.5:1**.

**Fix:** Change `text-surface-400` to `text-surface-500` (`#64748b`, ratio 4.61:1):

```tsx
// src/components/dashboard-shell.tsx — line 157
// Before:
<p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400">

// After:
<p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
```

### 2.3 Colour Contrast — Auth Layout Footer Links (3.75:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| **Component** | `src/app/(auth)/layout.tsx` lines 59–61 |

**Problem:** Footer links ("Terms", "Privacy", "Contact") use `text-surface-500` (`#64748b`) on `bg-surface-900` (`#0f172a`) — contrast ratio **3.75:1**. Required: **4.5:1**.

**Fix:** Change to `text-surface-400` (`#94a3b8`) which gives **5.38:1** against `#0f172a`:

```tsx
// src/app/(auth)/layout.tsx — lines 59-61
// Before:
<Link href="/terms" className="text-surface-500 underline hover:text-surface-400">

// After:
<Link href="/terms" className="text-surface-400 underline hover:text-surface-300">
```

Also update the copyright text on line 63:

```tsx
// Before:
<p className="text-sm text-surface-500">

// After:
<p className="text-sm text-surface-400">
```

### 2.4 Colour Contrast — Brand Green on White for Links (3.29:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | `/login` ("Forgot password?", "Start free trial"), `/signup` ("Log in"), `/contact` (email link) |
| **Components** | Auth pages, contact page |

**Problem:** Inline links using `text-brand-600` (`#16a34a`) on white have **3.29:1** contrast.

**Fix:** Same as 2.1 — darken brand-600 to `#15803d` globally. Alternatively, use `text-brand-700` (`#15803d`) for inline text links.

### 2.5 Colour Contrast — Business Settings Brand Preview (2.27:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | `/settings/business` |

**Problem:** The brand-colour preview text (company name shown in the user's chosen brand colour) uses inline `style={{ color: brandColor }}`. The default `#22c55e` (`green-500`) against white has **2.27:1**.

**Fix:** When rendering the brand-colour preview, enforce a minimum contrast. If the computed contrast ratio against the background is below 4.5:1, darken the colour:

```tsx
// In the brand preview section of settings/business/page.tsx:
// Add a helper that enforces minimum contrast or show the text on a dark background instead.
// Simplest fix: render the preview on a dark swatch card rather than white.
```

### 2.6 Colour Contrast — Quoting Settings Helper Text (2.56:1)

| Field | Value |
|-------|-------|
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Severity** | Serious |
| **Pages** | `/settings/quoting` |
| **Component** | Settings quoting page |

**Problem:** Helper text like "Up to 3 emails, 3 days apart" and "expiry" uses `text-surface-400` (`#94a3b8`) at 12px — contrast ratio **2.56:1**.

**Fix:** Change `text-surface-400` to `text-surface-500` (`#64748b`, ratio 4.61:1) throughout.

---

## 3. Moderate Issues

### 3.1 Missing `<h1>` on Auth Pages

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Moderate |
| **Pages** | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| **Component** | Auth form pages + `src/app/(auth)/layout.tsx` |

**Problem:** Auth pages use `<h2>` as the page title (e.g., "Log in", "Create your account"). There is no `<h1>` on the page. The left-panel heading is also `<h2>`. Screen readers and SEO bots expect exactly one `<h1>`.

**Fix:** Change the form title from `<h2>` to `<h1>` on each auth page. Example for login:

```tsx
// In the login page component:
// Before:
<h2 className="text-2xl font-bold ...">Log in</h2>

// After:
<h1 className="text-2xl font-bold ...">Log in</h1>
```

And on the left-side branding panel, keep the `<h2>` or change it to a decorative `<p>`:

```tsx
// src/app/(auth)/layout.tsx — line 38
// Keep as <h2> (secondary heading) or change to <p> with aria-hidden if purely decorative
```

### 3.2 Heading Order Skips on Settings Pages

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Moderate |
| **Pages** | `/settings/business`, `/settings/quoting`, `/settings/account` |
| **Component** | `Card` + `CardTitle` components used in settings |

**Problem:** Settings pages use `<h1>` for the page title, then `<h3>` inside `<CardTitle>` components, skipping `<h2>`. Heading order should be sequential (h1 → h2 → h3).

**Fix:** Change `CardTitle` from `<h3>` to `<h2>` in settings page usage, or change the `CardTitle` component's default element:

```tsx
// Option A: Override in each settings page
<CardTitle className="text-lg" asChild>
  <h2>Company Information</h2>
</CardTitle>

// Option B: Change CardTitle default in src/components/ui/card.tsx
// from <h3> to <h2> (review heading levels across all pages first)
```

### 3.3 Landing Page Content Not Inside Landmarks

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Moderate |
| **Pages** | `/` (landing page) |
| **Component** | `src/app/page.tsx` |

**Problem:** The main content sections of the landing page (hero, features, testimonials, pricing, CTA) are not wrapped in ARIA landmark elements (`<main>`, `<section>` with `aria-label`, `<nav>`, etc.). Screen readers cannot navigate by landmarks.

**Fix:** Wrap the page content in `<main>` and give each `<section>` a meaningful `aria-label` or `aria-labelledby`:

```tsx
// src/app/page.tsx
// Before:
<div className="min-h-screen bg-white">
  <header>...</header>
  {/* sections */}
  <footer>...</footer>
</div>

// After:
<div className="min-h-screen bg-white">
  <header>...</header>
  <main>
    <section aria-labelledby="hero-heading">
      <h1 id="hero-heading">Professional Quotes in Under 5 Minutes</h1>
      ...
    </section>
    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading">Quote to Cash in 3 Steps</h2>
      ...
    </section>
    {/* etc. */}
  </main>
  <footer>...</footer>
</div>
```

### 3.4 Auth Layout Content Not Inside Landmarks

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Moderate |
| **Pages** | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| **Component** | `src/app/(auth)/layout.tsx` |

**Problem:** The left-side branding panel (desktop) is a `<div>` without landmark role. Its content (headings, feature list, footer links) is not discoverable via screen reader landmark navigation.

**Fix:** Add `role="complementary"` or wrap in `<aside>` with `aria-label`:

```tsx
// src/app/(auth)/layout.tsx — line 16
// Before:
<div className="hidden lg:flex lg:w-[45%] ...">

// After:
<aside className="hidden lg:flex lg:w-[45%] ..." aria-label="QuoteFlo features">
```

---

## 4. Minor Issues

### 4.1 Download PDF Button — Missing Accessible Name on Mobile

| Field | Value |
|-------|-------|
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Minor |
| **Pages** | `/q/[token]` (public quote page) |
| **Component** | `src/app/q/[token]/download-pdf-button.tsx` line 16–19 |

**Problem:** On small screens, the text "Download PDF" is hidden (`hidden sm:inline`), leaving only the icon. The button has no `aria-label` fallback.

**Fix:**

```tsx
// Before:
<Button variant="outline" size="sm" onClick={handleDownload}>
  <Download className="h-4 w-4" />
  <span className="hidden sm:inline">Download PDF</span>
</Button>

// After:
<Button variant="outline" size="sm" onClick={handleDownload} aria-label="Download PDF">
  <Download className="h-4 w-4" aria-hidden="true" />
  <span className="hidden sm:inline" aria-hidden="true">Download PDF</span>
</Button>
```

### 4.2 Error Messages Not Linked to Form Inputs

| Field | Value |
|-------|-------|
| **WCAG** | 3.3.1 Error Identification (Level A) |
| **Severity** | Minor |
| **Pages** | `/quotes/new`, `/quotes/[id]/edit`, `/login`, `/signup`, `/forgot-password` |
| **Components** | `quote-form.tsx`, `edit-quote-form.tsx`, auth pages |

**Problem:** Form error messages are shown in `<Alert>` components at the top of the form, but they are not linked to the specific invalid input via `aria-describedby`. Screen readers don't associate the error with the field.

**Fix:** For global form errors, add `aria-live="polite"` to the error container so screen readers announce when errors appear:

```tsx
// In form components, wrap the error alert:
{error && (
  <Alert variant="destructive" aria-live="polite" role="alert">{error}</Alert>
)}
```

The `<Alert>` component already has `role="alert"`, which is good. But also consider per-field validation with `aria-describedby` on each input pointing to its error message.

### 4.3 Status Filter Buttons — No `aria-pressed` State

| Field | Value |
|-------|-------|
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Minor |
| **Pages** | `/quotes` |
| **Component** | `src/app/quotes/quotes-filter.tsx` lines 138–165 |

**Problem:** The status filter buttons (All, Draft, Sent, Viewed, Accepted, Declined) act as toggle buttons but don't convey their selected state to screen readers.

**Fix:** Add `aria-pressed` to indicate the active state:

```tsx
// src/app/quotes/quotes-filter.tsx — inside the map:
<Button
  key={filter.value}
  onClick={() => handleStatusChange(filter.value)}
  disabled={isPending}
  variant={isActive ? "default" : "outline"}
  size="sm"
  aria-pressed={isActive}  // ← ADD THIS
  className={cn(/* ... */)}
>
```

### 4.4 Sidebar Navigation — Missing `aria-current` for Active Link

| Field | Value |
|-------|-------|
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Severity** | Minor |
| **Pages** | All dashboard pages |
| **Component** | `src/components/dashboard-shell.tsx` lines 166–186 |

**Problem:** The active navigation item is visually highlighted but doesn't use `aria-current="page"` to communicate its state to screen readers.

**Fix:**

```tsx
// src/components/dashboard-shell.tsx — inside nav item buttons:
<Button
  key={item.name}
  variant="ghost"
  onClick={() => handleNavigation(item.href)}
  aria-current={isActive ? "page" : undefined}  // ← ADD THIS
  className={cn(/* ... */)}
>
```

### 4.5 Decorative Icons Missing `aria-hidden`

| Field | Value |
|-------|-------|
| **WCAG** | 1.1.1 Non-text Content (Level A) |
| **Severity** | Minor |
| **Pages** | Multiple |
| **Components** | Various Lucide icons used decoratively |

**Problem:** Many decorative icons (next to text labels) do not have `aria-hidden="true"`, causing screen readers to announce "image" or the SVG title.

**Fix:** Add `aria-hidden="true"` to all decorative icons (icons that are next to text and don't convey additional meaning). Lucide React icons accept this prop:

```tsx
// Example — in dashboard, quote detail, etc:
<FileText className="h-5 w-5 text-surface-400" aria-hidden="true" />
<Mail className="h-4 w-4 text-surface-400" aria-hidden="true" />
```

Icons that serve as the sole content of a button should NOT be hidden — instead the button should have `aria-label`.

### 4.6 Quote Detail — Activity Timeline Not Semantically Listed

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Minor |
| **Pages** | `/quotes/[id]` |
| **Component** | `src/app/quotes/[id]/page.tsx` lines 218–286 |

**Problem:** The activity timeline is built with `<div>` elements. Screen readers don't perceive it as a list of events.

**Fix:** Wrap timeline items in an `<ol>` (ordered list) with each event as an `<li>`:

```tsx
// Before:
<div className="space-y-4">
  {quote.accepted_at && (
    <div className="flex items-center gap-3 text-sm">...

// After:
<ol className="space-y-4" aria-label="Quote activity timeline">
  {quote.accepted_at && (
    <li className="flex items-center gap-3 text-sm">...
```

### 4.7 Quote Line Items Table — Missing `<caption>` or `aria-label`

| Field | Value |
|-------|-------|
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Severity** | Minor |
| **Pages** | `/quotes/[id]` (detail), `/q/[token]` (public) |

**Problem:** The quote items table/grid does not have a programmatic caption or label.

**Fix:** For the detail page (which uses a CSS grid), either convert to a `<table>` with `<caption>` or add `role="table"` with `aria-label`:

```tsx
// Already structured with a visual header row — consider adding:
<div role="table" aria-label="Quote line items">
  <div role="rowgroup">
    <div role="row" className="hidden sm:grid ...">
      <div role="columnheader">Description</div>
      ...
    </div>
  </div>
  ...
</div>
```

### 4.8 Loading Bar — Missing Screen Reader Announcement

| Field | Value |
|-------|-------|
| **WCAG** | 4.1.3 Status Messages (Level AA) |
| **Severity** | Minor |
| **Pages** | All dashboard pages |
| **Component** | `src/components/dashboard-shell.tsx` lines 324–328 |

**Problem:** The animated loading bar at the top of the page during navigation is purely visual. Screen reader users have no indication that the page is loading.

**Fix:** Add a visually-hidden live region:

```tsx
// Add alongside the loading bar:
{isNavigating && (
  <>
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-brand-100" aria-hidden="true">
      <div className="h-full bg-brand-500 animate-loading-bar" />
    </div>
    <div className="sr-only" aria-live="polite" role="status">Loading page</div>
  </>
)}
```

---

## 5. Keyboard Navigation Summary

| Area | Status | Notes |
|------|--------|-------|
| Auth pages (login, signup, forgot-password) | ✅ Pass | Tab order logical, forms submit with Enter |
| Dashboard sidebar navigation | ✅ Pass | All nav items are `<button>`, focusable |
| Mobile sidebar (Sheet) | ✅ Pass | Focus trap works via Radix Sheet, Escape closes |
| Quote form (new/edit) | ✅ Pass | All inputs, buttons reachable by Tab |
| Service picker dialog | ✅ Pass | Dialog traps focus, Escape closes, via Radix Dialog |
| Quote detail actions dropdown | ✅ Pass | Radix DropdownMenu handles keyboard (arrow keys, Enter, Escape) |
| Delete confirmation dialog | ✅ Pass | AlertDialog traps focus, Escape cancels |
| Quotes filter (status buttons) | ✅ Pass | All buttons focusable and activatable with Enter/Space |
| Date filter select | ✅ Pass | Radix Select handles keyboard (arrow keys, Enter, Escape) |
| Public quote page (accept/decline) | ✅ Pass | Buttons are standard `<button>` elements |
| Landing page | ✅ Pass | All links and buttons are focusable |
| Skip-to-content link | ❌ Missing | No skip-navigation link to bypass repeated nav |

### 5.1 Missing Skip-to-Content Link

| Field | Value |
|-------|-------|
| **WCAG** | 2.4.1 Bypass Blocks (Level A) |
| **Severity** | Minor |
| **Pages** | All pages |

**Fix:** Add a skip link as the first focusable element in the `<body>`:

```tsx
// src/app/layout.tsx — inside <body>:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-surface-900 focus:ring-2 focus:ring-brand-500"
>
  Skip to content
</a>

// Then add id="main-content" to the <main> element in dashboard-shell.tsx and landing page.
```

---

## 6. Screen Reader Compatibility Summary

| Area | Status | Notes |
|------|--------|-------|
| Page titles (`<title>`) | ✅ Pass | Dynamic page titles set via Next.js metadata |
| Language attribute | ✅ Pass | `<html lang="en-GB">` set correctly |
| Landmark regions (dashboard) | ✅ Pass | `<aside>`, `<header>`, `<main>` used in dashboard shell |
| Landmark regions (landing) | ❌ Fail | Main content not wrapped in `<main>` — see issue 3.3 |
| Landmark regions (auth) | ⚠️ Partial | Right side has `<main>`, left panel lacks landmark — see issue 3.4 |
| Form labels | ✅ Pass | All form inputs have associated `<Label>` elements |
| Error announcements | ⚠️ Partial | Errors use `role="alert"` but are not linked to specific fields |
| Dynamic content updates | ⚠️ Partial | Toast component has live region; navigation loading does not |
| Images | ✅ Pass | Logo uses `alt` text; decorative images properly handled |
| Tables / data grids | ⚠️ Partial | Quote items use CSS grid, not semantic `<table>` |
| Dialogs / modals | ✅ Pass | Radix UI handles focus trap, aria-modal, role="dialog" |

---

## 7. Prioritised Fix Plan

### Priority 1 — Critical (fix immediately)

| # | Issue | Effort |
|---|-------|--------|
| 1.1 | Add `aria-label` to date-range Select trigger | 5 min |

### Priority 2 — Serious (fix within 2 weeks)

| # | Issue | Effort |
|---|-------|--------|
| 2.1 | Darken brand-600 from `#16a34a` to `#15803d` globally | 30 min |
| 2.2 | Change sidebar labels from `text-surface-400` to `text-surface-500` | 5 min |
| 2.3 | Fix auth footer link contrast (`text-surface-400` on dark bg) | 10 min |
| 2.5 | Fix brand preview contrast in business settings | 30 min |
| 2.6 | Change quoting settings helper text from `text-surface-400` to `text-surface-500` | 5 min |

### Priority 3 — Moderate (fix within 1 month)

| # | Issue | Effort |
|---|-------|--------|
| 3.1 | Add `<h1>` to auth pages | 15 min |
| 3.2 | Fix heading order on settings pages (h1 → h2 not h1 → h3) | 15 min |
| 3.3 | Wrap landing page content in `<main>` with labelled `<section>` landmarks | 30 min |
| 3.4 | Add landmark role to auth layout left panel | 5 min |

### Priority 4 — Minor (fix within 3 months)

| # | Issue | Effort |
|---|-------|--------|
| 4.1 | Add `aria-label` to Download PDF button | 5 min |
| 4.2 | Add `aria-live="polite"` to form error containers | 15 min |
| 4.3 | Add `aria-pressed` to status filter buttons | 5 min |
| 4.4 | Add `aria-current="page"` to active sidebar nav item | 5 min |
| 4.5 | Add `aria-hidden="true"` to decorative icons | 45 min |
| 4.6 | Convert activity timeline to semantic `<ol>` | 15 min |
| 4.7 | Add `aria-label` or `<caption>` to quote items data | 15 min |
| 4.8 | Add screen-reader loading announcement | 10 min |
| 5.1 | Add skip-to-content link | 15 min |

---

## 8. Files Requiring Changes

| File | Issues |
|------|--------|
| `tailwind.config.ts` | 2.1 — darken brand-600 colour |
| `src/app/(auth)/layout.tsx` | 2.3, 3.1, 3.4 |
| `src/app/(auth)/login/page.tsx` | 3.1 |
| `src/app/(auth)/signup/page.tsx` | 3.1 |
| `src/app/(auth)/forgot-password/page.tsx` | 3.1 |
| `src/app/(auth)/reset-password/page.tsx` | 3.1 |
| `src/app/page.tsx` | 3.3 |
| `src/app/layout.tsx` | 5.1 — skip link |
| `src/app/quotes/quotes-filter.tsx` | 1.1, 4.3 |
| `src/app/quotes/[id]/page.tsx` | 4.6, 4.7 |
| `src/app/q/[token]/page.tsx` | 4.7 |
| `src/app/q/[token]/download-pdf-button.tsx` | 4.1 |
| `src/app/quotes/new/quote-form.tsx` | 4.2, 4.5 |
| `src/app/quotes/[id]/edit/edit-quote-form.tsx` | 4.2, 4.5 |
| `src/components/dashboard-shell.tsx` | 2.2, 4.4, 4.5, 4.8 |
| `src/app/settings/business/page.tsx` | 2.5, 3.2 |
| `src/app/settings/quoting/page.tsx` | 2.6, 3.2 |
| `src/app/settings/account/page.tsx` | 3.2 |

---

## 9. EU/UK Regulatory Notes

### European Accessibility Act (EAA) — Directive 2019/882
- Applies from **28 June 2025** to digital services sold in the EU.
- Requires WCAG 2.1 Level AA compliance.
- The **colour contrast** issues (2.1–2.6) and **missing button names** (1.1) are clear violations.

### UK Equality Act 2010
- Requires "reasonable adjustments" for disabled users.
- UK Government mandates **WCAG 2.1 AA** for public-sector and strongly recommends it for private-sector digital services.
- The Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 specifically reference WCAG 2.1 AA.

### Recommended Actions
1. Fix all Critical and Serious issues before any public launch.
2. Publish an **Accessibility Statement** page (required under EU EAA and UK regulations).
3. Add automated accessibility testing to CI (e.g. `@axe-core/playwright` in the E2E suite).
4. Schedule periodic manual audits with assistive-technology users.
