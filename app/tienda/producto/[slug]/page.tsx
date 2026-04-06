"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { productsData } from "@/lib/products-data"
import { storeProducts } from "@/lib/store-products"
import { ShoppingCart, CheckCircle2, ChevronRight, Minus, Plus, Leaf, Bug, Shield, FlaskConical, Sprout, FileText, CreditCard } from "lucide-react"

const catIcons: Record<string, React.ElementType> = { FUNGICIDAS: Shield, BIOINSECTICIDAS: Bug, BIOFORTIFICANTES: Leaf }
const catLabels: Record<string, string> = { FUNGICIDAS: "Fungicidas", BIOINSECTICIDAS: "Bioinsecticidas", BIOFORTIFICANTES: "Biofortificantes" }
const catColors: Record<string, string> = {
  FUNGICIDAS: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  BIOINSECTICIDAS: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  BIOFORTIFICANTES: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
}

export default function ProductoPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState("descripcion")
  const { addToCart, items, totalItems, totalPrice } = useCart()

  const product = productsData.find(p => p.slug === slug)
  const storeP  = storeProducts.find(s => s.slug === slug)

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Button asChild><Link href="/tienda">Volver al catálogo</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  )

  const Icon = catIcons[product.category]
  const colorClass = catColors[product.category]
  const price = storeP?.price ?? 0
  const priceDisplay = storeP?.priceDisplay ?? "Consultar"
  const inCart = items.find(i => i.id === product.id)

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, slug: product.slug, price, priceDisplay, presentation: product.presentation, image: product.image, category: product.category }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Sticky cart bar */}
        {totalItems > 0 && (
          <div className="sticky top-16 z-40 bg-primary text-primary-foreground py-3 shadow-md">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {totalItems} {totalItems === 1 ? "producto" : "productos"} — <strong>${(totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
              </span>
              <Button size="sm" variant="secondary" onClick={() => window.location.href = "/tienda/checkout"}>Pagar →</Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>

          {/* Main grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Big image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-sm">
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <Badge variant="outline" className={`w-fit mb-4 ${colorClass}`}>
                <Icon className="h-3.5 w-3.5 mr-1.5" />{catLabels[product.category]}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-1">{product.presentation}</p>
              <p className="text-sm text-muted-foreground mb-6">{product.type}</p>
              <p className="text-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-foreground">{priceDisplay}</span>
                <span className="text-muted-foreground">MXN / unidad</span>
              </div>

              {/* Qty + Add to cart */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-card">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-muted transition-colors active:scale-95">
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="px-5 py-3 font-bold text-foreground text-xl min-w-[4rem] text-center select-none">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="px-4 py-3 hover:bg-muted transition-colors active:scale-95">
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                <Button size="lg" onClick={handleAddToCart}
                  className={`flex-1 h-12 text-base ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
                  disabled={added}>
                  {added
                    ? <><CheckCircle2 className="h-5 w-5 mr-2" />¡Agregado al carrito!</>
                    : <><ShoppingCart className="h-5 w-5 mr-2" />Agregar {qty > 1 ? `${qty} unidades` : "al carrito"}</>}
                </Button>
              </div>

              {inCart && (
                <p className="text-sm text-muted-foreground mb-4">
                  Ya tienes <strong className="text-foreground">{inCart.quantity}</strong> {inCart.quantity === 1 ? "unidad" : "unidades"} en el carrito.
                </p>
              )}

              <Button variant="outline" size="lg" className="h-12 text-base"
                onClick={() => window.location.href = "/tienda/checkout"}>
                <CreditCard className="h-5 w-5 mr-2" />Comprar ahora
              </Button>

              {/* Trust */}
              <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                {["Envío a todo México", "Pago seguro Stripe", "Certificado COFEPRIS", "Devoluciones en 7 días"].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border border-border rounded-2xl overflow-hidden mb-10">
            <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
              {[
                { id: "descripcion", label: "Descripción completa", icon: FileText },
                { id: "beneficios",  label: "Beneficios",           icon: Sprout },
                { id: "aplicacion",  label: "Modo de aplicación",   icon: FlaskConical },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${tab === t.id ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="h-4 w-4" />{t.label}
                </button>
              ))}
            </div>
            <div className="p-6 md:p-8">
              {tab === "descripcion" && <p className="text-foreground leading-relaxed max-w-3xl">{product.fullDescription}</p>}
              {tab === "beneficios" && (
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
                  {product.benefits?.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{b}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "aplicacion" && (
                <div className="p-5 rounded-xl bg-muted/50 border border-border max-w-2xl">
                  <h4 className="font-semibold text-foreground mb-3">Instrucciones de aplicación</h4>
                  <p className="text-muted-foreground leading-relaxed">{product.application}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" asChild><Link href="/tienda">← Ver todos los productos</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
