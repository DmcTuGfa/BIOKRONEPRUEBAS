"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Package } from "lucide-react"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  PAID:       { label: "Pagado",      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "Procesando",  color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  SHIPPED:    { label: "Enviado",     color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30" },
  DELIVERED:  { label: "Entregado",   color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30" },
  REFUNDED:   { label: "Reembolsado", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30" },
}

export default function AdminPedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (filterStatus !== "all") params.set("status", filterStatus)
    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }

  useEffect(() => { if (user?.role === "ADMIN") fetchOrders() }, [user, filterStatus, page])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await fetchOrders()
    setUpdating(null)
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
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
              <p className="text-muted-foreground">{total} pedidos en total</p>
            </div>
            <div className="flex gap-3 items-center">
              <Link href="/admin/productos" className="text-sm text-primary hover:underline">→ Productos</Link>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1) }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const st = STATUS_LABELS[order.status] || { label: order.status, color: "" }
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="text-base font-mono">{order.folio}</CardTitle>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("es-MX")}</p>
                          <p className="text-sm text-foreground mt-1">{order.user?.name} — {order.user?.email}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-foreground">${(order.totalMxn / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                          <Badge variant="outline" className={st.color}>{st.label}</Badge>
                          <Select
                            value={order.status}
                            onValueChange={v => updateStatus(order.id, v)}
                            disabled={updating === order.id}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              {updating === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 mb-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                            <span className="text-muted-foreground">${(item.priceMxn * item.quantity / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Envío: {order.shippingStreet}, {order.shippingCity}, {order.shippingState} {order.shippingPostal}
                      </p>
                      {order.notes && <p className="text-xs text-muted-foreground mt-1">Notas: {order.notes}</p>}
                    </CardContent>
                  </Card>
                )
              })}

              {pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                  <span className="text-sm text-muted-foreground flex items-center px-3">{page} / {pages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Siguiente</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
