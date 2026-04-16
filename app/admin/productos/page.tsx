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
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Package, Pencil, Check, X } from "lucide-react"

export default function AdminProductosPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { if (user?.role === "ADMIN") fetchProducts() }, [user])

  const startEdit = (product: any) => {
    setEditing(product.id)
    setEditData({ priceMxn: product.priceMxn, stock: product.stock, active: product.active })
  }

  const saveEdit = async (id: string) => {
    setSaving(true)
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceMxn: parseInt(editData.priceMxn),
        stock: parseInt(editData.stock),
        active: editData.active,
      }),
    })
    setEditing(null)
    await fetchProducts()
    setSaving(false)
  }

  if (authLoading) return null
  if (!user || user.role !== "ADMIN") return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Acceso denegado</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Productos</h1>
              <p className="text-muted-foreground">{products.length} productos</p>
            </div>
            <Link href="/admin/pedidos" className="text-sm text-primary hover:underline">→ Pedidos</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <Card key={product.id} className={!product.active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          {!product.active && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{product.presentation}</p>
                      </div>

                      {editing === product.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Precio (centavos)</p>
                            <Input className="w-32 h-8 text-sm" type="number" value={editData.priceMxn}
                              onChange={e => setEditData((d: any) => ({ ...d, priceMxn: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Stock</p>
                            <Input className="w-24 h-8 text-sm" type="number" value={editData.stock}
                              onChange={e => setEditData((d: any) => ({ ...d, stock: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Activo</p>
                            <Button variant="outline" size="sm" className="h-8"
                              onClick={() => setEditData((d: any) => ({ ...d, active: !d.active }))}>
                              {editData.active ? "Sí" : "No"}
                            </Button>
                          </div>
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => saveEdit(product.id)} disabled={saving}>
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-foreground">{product.priceMxn > 0 ? `$${(product.priceMxn / 100).toFixed(2)}` : "Consultar"}</p>
                            <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => startEdit(product)}>
                            <Pencil className="h-3 w-3 mr-1" />Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
