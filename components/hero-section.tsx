"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Package, ArrowRight, Leaf, Shield, Sprout } from "lucide-react"

// ✏️ Cambia esta variable para actualizar la imagen del hero fácilmente
const HERO_BG_IMAGE = "/images/campo-hero.jpg"

interface HeroSectionProps {
  onScrollTo: (section: string) => void
}

export function HeroSection({ onScrollTo }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Grid pattern sutil encima del overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 border border-primary/30">
            <Leaf className="h-4 w-4" />
            Soluciones biológicas para la agricultura mexicana
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight drop-shadow-lg">
            Cobertura y Portafolio de Productos
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto text-pretty drop-shadow">
            Consulta las zonas de atención en México y explora nuestras líneas de productos biológicos para una agricultura sustentable y de alto rendimiento.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => onScrollTo("cobertura")} className="gap-2 text-base">
              <MapPin className="h-5 w-5" />
              Ver cobertura
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onScrollTo("productos")}
              className="gap-2 text-base bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Package className="h-5 w-5" />
              Explorar productos
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Leaf,   title: "100% Biológicos",   desc: "Productos de origen natural seguros para el medio ambiente" },
              { icon: Shield, title: "Certificados",       desc: "Registros COFEPRIS y certificaciones de calidad" },
              { icon: Sprout, title: "Alto Rendimiento",   desc: "Tecnología que maximiza la productividad de tus cultivos" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm hover:bg-black/50 transition-colors">
                <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
