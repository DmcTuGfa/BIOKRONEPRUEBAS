"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { productsData } from "@/lib/products-data"
import { storeProducts } from "@/lib/store-products"
import {
  ShoppingCart,
  Search,
  Leaf,
  Bug,
  Shield,
  CheckCircle2,
  Lock,
  Truck,
  Star,
  RefreshCw,
  Package,
} from "lucide-react"

type Category = "all" | "FUNGICIDAS" | "BIOINSECTICIDAS" | "BIOFORTIFICANTES"

const catIcons: Record<string, React.ElementType> = {
  FUNGICIDAS: Shield,
  BIOINSECTICIDAS: Bug,
  BIOFORTIFICANTES: Leaf,
}

const catColors: Record<Category, string> = {
  all: "text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/30",
  FUNGICIDAS: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  BIOINSECTICIDAS: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30",
  BIOFORTIFICANTES: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
}

const catIconColors: Record<Category, string> = {
  all: "text-slate-600 dark:text-slate-300",
  FUNGICIDAS: "text-blue-600 dark:text-blue-400",
  BIOINSECTICIDAS: "text-orange-600 dark:text-orange-400",
  BIOFORTIFICANTES: "text-green-600 dark:text-green-400",
}

const catLabels: Record<Category, string> = {
  all: "Todos",
  FUNGICIDAS: "Fungicidas",
  BIOINSECTICIDAS: "Bioinsecticidas",
  BIOFORTIFICANTES: "Biofortificantes",
}

export default function TiendaPage() {
  const [category, setCategory] = useState<Category>("all")
  const [search, setSearch] = useState("")
  const [addedId, setAddedId] = useState<string | null>(null)
  const { addToCart, items, totalItems, totalPrice } = useCart()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get("categoria") as Category | null
    if (cat && ["FUNGICIDAS", "BIOINSECTICIDAS", "BIOFORTIFICANTES"].includes(cat)) {
      setCategory(cat)
    }
  }, [])

  const merged = useMemo(() => {
    return productsData.map((p) => {
      const s = storeProducts.find((x) => x.id === p.id)
      return {
        ...p,
        price: s?.price ?? 0,
        priceDisplay: s?.priceDisplay ?? "Consultar",
      }
    })
  }, [])

  const filtered = useMemo(() => {
    return merged.filter((p) => {
      const matchCat = category === "all" || p.category === category
      const matchQ =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchQ
    })
  }, [merged, category, search])

  const stats = useMemo(() => {
    return {
      all: merged.length,
      FUNGICIDAS: merged.filter((p) => p.category === "FUNGICIDAS").length,
      BIOINSECTICIDAS: merged.filter((p) => p.category === "BIOINSECTICIDAS").length,
      BIOFORTIFICANTES: merged.filter((p) => p.category === "BIOFORTIFICANTES").length,
    }
  }, [merged])

  const handleAdd = (product: (typeof merged)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      priceDisplay: product.priceDisplay,
      presentation: product.presentation,
      image: product.image,
      category: product.category,
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
                { icon: Truck, label: "Envío a todo México" },
                { icon: Lock, label: "Pago 100% seguro" },
                { icon: RefreshCw, label: "Devoluciones en 7 días" },
                { icon: Star, label: "Certificados COFEPRIS" },
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(["all", "FUNGICIDAS", "BIOINSECTICIDAS", "BIOFORTIFICANTES"] as Category[]).map((cat) => {
              const isActive = category === cat
              const Icon = cat !== "all" ? catIcons[cat] : Leaf
              const colorClass = catColors[cat]
              const iconColorClass = catIconColors[cat]

              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                    isActive
                      ? `${colorClass} shadow-sm`
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${isActive ? iconColorClass : "text-muted-foreground"}`} />
                    <span className="text-xl font-bold text-foreground">{stats[cat]}</span>
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

          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const Icon = catIcons[product.category]
              const colorClass = catColors[product.category]
              const isAdded = addedId === product.id
              const inCart = items.find((i) => i.id === product.id)

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
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className={`text-xs border ${colorClass}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {catLabels[product.category]}
                      </Badge>
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <Link
                      href={`/tienda/producto/${product.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold text-foreground mb-0.5">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-2">{product.presentation}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xl font-bold text-foreground">{product.priceDisplay}</span>
                        <span className="text-xs text-muted-foreground ml-1">MXN</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAdd(product)}
                        className={isAdded ? "bg-green-600 hover:bg-green-700" : ""}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Agregado
                          </>
                        ) : inCart ? (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            ({inCart.quantity})
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Agregar
                          </>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}
