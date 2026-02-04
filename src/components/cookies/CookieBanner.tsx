"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCookieConsent } from "@/contexts/CookieConsentContext"

export function CookieBanner() {
  const { showBanner, acceptAll, rejectOptional, openPreferences } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-background border-t shadow-lg">
        <div className="container-main py-4 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Utilizamos cookies para melhorar sua experiência. Cookies essenciais são
              necessários para o funcionamento do site. Você pode gerenciar suas preferências
              a qualquer momento.{" "}
              <Link
                href="/privacidade"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Política de Privacidade
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={rejectOptional}>
                Rejeitar Opcionais
              </Button>
              <Button variant="outline" size="sm" onClick={openPreferences}>
                Gerenciar Preferências
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Aceitar Todos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
