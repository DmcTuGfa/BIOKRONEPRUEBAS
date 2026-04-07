"use client"

import { useEffect, useState } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import {
  internationalCoverageData,
  type CountryData,
} from "@/lib/international-coverage-data"

const geoUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"

const getCountryColor = (
  countryName: string,
  isHovered: boolean,
  isDark: boolean,
) => {
  const d = internationalCoverageData[countryName]

  if (!d) {
    return isHovered
      ? isDark
        ? "#4b5563"
        : "#d1d5db"
      : isDark
        ? "#374151"
        : "#e5e7eb"
  }

  switch (d.status) {
    case "tienda":
      return isHovered ? "#15803d" : "#22c55e"
    case "vendedor":
      return isHovered ? "#2563eb" : "#3b82f6"
    case "contacto":
      return isHovered ? "#c2410c" : "#f97316"
    case "proximamente":
      return isHovered
        ? isDark
          ? "#4b5563"
          : "#9ca3af"
        : isDark
          ? "#374151"
          : "#d1d5db"
    default:
      return isHovered
        ? isDark
          ? "#4b5563"
          : "#d1d5db"
        : isDark
          ? "#374151"
          : "#e5e7eb"
  }
}

interface LatamMapProps {
  onCountryClick: (country: CountryData | null) => void
}

export function LatamMap({ onCountryClick }: LatamMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
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

  const excludedCountries = new Set([
  "Mexico",
  "Cuba",
  "Haiti",
  "Jamaica",
  "Dominican Republic",
  "Puerto Rico",
])
  const allowedCountries = new Set(
    Object.keys(internationalCoverageData).filter(
      (country) => !excludedCountries.has(country)
    )
  )

  return (
   <div className="w-full">
  <ComposableMap
    projection="geoMercator"
    projectionConfig={{
      scale: 400,
      center: [-75, -23],
    }}
    className="w-full h-auto"
    style={{ maxHeight: "700px" }}
  >
    <ZoomableGroup
      center={[-75, -23]}
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
              geographies
                .filter((geo) => allowedCountries.has(geo.properties.name))
                .map((geo) => {
                  const countryName = geo.properties.name
                  const isHovered = hoveredCountry === countryName

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryColor(countryName, isHovered, isDark)}
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
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => setHoveredCountry(countryName)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => {
                        const d = internationalCoverageData[countryName]

                        onCountryClick(
                          d ?? {
                            name: countryName,
                            status: "proximamente",
                            observations: "Información no disponible.",
                          }
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
          { color: "bg-[#22c55e]", label: "Tienda" },
          { color: "bg-[#3b82f6]", label: "Vendedor" },
          { color: "bg-[#f97316]", label: "Contacto" },
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
