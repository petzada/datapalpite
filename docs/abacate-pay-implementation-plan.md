# AbacatePay Integration - Implementation Plan

This plan outlines the integration of **AbacatePay** as the primary PIX payment gateway for the "Easy" (R$ 14,90) and "Pro" (R$ 39,90) plans.

## User Review Required

> [!IMPORTANT]
> - **API Key Security**: The implementation requires `ABACATEPAY_API_KEY` to be set in the `.env.local` file.
> - **Webhook Secret**: A manual step is required to configure the Webhook URL in the AbacatePay dashboard.
> - **Expiration Logic**: The plan assumes a 30-day fixed duration for each payment. If a user pays while a plan is still active, the 30 days will be added to the remaining time.

## Proposed Changes

### 1. Database & Library
- [MODIFY] [subscription.ts](file:///c:/Users/MARCIO.PETIGROSSO/Documents/Data%20Palpite/datapalpite/src/lib/subscription.ts): Ensure the `PlanoTier` and logic for `valid_until` are aligned with the 30-day requirement.

### 2. API Routes
- [NEW] `src/app/api/webhooks/abacatepay/route.ts`:
  - Receives `billing.paid` events.
  - Verifies HMAC signature (`X-Webhook-Signature`).
  - Updates the user's `plano` and `valid_until` (current + 30 days) in Supabase.
- [NEW] `src/app/api/payments/create/route.ts`:
  - Server-side endpoint to call AbacatePay `POST /pixQrCode/create`.
  - Returns the `brCode` and `brCodeBase64` to the frontend.

### 3. Frontend Pages
- [MODIFY] [PlanosClient.tsx](file:///c:/Users/MARCIO.PETIGROSSO/Documents/Data%20Palpite/datapalpite/src/app/planos/PlanosClient.tsx):
  - Update `handleSelectPlan` to redirect to `/pagamento/[planId]`.
- [NEW] `src/app/pagamento/[planId]/page.tsx`:
  - Server Component to fetch user info and initial state.
- [NEW] `src/app/pagamento/[planId]/PaymentClient.tsx`:
  - Calls the create payment API.
  - Displays the PIX QR Code image and Copy-Paste code.
  - Implements polling to check payment status via a new API or directly from Supabase.
  - Shows a success state with a redirect button to `/dashboard`.

### 4. Middleware/Access Control
- No changes needed to `middleware.ts` if it already respects `valid_until` via `checkAccessStatus`.

---

## Webhook Setup Tutorial (Manual)

1. Access the [AbacatePay Dashboard](https://app.abacatepay.com).
2. Go to **Settings** > **Webhooks**.
3. Click **Create Webhook**.
4. Set the URL to: `https://your-domain.com/api/webhooks/abacatepay`.
5. Select the event: `billing.paid`.
6. Copy the **Webhook Secret** and add it to your `.env.local` as `ABACATEPAY_WEBHOOK_SECRET`.

---

## Verification Plan

### Automated Tests (Next Step)
- Create a mockup script to simulate AbacatePay webhook payloads.
- Test the `valid_until` calculation logic in isolation.

### Manual Verification
1. Log in as a trial user.
2. Go to `/planos` and select a plan.
3. Verify the QR Code is generated correctly on the `/pagamento` page.
4. Simulate a payment via AbacatePay (Dev Mode) or manual webhook trigger.
5. Confirm the user plan is updated to 'easy' or 'pro' and `valid_until` is set to +30 days.
6. Check if the user is redirected to the dashboard with the active plan.
