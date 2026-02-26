// Trade types - expanded list + custom
export type Trade =
  | "electrician"
  | "plumber"
  | "builder"
  | "carpenter"
  | "painter"
  | "roofer"
  | "landscaper"
  | "tiler"
  | "plasterer"
  | "locksmith"
  | "hvac"
  | "gas_engineer"
  | "glazier"
  | "fencer"
  | "cleaner"
  | "handyman"
  | "other";

// Subscription types
export type SubscriptionTier = "starter" | "professional" | "business";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";

// Quote status types
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";

// User profile
export interface UserProfile {
  id: string;
  email: string;
  business_email: string | null;
  trade: Trade;
  custom_trade_name: string | null;
  company_name: string;
  phone: string | null;
  postcode: string | null;
  logo_url: string | null;
  brand_color: string;
  default_quote_expiry_days: number;
  vat_enabled: boolean;
  default_vat_rate: number;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  trial_ends_at: string | null;
  // Notification preferences
  auto_followup_enabled: boolean;
  auto_followup_days: number;
  expiry_reminder_enabled: boolean;
  expiry_reminder_days: number;
  created_at: string;
  updated_at: string;
  deletion_scheduled_at: string | null;
}

// Customer
export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  emails: string[];
  phones: string[];
  address: string | null;
  postcode: string | null;
  notes: string | null;
  merged_from: string[];
  created_at: string;
  updated_at: string;
}

// Quote
export interface Quote {
  id: string;
  user_id: string;
  quote_number: string;
  
  // Customer details (snapshot at time of quote)
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_postcode: string | null;
  
  // Quote details
  job_description: string | null;
  status: QuoteStatus;
  
  // Pricing
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  
  // Dates
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  valid_until: string | null;
  
  // Follow-up tracking
  follow_up_sent: boolean;
  follow_up_count: number;
  last_follow_up_at: string | null;
  reminder_sent: boolean;
  expiry_reminder_sent: boolean;
  expiry_reminder_sent_at: string | null;
  
  // Public access
  access_token: string;
  
  // Relations (when joined)
  line_items?: QuoteLineItem[];
}

// Quote line item
export interface QuoteLineItem {
  id: string;
  quote_id: string;
  item_order: number;
  
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  
  created_at: string;
}

// Service library item
export interface ServiceItem {
  id: string;
  user_id: string;
  category: string;
  
  service_name: string;
  description: string | null;
  price: number;
  unit: "each" | "per_hour" | "per_metre" | "per_room" | "per_day";
  
  is_active: boolean;
  created_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  totalValue: number;
  acceptanceRate: number;
  avgQuoteValue: number;
}

// Form types
export interface CreateQuoteForm {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_postcode: string;
  job_description: string;
  vat_rate: number;
  valid_days: number;
  line_items: CreateLineItemForm[];
}

export interface CreateLineItemForm {
  description: string;
  quantity: number;
  unit_price: number;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Notification types
export type NotificationType = "quote_sent" | "follow_up" | "expiry_reminder" | "accepted" | "declined";
export type NotificationChannel = "email" | "sms";
export type NotificationStatus = "sent" | "failed" | "skipped";

export interface NotificationLog {
  id: string;
  user_id: string;
  quote_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  status: NotificationStatus;
  error_message: string | null;
  created_at: string;
}
