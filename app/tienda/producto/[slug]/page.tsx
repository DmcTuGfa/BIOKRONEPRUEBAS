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
import {
  ShoppingCart, CheckCircle2, ChevronRight, Minus, Plus,
  Leaf, Bug, Shield, FlaskConical, Sprout, FileText, CreditCard, Loader2, Package
} from "lucide-react"

const catIcons: Record<string, React.ElementType> = {
  FUNGICIDAS: Shield,
  BIOINSECTICIDAS: Bug,
  BIOFORTIFICANTES: Leaf,
}
const catLabels: Record<string, string> = {
  FUNGICIDAS: "Fungicidas",
  BIOINSECTICIDAS: "Bioinsecticidas",
  BIOFORTIFICANTES: "Biofortificantes",
}
const catColors: Record<string, string> = {
  FUNGICIDAS: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  BIOINSECTICIDAS: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  BIOFORTIFICANTES: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
}

function fmtPrice(cents: number) {
  return `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export default function ProductoPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState("descripcion")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { addToCart, items, totalItems, totalPrice } = useCart()

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return }
        if (!res.ok) throw new Error("Error")
        const data = await res.json()
        setProduct(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
            <Button asChild><Link href="/tienda">Ver todos los productos</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const Icon = catIcons[product.category] ?? Leaf
  const colorClass = catColors[product.category] ?? ""
  const inCart = items.find((i: any) => i.id === product.id)
  const outOfStock = product.stock <= 0
  const noPrice = product.priceMxn <= 0

  const handleAdd = () => {
    if (outOfStock || noPrice) return
    addToCart({
      id:           product.id,       // ID real de la DB
      name:         product.name,
      slug:         product.slug,     // slug real de la DB
      price:        product.priceMxn,
      priceDisplay: fmtPrice(product.priceMxn),
      presentation: product.presentation,
      image:        product.image,
      category:     product.category,
    }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Mini carrito sticky */}
        {totalItems > 0 && (
          <div className="sticky top-16 z-40 bg-primary text-primary-foreground py-3 shadow-md">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {totalItems} {totalItems === 1 ? "producto" : "productos"} —{" "}
                <strong>${(totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
              </span>
              <Button size="sm" variant="secondary" onClick={() => (window.location.href = "/tienda/checkout")}>
                Pagar →
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Imagen */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
              />
              {outOfStock && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">Agotado</Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <Badge variant="secondary" className={`w-fit text-xs border mb-4 ${colorClass}`}>
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {catLabels[product.category] ?? product.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-1">{product.presentation}</p>
              <p className="text-sm text-muted-foreground mb-6">{product.type}</p>
              <p className="text-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Precio y stock */}
              <div className="mb-6 p-4 rounded-xl bg-muted/40 border border-border">
                {noPrice ? (
                  <p className="text-lg text-muted-foreground italic">Precio a consultar · contacta a ventas</p>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{fmtPrice(product.priceMxn)}</span>
                    <span className="text-muted-foreground">MXN</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {outOfStock ? (
                    <span className="text-destructive font-medium">Sin stock disponible</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">✓ En stock ({product.stock} disponibles)</span>
                  )}
                </p>
              </div>

              {/* Cantidad y agregar */}
              {!outOfStock && !noPrice && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-5 font-semibold text-foreground min-w-[3rem] text-center">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className={`flex-1 gap-2 ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
                    onClick={handleAdd}
                    disabled={added}
                  >
                    {added ? (
                      <><CheckCircle2 className="h-5 w-5" />Agregado al carrito</>
                    ) : inCart ? (
                      <><ShoppingCart className="h-5 w-5" />Agregar más ({inCart.quantity} en carrito)</>
                    ) : (
                      <><ShoppingCart className="h-5 w-5" />Agregar al carrito</>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-primary" />Pago seguro con Stripe</span>
                <span className="flex items-center gap-1"><Sprout className="h-3.5 w-3.5 text-primary" />Certificado COFEPRIS</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="flex gap-1 border-b border-border mb-6">
              {[
                { id: "descripcion", label: "Descripción", icon: FileText },
                { id: "beneficios",  label: "Beneficios",  icon: Sprout },
                { id: "aplicacion",  label: "Aplicación",  icon: FlaskConical },
              ].map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {tab === "descripcion" && (
                <p className="text-foreground leading-relaxed">
                  {product.fullDescription || product.description}
                </p>
              )}
              {tab === "beneficios" && (
                <ul className="space-y-2">
                  {(product.benefits ?? []).map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                  {(!product.benefits || product.benefits.length === 0) && (
                    <p className="text-muted-foreground italic">Sin información de beneficios.</p>
                  )}
                </ul>
              )}
              {tab === "aplicacion" && (
                <p className="text-foreground leading-relaxed">
                  {product.application || "Consultar con el equipo técnico para dosis y modo de aplicación."}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
