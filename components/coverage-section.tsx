"use client"

import { useState } from "react"
import { MexicoMap, type StateData } from "./mexico-map"
import { StateInfoPanel } from "./state-info-panel"

export function CoverageSection() {
  const [selectedState, setSelectedState] = useState<StateData | null>(null)

  return (
    <section id="cobertura" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Nuestra Cobertura en Mexico
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Haz clic en cualquier estado para conocer el estatus de cobertura y contactar directamente con tu
            asesor de zona.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <MexicoMap onStateClick={setSelectedState} />
          </div>

          <div className="lg:col-span-1">
            {selectedState ? (
              <StateInfoPanel stateData={selectedState} onClose={() => setSelectedState(null)} />
            ) : (
              <div className="p-6 rounded-2xl bg-card border border-border text-center">
                <div className="p-4 rounded-xl bg-muted/50 w-fit mx-auto mb-4">
                  <svg
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Selecciona un estado</h3>
                <p className="text-sm text-muted-foreground">
                  Haz clic en el mapa para ver la informacion de cobertura y contactar a tu asesor
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
