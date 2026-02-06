import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

// Use service role for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.subscription
    ? (
        await stripe!.subscriptions.retrieve(session.subscription as string)
      ).metadata.supabase_user_id
    : null;

  if (!userId) {
    console.error("No user ID found in checkout session");
    return;
  }

  await supabase.from("billing_events").insert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    event_type: "checkout.session.completed",
    event_data: {
      session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  
  if (!userId) {
    console.error("No user ID found in subscription metadata");
    return;
  }

  let status: "active" | "cancelled" | "past_due" | "trialing" = "active";
  if (subscription.status === "canceled" || subscription.status === "unpaid") {
    status = "cancelled";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  } else if (subscription.status === "trialing") {
    status = "trialing";
  }

  await supabase
    .from("user_profiles")
    .update({
      subscription_status: status,
      subscription_tier: "professional",
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await supabase.from("billing_events").insert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    event_type: `subscription.${subscription.status}`,
    event_data: {
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  
  if (!userId) {
    console.error("No user ID found in subscription metadata");
    return;
  }

  await supabase
    .from("user_profiles")
    .update({
      subscription_status: "cancelled",
      subscription_tier: "starter",
      stripe_subscription_id: null,
      stripe_price_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await supabase.from("billing_events").insert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    event_type: "subscription.canceled",
    event_data: {
      canceled_at: subscription.canceled_at,
      ended_at: subscription.ended_at,
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe!.subscriptions.retrieve(
    invoice.subscription as string
  );
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) return;

  await supabase.from("billing_events").insert({
    user_id: userId,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string,
    event_type: "invoice.payment_succeeded",
    event_data: {
      invoice_id: invoice.id,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe!.subscriptions.retrieve(
    invoice.subscription as string
  );
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) return;

  await supabase
    .from("user_profiles")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await supabase.from("billing_events").insert({
    user_id: userId,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string,
    event_type: "invoice.payment_failed",
    event_data: {
      invoice_id: invoice.id,
      amount_due: invoice.amount_due,
      attempt_count: invoice.attempt_count,
    },
  });
}
