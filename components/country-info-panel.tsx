"use client"

import Link from "next/link"
import { X, Globe, MessageCircle, Store, Info, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CountryData } from "@/lib/international-coverage-data"

interface CountryInfoPanelProps {
  countryData: CountryData
  onClose: () => void
}

const statusStyles: Record<
  CountryData["status"],
  {
    badge: string
    label: string
  }
> = {
  tienda: {
    badge: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    label: "Compra en línea",
  },
  vendedor: {
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    label: "Vendedor disponible",
  },
  contacto: {
    badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    label: "Atención comercial",
  },
  proximamente: {
    badge: "bg-muted text-muted-foreground border-border",
    label: "Próximamente",
  },
}

export function CountryInfoPanel({ countryData, onClose }: CountryInfoPanelProps) {
  const status = statusStyles[countryData.status]

  return (
    <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
        <div>
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-3 ${status.badge}`}>
            {status.label}
          </div>

          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {countryData.name}
          </h3>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-5 space-y-5">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Observaciones</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {countryData.observations}
              </p>
            </div>
          </div>
        </div>

        {countryData.status === "tienda" && countryData.storeUrl && (
          <Button asChild className="w-full">
            <Link href={countryData.storeUrl}>
              <Store className="h-4 w-4 mr-2" />
              Ir a tienda
            </Link>
          </Button>
        )}

        {countryData.status === "contacto" && countryData.contactUrl && (
          <Button asChild className="w-full">
            <Link href={countryData.contactUrl}>
              <Send className="h-4 w-4 mr-2" />
              Solicitar información
            </Link>
          </Button>
        )}

        {countryData.status === "vendedor" && countryData.agents && countryData.agents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Contactos disponibles
            </h4>

            <div className="space-y-3">
              {countryData.agents.map((agent, index) => {
                const message = encodeURIComponent(
                  `Hola, me interesa información sobre productos BIOKRONE para ${countryData.name}, zona ${agent.zone}.`
                )
                const whatsappUrl = `https://wa.me/${agent.whatsapp}?text=${message}`

                return (
                  <div
                    key={`${agent.zone}-${index}`}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{agent.zone}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {agent.whatsapp}
                        </p>
                      </div>

                      <Button asChild size="sm" className="shrink-0">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {countryData.status === "proximamente" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Esta zona aún no tiene atención activa. Puedes contactarnos para más información.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
