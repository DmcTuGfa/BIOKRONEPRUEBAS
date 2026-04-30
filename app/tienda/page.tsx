"use client"

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import {
  ShoppingCart, Search, Leaf, Bug, Shield,
  CheckCircle2, Lock, Truck, Star, RefreshCw, Package, Loader2
} from "lucide-react"

type Category = "all" | "FUNGICIDAS" | "BIOINSECTICIDAS" | "BIOFORTIFICANTES"

// Tipo que viene de la API /api/products (datos reales de Neon)
interface DBProduct {
  id: string
  slug: string
  name: string
  description: string
  fullDescription: string
  presentation: string
  type: string
  category: string
  image: string
  priceMxn: number   // centavos
  stock: number
  active: boolean
}

const catIcons: Record<string, React.ElementType> = {
  FUNGICIDAS: Shield,
  BIOINSECTICIDAS: Bug,
  BIOFORTIFICANTES: Leaf,
}

const catColors: Record<string, string> = {
  all: "text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/30",
  FUNGICIDAS: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  BIOINSECTICIDAS: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  BIOFORTIFICANTES: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
}

const catLabels: Record<string, string> = {
  all: "Todos",
  FUNGICIDAS: "Fungicidas",
  BIOINSECTICIDAS: "Bioinsecticidas",
  BIOFORTIFICANTES: "Biofortificantes",
}

function fmtPrice(cents: number) {
  return `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export default function TiendaPage() {
  const [category, setCategory] = useState<Category>("all")
  const [search, setSearch] = useState("")
  const [addedId, setAddedId] = useState<string | null>(null)
  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart, items, totalItems, totalPrice } = useCart()

  // Leer categoría de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get("categoria") as Category | null
    if (cat && ["FUNGICIDAS", "BIOINSECTICIDAS", "BIOFORTIFICANTES"].includes(cat)) {
      setCategory(cat)
    }
  }, [])

  // Cargar productos desde la DB (vía /api/products)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" })
        if (!res.ok) throw new Error("Error al cargar productos")
        const data = await res.json()
        setProducts(Array.isArray(data) ? data.filter((p: DBProduct) => p.active) : [])
      } catch (e) {
        setError("No se pudieron cargar los productos. Intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category
      const matchQ =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchQ
    })
  }, [products, category, search])

  const stats = useMemo(() => ({
    all: products.length,
    FUNGICIDAS: products.filter((p) => p.category === "FUNGICIDAS").length,
    BIOINSECTICIDAS: products.filter((p) => p.category === "BIOINSECTICIDAS").length,
    BIOFORTIFICANTES: products.filter((p) => p.category === "BIOFORTIFICANTES").length,
  }), [products])

  const handleAdd = (product: DBProduct) => {
    if (product.stock <= 0 || product.priceMxn <= 0) return
    addToCart({
      id:           product.id,      // ID real de la DB (cuid)
      name:         product.name,
      slug:         product.slug,    // slug real de la DB
      price:        product.priceMxn,
      priceDisplay: fmtPrice(product.priceMxn),
      presentation: product.presentation,
      image:        product.image,
      category:     product.category,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary/5 border-b border-border py-10">
          <div className="container mx-auto px-4">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Pagos seguros con Stripe
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Catálogo de Productos
            </h1>
            <p className="text-muted-foreground mb-5">
              Soluciones biológicas certificadas · Envío a toda la República Mexicana
            </p>
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              {[
                { icon: Truck,    label: "Envío a todo México" },
                { icon: Lock,     label: "Pago 100% seguro" },
                { icon: RefreshCw,label: "Devoluciones en 7 días" },
                { icon: Star,     label: "Certificados COFEPRIS" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {totalItems > 0 && (
          <div className="sticky top-16 z-40 bg-primary text-primary-foreground py-3 shadow-md">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {totalItems} {totalItems === 1 ? "producto" : "productos"} —{" "}
                <strong>
                  ${(totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </strong>
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => (window.location.href = "/tienda/checkout")}
              >
                Pagar →
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">

          {/* Filtros de categoría */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(["all", "FUNGICIDAS", "BIOINSECTICIDAS", "BIOFORTIFICANTES"] as const).map((cat) => {
              const isActive = category === cat
              const Icon = cat !== "all" ? (catIcons[cat] ?? Leaf) : Leaf
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                    isActive ? `${catColors[cat]} shadow-sm` : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${isActive ? "" : "text-muted-foreground"}`} />
                    <span className="text-xl font-bold text-foreground">
                      {loading ? "—" : stats[cat]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{catLabels[cat]}</p>
                </button>
              )
            })}
          </div>

          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Estado de carga / error */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product) => {
                  const Icon = catIcons[product.category] ?? Leaf
                  const colorClass = catColors[product.category] ?? ""
                  const isAdded = addedId === product.id
                  const inCart = items.find((i) => i.id === product.id)
                  const outOfStock = product.stock <= 0
                  const noPrice = product.priceMxn <= 0

                  return (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                    >
                      <Link
                        href={`/tienda/producto/${product.slug}`}
                        className="block relative aspect-square bg-muted overflow-hidden"
                      >
                        <Image
                          src={product.image || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className={`text-xs border ${colorClass}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {catLabels[product.category] ?? product.category}
                          </Badge>
                        </div>
                        {outOfStock && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">Agotado</Badge>
                          </div>
                        )}
                      </Link>

                      <div className="p-4 flex-1 flex flex-col">
                        <Link href={`/tienda/producto/${product.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-foreground mb-0.5">{product.name}</h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mb-2">{product.presentation}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <div>
                            {noPrice ? (
                              <span className="text-sm text-muted-foreground italic">Consultar precio</span>
                            ) : (
                              <>
                                <span className="text-xl font-bold text-foreground">
                                  {fmtPrice(product.priceMxn)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">MXN</span>
                              </>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleAdd(product)}
                            className={isAdded ? "bg-green-600 hover:bg-green-700" : ""}
                            disabled={isAdded || outOfStock || noPrice}
                          >
                            {isAdded ? (
                              <><CheckCircle2 className="h-4 w-4 mr-1" />Agregado</>
                            ) : outOfStock ? (
                              "Agotado"
                            ) : inCart ? (
                              <><ShoppingCart className="h-4 w-4 mr-1" />({inCart.quantity})</>
                            ) : (
                              <><ShoppingCart className="h-4 w-4 mr-1" />Agregar</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sin resultados</h3>
                  <p className="text-muted-foreground">Intenta con otro filtro o búsqueda.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
