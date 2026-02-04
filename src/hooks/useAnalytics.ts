"use client"

import { useEffect } from "react"

const GA_MEASUREMENT_ID = "G-XXXXXXXX" // TODO: Replace with real GA Measurement ID

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function removeGAScripts() {
  // Remove gtag.js script
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `script[src*="googletagmanager.com/gtag"]`
  )
  scripts.forEach((s) => s.remove())

  // Remove inline gtag config script
  const inlineScripts = document.querySelectorAll<HTMLScriptElement>(
    'script[data-cookie-consent="analytics"]'
  )
  inlineScripts.forEach((s) => s.remove())

  // Clean up globals
  delete window.gtag
  delete window.dataLayer
}

function injectGA() {
  // Avoid duplicate injection
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return

  // gtag.js loader
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // gtag config
  const configScript = document.createElement("script")
  configScript.setAttribute("data-cookie-consent", "analytics")
  configScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
  `
  document.head.appendChild(configScript)
}

export function useAnalytics(hasDecided: boolean, analyticsEnabled: boolean) {
  useEffect(() => {
    if (!hasDecided) return

    if (analyticsEnabled) {
      injectGA()
    } else {
      removeGAScripts()
    }

    return () => {
      // Cleanup on unmount - remove GA scripts
      removeGAScripts()
    }
  }, [hasDecided, analyticsEnabled])
}
