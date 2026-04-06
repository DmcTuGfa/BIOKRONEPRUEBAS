"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, CheckCircle2, Building2, Clock, MessageCircle } from "lucide-react"
import type { StateData } from "./mexico-map"

interface StateInfoPanelProps {
  stateData: StateData | null
  onClose: () => void
}

const getStatusInfo = (status: StateData["status"]) => {
  switch (status) {
    case "activa":       return { label: "Cobertura activa", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-green-500" }
    case "distribuidor": return { label: "Distribuidor",      icon: <Building2    className="h-4 w-4" />, color: "bg-lime-500" }
    case "proximamente": return { label: "Próximamente",      icon: <Clock        className="h-4 w-4" />, color: "bg-gray-400" }
  }
}

export function StateInfoPanel({ stateData, onClose }: StateInfoPanelProps) {
  if (!stateData) return null

  const statusInfo = getStatusInfo(stateData.status)

  const handleWhatsApp = (whatsapp: string, zone: string) => {
    const msg = encodeURIComponent(`Hola, me interesa información sobre productos BIOKRONE para la zona ${zone}`)
    window.open(`https://wa.me/52${whatsapp}?text=${msg}`, "_blank")
  }

  return (
    <Card className="animate-in slide-in-from-right-5 duration-300 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{stateData.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
          <Badge variant="outline" className="gap-1">
            {statusInfo.icon}{statusInfo.label}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{stateData.observations}</p>

        {/* One button per agent */}
        {stateData.agents && stateData.agents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {stateData.agents.length === 1 ? "Agente de zona" : "Agentes de zona"}
            </p>
            {stateData.agents.map((agent) => (
              <Button key={agent.zone} onClick={() => handleWhatsApp(agent.whatsapp, agent.zone)}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white gap-2">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm truncate">{agent.zone}</p>
                  <p className="text-xs text-green-100">+52 {agent.whatsapp}</p>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Proximamente — no agents */}
        {stateData.status === "proximamente" && !stateData.agents && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground text-center">
            Esta zona estará disponible próximamente.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
