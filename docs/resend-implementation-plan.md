# Resend Transactional Emails - Implementation Plan

This plan outlines the integration of **Resend** to handle automated emails for user onboarding and account management.

## User Review Required

> [!IMPORTANT]
> - **API Key**: Requires `RESEND_API_KEY` in `.env.local`.
> - **Sender Identity**: The `from` address must be a verified domain in your Resend dashboard.
> - **Supabase Auth Hook**: For the best experience, we will create an API route or use a Supabase Auth hook (Edge Function) to trigger these emails, as Supabase's default emails are handled internally. Alternatively, we can trigger them from the client-side login/signup logic (with a server-side proxy).

## Proposed Changes

### 1. Library & Service
- [NEW] `src/lib/services/email.ts`:
  - Initialize the `Resend` client.
  - Create `sendEmailVerification(email, name, code)`: Uses template `email-verification`.
  - Create `sendWelcomeEmail(email, name)`: Uses template `welcome-onboard`.
  - Create `sendPasswordRecovery(email, link)`: Uses template `recuperacao-de-senha`.

### 2. API Routes
- [NEW] `src/app/api/auth/email/route.ts`:
  - A secure server-side endpoint to trigger Resend calls, protecting the API Key.

### 3. Authentication Integration
- [MODIFY] [login/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/Documents/Data%20Palpite/datapalpite/src/app/login/page.tsx):
  - After a successful `signUp`, call our new API to send the verification email.
  - (Optional) Configure Supabase to handle the verification redirect to a page that triggers the welcome email.

## Templates & Variables

The following templates from your Resend dashboard will be used:

| Template Name | Variables (Suggested) | Trigger Point |
| :--- | :--- | :--- |
| `email-verification` | `CODE`, `NAME` | Right after Signup |
| `welcome-onboard` | `NAME` | After Email Confirmation |
| `recuperacao-de-senha` | `LINK` | Forgot Password Request |

---

## Verification Plan

### Automated Tests
- Unit test for the email service using a mock Resend client.

### Manual Verification
1. Sign up with a new email address.
2. Confirm the "email-verification" email is received.
3. Verify the "welcome-onboard" email is sent after confirmation.
4. Test the "recuperar-senha" flow to receive the recovery template.
