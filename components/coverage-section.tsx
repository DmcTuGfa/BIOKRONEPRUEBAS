"use client"

import { useState } from "react"
import { MexicoMap, type StateData } from "./mexico-map"
import { StateInfoPanel } from "./state-info-panel"
import { LatamMap } from "./latam-map"
import { CountryInfoPanel } from "./country-info-panel"
import type { CountryData } from "@/lib/international-coverage-data"
import { Button } from "@/components/ui/button"

type CoverageTab = "mexico" | "internacional"

export function CoverageSection() {
  const [activeTab, setActiveTab] = useState<CoverageTab>("mexico")
  const [selectedState, setSelectedState] = useState<StateData | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)

  return (
    <section id="cobertura" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Cobertura y Disponibilidad de Envío
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Selecciona México o Internacional para consultar cobertura, disponibilidad de envío y atención comercial.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            type="button"
            variant={activeTab === "mexico" ? "default" : "outline"}
            onClick={() => setActiveTab("mexico")}
          >
            México
          </Button>

          <Button
            type="button"
            variant={activeTab === "internacional" ? "default" : "outline"}
            onClick={() => setActiveTab("internacional")}
          >
            Internacional
          </Button>
        </div>

        {activeTab === "mexico" && (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                Cobertura en México
              </h3>
              <p className="text-muted-foreground">
                Haz clic en cualquier estado para conocer el estatus de cobertura y contactar directamente con tu asesor de zona.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm">
                <MexicoMap onStateClick={setSelectedState} />
              </div>

              <div className="lg:col-span-1">
                {selectedState ? (
                  <StateInfoPanel
                    stateData={selectedState}
                    onClose={() => setSelectedState(null)}
                  />
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
                      Haz clic en el mapa para ver la información de cobertura y contactar a tu asesor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "internacional" && (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                Cobertura Internacional
              </h3>
              <p className="text-muted-foreground">
                Selecciona un país para revisar si hay envío internacional, vendedor o atención comercial.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm">
                <LatamMap onCountryClick={setSelectedCountry} />
              </div>

              <div className="lg:col-span-1">
                {selectedCountry ? (
                  <CountryInfoPanel
                    countryData={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                  />
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
                    <h3 className="font-semibold text-foreground mb-2">Selecciona un país</h3>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el mapa para ver disponibilidad de envío o atención comercial.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
