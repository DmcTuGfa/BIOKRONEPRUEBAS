"use client"

import { useCallback } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CoverageSection } from "@/components/coverage-section"
import { InternationalCoverageSection } from "@/components/international-coverage-section"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Bug, Leaf } from "lucide-react"
import { productsData } from "@/lib/products-data"

const PORTAFOLIO_BG_IMAGE = "/images/campo-hero.jpg"

export default function Home() {
  const scrollToSection = useCallback((section: string) => {
    const element = document.getElementById(section)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }, [])

  const categoryStats = {
    FUNGICIDAS: productsData.filter((p) => p.category === "FUNGICIDAS").length,
    BIOINSECTICIDAS: productsData.filter((p) => p.category === "BIOINSECTICIDAS").length,
    BIOFORTIFICANTES: productsData.filter((p) => p.category === "BIOFORTIFICANTES").length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onScrollTo={scrollToSection} />
      <main className="flex-1">
        <HeroSection onScrollTo={scrollToSection} />

        {/* Cobertura México */}
        <section id="cobertura" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <CoverageSection />
          </div>
        </section>

        {/* Cobertura Internacional */}
        <section id="internacional" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <InternationalCoverageSection />
          </div>
        </section>

        {/* Portafolio */}
        <section
          id="productos"
          className="relative py-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${PORTAFOLIO_BG_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance drop-shadow-lg">
                Nuestro Portafolio de Productos
              </h2>
              <p className="text-white/75 max-w-2xl mx-auto text-pretty">
                Explora nuestra línea completa de soluciones biológicas para la agricultura sostenible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
              <Link href="/tienda?categoria=FUNGICIDAS">
                <Card className="group hover:shadow-xl transition-all hover:border-blue-500/50 cursor-pointer h-full bg-black/50 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Fungicidas</h3>
                    <p className="text-sm text-white/60 mb-3">Control de hongos, bacterias y nematodos</p>
                    <span className="text-2xl font-bold text-blue-400">{categoryStats.FUNGICIDAS}</span>
                    <span className="text-white/60 text-sm ml-1">productos</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tienda?categoria=BIOINSECTICIDAS">
                <Card className="group hover:shadow-xl transition-all hover:border-orange-500/50 cursor-pointer h-full bg-black/50 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/20 mb-4 group-hover:scale-110 transition-transform">
                      <Bug className="h-7 w-7 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Bioinsecticidas</h3>
                    <p className="text-sm text-white/60 mb-3">Control de plagas e insectos</p>
                    <span className="text-2xl font-bold text-orange-400">{categoryStats.BIOINSECTICIDAS}</span>
                    <span className="text-white/60 text-sm ml-1">productos</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tienda?categoria=BIOFORTIFICANTES">
                <Card className="group hover:shadow-xl transition-all hover:border-green-500/50 cursor-pointer h-full bg-black/50 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-500/20 mb-4 group-hover:scale-110 transition-transform">
                      <Leaf className="h-7 w-7 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Biofortificantes</h3>
                    <p className="text-sm text-white/60 mb-3">Nutrición y bioestimulación</p>
                    <span className="text-2xl font-bold text-green-400">{categoryStats.BIOFORTIFICANTES}</span>
                    <span className="text-white/60 text-sm ml-1">productos</span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/tienda">
                  Ver todos los productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="contacto" className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                ¿Listo para mejorar tus cultivos?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Comunícate con nuestro equipo de expertos y recibe asesoría personalizada para tus necesidades agrícolas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="outline">
                  <Link href="/contacto">
                    Ver información de contacto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
