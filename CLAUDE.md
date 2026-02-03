# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a **Next.js 16 App Router** application for a Brazilian sports betting management platform (Data Palpite). It uses **React 19**, **TypeScript**, **Supabase** for backend/auth, and **Tailwind CSS 4** with **shadcn/ui** components.

### Directory Structure

```
src/
├── app/                    # App Router pages and API routes
│   ├── api/               # API endpoints (chat, payments, webhooks, email)
│   ├── auth/callback/     # OAuth callback handler
│   ├── dashboard/         # Protected dashboard pages (apostas, bancas, ferramentas)
│   └── [public pages]/    # login, planos, pagamento, support, privacy, terms
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── dashboard/        # Sidebar, MobileNav, KPICard, charts
│   ├── apostas/          # Betting management (ApostasClient, ApostasTable, forms)
│   ├── bancas/           # Bank management components
│   ├── ferramentas/      # AI chat, EV calculator
│   └── subscription/     # SubscriptionGuard, FeatureLock, UpgradeLockScreen
├── lib/
│   ├── supabase/         # server.ts (SSR client), client.ts (browser client)
│   ├── services/         # cache, email, football-data, chat-history
│   ├── actions/          # Server actions (apostas.ts, bancas.ts, dashboard.ts)
│   ├── subscription.ts   # Server-side subscription logic
│   └── subscription-client.ts  # Client-side subscription logic (duplicated)
```

### Key Patterns

**Server Components & Server Actions**: Root and dashboard layouts are async Server Components. Database mutations use Server Actions in `lib/actions/` with `revalidatePath()` for cache invalidation.

**Authentication**: Supabase Auth with email/password and Google OAuth. Auth callback at `app/auth/callback/route.ts` handles OAuth redirects and automatic profile creation. Dashboard layout checks auth and redirects unauthenticated users.

**Subscription System**: Three tiers (trial/easy/pro) with limits stored in `profiles` table. Protection via:
1. Server-side check in dashboard layout
2. `SubscriptionGuard` client component
3. `FeatureLock` component for specific features

**Supabase Clients**:
- `lib/supabase/server.ts` - SSR client with cookie management (use in Server Components/Actions)
- `lib/supabase/client.ts` - Browser client (use in Client Components)
- Service role key used only in webhooks for admin operations

### Database Tables

- `profiles` - User data, plan status (`plano`, `valid_until`, `status`), AI query limits
- `apostas` - Betting records (stake, odds, status, P&L)
- `aposta_eventos` - Individual events within multi-event bets
- `bancas` - User's betting banks/accounts

### API Routes

- `POST /api/auth/email` - Send verification/welcome/recovery emails (Resend)
- `POST /api/chat` - AI streaming chat with Google Gemini for football stats
- `POST /api/payments/create` - Create PIX payment via AbacatePay
- `GET /api/payments/status` - Check subscription status
- `POST /api/webhooks/abacatepay` - Payment webhook (HMAC verification)

### External Services

- **Supabase**: Auth + PostgreSQL database
- **AbacatePay**: PIX payments (Brazilian payment method)
- **Resend**: Transactional emails
- **Google AI (Gemini 2.5 Flash Lite)**: Football stats chatbot
- **football-data.org**: Football/soccer data API

### UI Framework

- shadcn/ui components in `components/ui/`
- Radix UI primitives
- Lucide React icons
- Tailwind CSS 4 with CSS variables (New York style preset)
- Recharts for dashboard visualizations

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `ABACATEPAY_API_KEY`, `ABACATEPAY_PUBLIC_KEY`
- `FOOTBALL_DATA_API_KEY`

### Language

All user-facing content is in **Brazilian Portuguese**. The AI chatbot system prompt and responses are in Portuguese.
