"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useCookieConsent } from "@/contexts/CookieConsentContext"

const categories = [
  {
    id: "necessary" as const,
    label: "Essenciais",
    description:
      "Cookies necessários para o funcionamento básico do site, como autenticação e segurança.",
    locked: true,
  },
  {
    id: "analytics" as const,
    label: "Analítica",
    description:
      "Cookies que nos ajudam a entender como você utiliza o site, permitindo melhorias contínuas.",
    locked: false,
  },
  {
    id: "marketing" as const,
    label: "Marketing",
    description:
      "Cookies utilizados para personalizar anúncios e medir a eficácia de campanhas.",
    locked: false,
  },
]

export function CookiePreferencesModal() {
  const { consent, preferencesOpen, closePreferences, savePreferences } = useCookieConsent()

  const [analytics, setAnalytics] = useState(consent.analytics)
  const [marketing, setMarketing] = useState(consent.marketing)

  // Sync local state when consent changes or modal opens
  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent.analytics)
      setMarketing(consent.marketing)
    }
  }, [preferencesOpen, consent.analytics, consent.marketing])

  function handleSave() {
    savePreferences({
      necessary: true,
      analytics,
      marketing,
    })
  }

  return (
    <Dialog open={preferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preferências de Cookies</DialogTitle>
          <DialogDescription>
            Gerencie suas preferências de cookies. Cookies essenciais não podem ser
            desativados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {categories.map((category) => {
            const checked =
              category.id === "necessary"
                ? true
                : category.id === "analytics"
                  ? analytics
                  : marketing

            const onCheckedChange =
              category.id === "analytics"
                ? setAnalytics
                : category.id === "marketing"
                  ? setMarketing
                  : undefined

            return (
              <div
                key={category.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.label}</span>
                    {category.locked && (
                      <Badge variant="secondary" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <Switch
                  checked={checked}
                  onCheckedChange={onCheckedChange}
                  disabled={category.locked}
                  aria-label={category.label}
                />
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closePreferences}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Preferências</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
