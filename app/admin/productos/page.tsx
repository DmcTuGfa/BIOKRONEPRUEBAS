"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import {
  Loader2, Pencil, Check, X, Plus, Search,
  Package, Image as ImageIcon, ToggleLeft, ToggleRight
} from "lucide-react"

const CATEGORIES = ["BIOINSECTICIDAS", "FUNGICIDAS", "BIOFORTIFICANTES"]

function fmtMXN(c: number) {
  return c > 0 ? `$${(c / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "Sin precio"
}

function ProductRow({ product, onUpdated }: { product: any; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    name: product.name,
    priceMxn: product.priceMxn,
    stock: product.stock,
    active: product.active,
    image: product.image,
    description: product.description,
    presentation: product.presentation,
    category: product.category,
  })

  const save = async () => {
    setSaving(true)
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, priceMxn: parseInt(String(data.priceMxn)), stock: parseInt(String(data.stock)) }),
    })
    setSaving(false)
    setEditing(false)
    onUpdated()
  }

  const cancel = () => {
    setData({
      name: product.name, priceMxn: product.priceMxn, stock: product.stock,
      active: product.active, image: product.image, description: product.description,
      presentation: product.presentation, category: product.category,
    })
    setEditing(false)
  }

  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData(d => ({ ...d, [k]: e.target.value }))

  return (
    <Card className={!data.active ? "opacity-60" : ""}>
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                <Image src={data.image} alt={data.name} fill className="object-cover" sizes="56px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                <Input className="h-8 text-sm" value={data.name} onChange={set("name")} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Precio (centavos)</p>
                <Input className="h-8 text-sm" type="number" value={data.priceMxn} onChange={set("priceMxn")} />
                <p className="text-xs text-muted-foreground mt-0.5">{fmtMXN(Number(data.priceMxn))}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stock</p>
                <Input className="h-8 text-sm" type="number" value={data.stock} onChange={set("stock")} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                <Select value={data.category} onValueChange={v => setData(d => ({ ...d, category: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Activo</p>
                <Button
                  variant="outline" size="sm" className="h-8 w-full"
                  onClick={() => setData(d => ({ ...d, active: !d.active }))}
                >
                  {data.active
                    ? <><ToggleRight className="h-4 w-4 mr-1 text-green-600" />Sí</>
                    : <><ToggleLeft className="h-4 w-4 mr-1 text-muted-foreground" />No</>
                  }
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ruta de imagen (ej: /products/abakrone.png)</p>
              <Input className="h-8 text-sm font-mono" value={data.image} onChange={set("image")} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Presentación</p>
              <Input className="h-8 text-sm" value={data.presentation} onChange={set("presentation")} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Descripción corta</p>
              <Input className="h-8 text-sm" value={data.description} onChange={set("description")} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving} className="h-8 bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={cancel} className="h-8">
                <X className="h-3.5 w-3.5 mr-1" />Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{product.name}</p>
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                {!product.active && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{product.presentation}</p>
              <p className="text-xs text-muted-foreground font-mono">{product.image}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">{fmtMXN(product.priceMxn)}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" />Editar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NewProductForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    slug: "", name: "", description: "", presentation: "", type: "Producto",
    category: "BIOINSECTICIDAS", image: "", priceMxn: 0, stock: 0,
  })
  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData(d => ({ ...d, [k]: e.target.value }))

  const create = async () => {
    if (!data.slug || !data.name) return
    setSaving(true)
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, priceMxn: parseInt(String(data.priceMxn)), stock: parseInt(String(data.stock)) }),
    })
    setSaving(false)
    onCreated()
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
          <Plus className="h-4 w-4" /> Nuevo producto
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Slug (URL único)</p>
            <Input className="h-8 text-sm" placeholder="ej: baktillis-2l" value={data.slug} onChange={set("slug")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nombre</p>
            <Input className="h-8 text-sm" value={data.name} onChange={set("name")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Presentación</p>
            <Input className="h-8 text-sm" value={data.presentation} onChange={set("presentation")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Precio (centavos)</p>
            <Input className="h-8 text-sm" type="number" value={data.priceMxn} onChange={set("priceMxn")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stock</p>
            <Input className="h-8 text-sm" type="number" value={data.stock} onChange={set("stock")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Categoría</p>
            <Select value={data.category} onValueChange={v => setData(d => ({ ...d, category: v }))}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Ruta de imagen (ej: /products/abakrone.png)</p>
          <Input className="h-8 text-sm font-mono" value={data.image} onChange={set("image")} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Descripción</p>
          <Input className="h-8 text-sm" value={data.description} onChange={set("description")} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={create} disabled={saving} className="h-8">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
            Crear producto
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="h-8">
            <X className="h-3.5 w-3.5 mr-1" />Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminProductosPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [showNew, setShowNew] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { if (user?.role === "ADMIN") fetchProducts() }, [user])

  const filtered = products.filter(p => {
    const matchCat = catFilter === "all" || p.category === catFilter
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (authLoading) return null
  if (!user || user.role !== "ADMIN") return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Acceso denegado</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Productos</h1>
              <p className="text-muted-foreground text-sm">{products.length} productos · {products.filter(p => p.active).length} activos</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/pedidos">
                <Button variant="outline" size="sm">Pedidos</Button>
              </Link>
              <Button size="sm" onClick={() => setShowNew(true)} disabled={showNew}>
                <Plus className="h-4 w-4 mr-1" />Nuevo producto
              </Button>
            </div>
          </div>

          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {showNew && (
            <div className="mb-4">
              <NewProductForm onCreated={() => { setShowNew(false); fetchProducts() }} onCancel={() => setShowNew(false)} />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay productos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => <ProductRow key={p.id} product={p} onUpdated={fetchProducts} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
