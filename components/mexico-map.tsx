"use client"

import { useEffect, useState } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

const geoUrl = "https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json"

export interface ZoneAgent {
  zone: string
  whatsapp: string
}

export interface StateData {
  name: string
  status: "activa" | "distribuidor" | "proximamente"
  observations: string
  agents?: ZoneAgent[]
}

const coverageData: Record<string, StateData> = {
  Jalisco: {
    name: "Jalisco",
    status: "activa",
    observations: "Cobertura completa en toda la región con múltiples zonas de atención.",
    agents: [
      { zone: "JALISCO SUR", whatsapp: "4611012083" },
      { zone: "JALISCO VALLES", whatsapp: "4611169676" },
      { zone: "JALISCO", whatsapp: "4612118091" },
    ],
  },
  Colima: {
    name: "Colima",
    status: "activa",
    observations: "Atención por zona Jalisco Sur.",
    agents: [{ zone: "JALISCO SUR", whatsapp: "4611012083" }],
  },
  Michoacán: {
    name: "Michoacán",
    status: "activa",
    observations: "Especialización en cultivos de aguacate. Múltiples zonas de atención.",
    agents: [
      { zone: "MICHOACAN SUR", whatsapp: "4612528254" },
      { zone: "URUAPAN, MICHOACAN", whatsapp: "4611041012" },
      { zone: "YURECUARO, MICH.", whatsapp: "4612118091" },
      { zone: "ZAMORA MICHOACAN", whatsapp: "4611040445" },
    ],
  },
  Guanajuato: {
    name: "Guanajuato",
    status: "activa",
    observations: "Centro de distribución principal.",
    agents: [
      { zone: "GTO CENTRO", whatsapp: "4611698696" },
      { zone: "GTO OESTE", whatsapp: "4612699137" },
      { zone: "GTO SUR", whatsapp: "4611689696" },
    ],
  },
  Querétaro: {
    name: "Querétaro",
    status: "activa",
    observations: "Atención directa de fábrica.",
    agents: [{ zone: "QUERETARO, QRO.", whatsapp: "4612284158" }],
  },
  Hidalgo: {
    name: "Hidalgo",
    status: "activa",
    observations: "Cobertura activa.",
    agents: [{ zone: "QRO - HIDALGO", whatsapp: "4611044772" }],
  },
  Aguascalientes: {
    name: "Aguascalientes",
    status: "activa",
    observations: "Servicio técnico disponible.",
    agents: [{ zone: "ZACATECAS - AGS", whatsapp: "4611699459" }],
  },
  Zacatecas: {
    name: "Zacatecas",
    status: "activa",
    observations: "Cobertura activa en la zona.",
    agents: [{ zone: "ZACATECAS - AGS", whatsapp: "4611699459" }],
  },
  Nayarit: {
    name: "Nayarit",
    status: "activa",
    observations: "Cobertura en zonas agrícolas principales.",
    agents: [{ zone: "NAYARIT", whatsapp: "4611196484" }],
  },
  "Estado de México": {
    name: "Estado de México",
    status: "activa",
    observations: "Gerencia regional.",
    agents: [{ zone: "GERENCIA — EDO DE MEXICO", whatsapp: "4611040803" }],
  },
  "Ciudad de México": {
    name: "Ciudad de México",
    status: "activa",
    observations: "Oficina comercial.",
    agents: [{ zone: "GERENCIA — EDO DE MEXICO", whatsapp: "4611040803" }],
  },
  Morelos: {
    name: "Morelos",
    status: "activa",
    observations: "Centro de demostración activo.",
    agents: [{ zone: "MORELOS, MOR.", whatsapp: "4611042079" }],
  },
  Puebla: {
    name: "Puebla",
    status: "activa",
    observations: "Atención directa disponible.",
    agents: [{ zone: "PUEBLA, PUEBLA", whatsapp: "4611042079" }],
  },
  Tlaxcala: {
    name: "Tlaxcala",
    status: "distribuidor",
    observations: "Distribuidor autorizado.",
    agents: [{ zone: "PUEBLA, PUEBLA", whatsapp: "4611042079" }],
  },
  Guerrero: {
    name: "Guerrero",
    status: "activa",
    observations: "Cobertura activa en la zona.",
    agents: [{ zone: "GUERRERO", whatsapp: "7351777602" }],
  },
  Chihuahua: {
    name: "Chihuahua",
    status: "distribuidor",
    observations: "Distribuidor autorizado: Zona Norte.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  Coahuila: {
    name: "Coahuila",
    status: "distribuidor",
    observations: "Distribuidor autorizado: Zona Norte.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  "Nuevo León": {
    name: "Nuevo León",
    status: "distribuidor",
    observations: "Distribuidor autorizado: Zona Norte.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  Tamaulipas: {
    name: "Tamaulipas",
    status: "distribuidor",
    observations: "Distribuidor autorizado: Zona Norte.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  Durango: {
    name: "Durango",
    status: "distribuidor",
    observations: "Distribuidor autorizado: Zona Norte.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  "San Luis Potosí": {
    name: "San Luis Potosí",
    status: "distribuidor",
    observations: "Red de distribuidores certificados.",
    agents: [{ zone: "ZONA NORTE", whatsapp: "4611195234" }],
  },
  Sinaloa: { name: "Sinaloa", status: "proximamente", observations: "Expansión programada." },
  Sonora: { name: "Sonora", status: "proximamente", observations: "Expansión programada." },
  "Baja California": { name: "Baja California", status: "proximamente", observations: "Expansión programada." },
  "Baja California Sur": { name: "Baja California Sur", status: "proximamente", observations: "Expansión programada." },
  Veracruz: { name: "Veracruz", status: "proximamente", observations: "Expansión en planificación." },
  Oaxaca: { name: "Oaxaca", status: "proximamente", observations: "Expansión programada para 2026." },
  Chiapas: { name: "Chiapas", status: "proximamente", observations: "En proceso de certificación." },
  Tabasco: { name: "Tabasco", status: "proximamente", observations: "Evaluación de mercado." },
  Campeche: { name: "Campeche", status: "proximamente", observations: "Próxima apertura." },
  Yucatán: { name: "Yucatán", status: "proximamente", observations: "Expansión en planificación." },
  "Quintana Roo": { name: "Quintana Roo", status: "proximamente", observations: "En proceso." },
}

const getStateColor = (stateName: string, isHovered: boolean, isDark: boolean) => {
  const d = coverageData[stateName]
  if (!d) return isHovered ? (isDark ? "#4b5563" : "#d1d5db") : isDark ? "#374151" : "#e5e7eb"

  switch (d.status) {
    case "activa":
      return isHovered ? "#15803d" : "#22c55e"
    case "distribuidor":
      return isHovered ? "#65a30d" : "#84cc16"
    case "proximamente":
      return isHovered ? (isDark ? "#4b5563" : "#9ca3af") : isDark ? "#374151" : "#d1d5db"
    default:
      return isHovered ? (isDark ? "#4b5563" : "#d1d5db") : isDark ? "#374151" : "#e5e7eb"
  }
}

interface MexicoMapProps {
  onStateClick: (state: StateData | null) => void
}

export function MexicoMap({ onStateClick }: MexicoMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1200, center: [-102, 23] }}
        className="w-full h-auto"
        style={{ maxHeight: "500px" }}
      >
        <ZoomableGroup
          center={[-102, 23]}
          zoom={1}
          minZoom={1}
          maxZoom={1}
          translateExtent={[
            [-1000, -1000],
            [1000, 1000],
          ]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name
                const isHovered = hoveredState === stateName

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateColor(stateName, isHovered, isDark)}
                    stroke={isDark ? "#111827" : "#ffffff"}
                    strokeWidth={0.6}
                    style={{
                      default: {
                        outline: "none",
                        transition: "fill 0.25s ease, filter 0.25s ease",
                      },
                      hover: {
                        outline: "none",
                        cursor: "pointer",
                        filter: "brightness(1.05)",
                        transition: "fill 0.25s ease, filter 0.25s ease",
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      const d = coverageData[stateName]
                      onStateClick(
                        d ?? {
                          name: stateName,
                          status: "proximamente",
                          observations: "Información no disponible.",
                        },
                      )
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {[
          { color: "bg-[#22c55e]", label: "Cobertura activa" },
          { color: "bg-[#84cc16]", label: "Distribuidor" },
          { color: "bg-muted-foreground/30", label: "Próximamente" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { coverageData }
