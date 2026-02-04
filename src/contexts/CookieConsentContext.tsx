"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface CookieConsent {
  necessary: true
  analytics: boolean
  marketing: boolean
}

interface CookieConsentStorage {
  consent: CookieConsent
  timestamp: string
  version: number
}

interface CookieConsentContextValue {
  consent: CookieConsent
  hasDecided: boolean
  showBanner: boolean
  preferencesOpen: boolean
  acceptAll: () => void
  rejectOptional: () => void
  savePreferences: (consent: CookieConsent) => void
  openPreferences: () => void
  closePreferences: () => void
}

const STORAGE_KEY = "datapalpite-cookie-consent"
const CONSENT_VERSION = 1

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

function persistConsent(consent: CookieConsent) {
  const data: CookieConsentStorage = {
    consent,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadConsent(): CookieConsentStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CookieConsentStorage
    if (data.version !== CONSENT_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function CookieConsentContextProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [hasDecided, setHasDecided] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const stored = loadConsent()
    if (stored) {
      setConsent(stored.consent)
      setHasDecided(true)
    } else {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = { necessary: true, analytics: true, marketing: true }
    setConsent(newConsent)
    setHasDecided(true)
    setShowBanner(false)
    setPreferencesOpen(false)
    persistConsent(newConsent)
  }, [])

  const rejectOptional = useCallback(() => {
    const newConsent: CookieConsent = { necessary: true, analytics: false, marketing: false }
    setConsent(newConsent)
    setHasDecided(true)
    setShowBanner(false)
    setPreferencesOpen(false)
    persistConsent(newConsent)
  }, [])

  const savePreferences = useCallback((newConsent: CookieConsent) => {
    setConsent(newConsent)
    setHasDecided(true)
    setShowBanner(false)
    setPreferencesOpen(false)
    persistConsent(newConsent)
  }, [])

  const openPreferences = useCallback(() => {
    setPreferencesOpen(true)
  }, [])

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false)
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasDecided,
        showBanner,
        preferencesOpen,
        acceptAll,
        rejectOptional,
        savePreferences,
        openPreferences,
        closePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentContextProvider")
  }
  return context
}
