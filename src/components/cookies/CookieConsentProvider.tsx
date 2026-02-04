"use client"

import { CookieConsentContextProvider, useCookieConsent } from "@/contexts/CookieConsentContext"
import { useAnalytics } from "@/hooks/useAnalytics"
import { CookieBanner } from "./CookieBanner"
import { CookiePreferencesModal } from "./CookiePreferencesModal"

function AnalyticsLoader() {
  const { hasDecided, consent } = useCookieConsent()
  useAnalytics(hasDecided, consent.analytics)
  return null
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentContextProvider>
      {children}
      <CookieBanner />
      <CookiePreferencesModal />
      <AnalyticsLoader />
    </CookieConsentContextProvider>
  )
}
