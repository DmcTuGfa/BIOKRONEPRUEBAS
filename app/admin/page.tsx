"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import {
  Loader2, Package, ShoppingBag, Truck, CheckCircle2,
  Clock, AlertCircle, BarChart3, ArrowRight, RefreshCw
} from "lucide-react"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  PAID:       { label: "Pagado",      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "Procesando",  color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  SHIPPED:    { label: "Enviado",     color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30" },
  DELIVERED:  { label: "Entregado",   color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30" },
  REFUNDED:   { label: "Reembolsado", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30" },
}

function fmtMXN(c: number) {
  return `$${(c / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}
function fmt(d: string) {
  return new Date(d).toLocaleString("es-MX", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  })
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders]     = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = async () => {
    setLoading(true)
    const [ordRes, prodRes] = await Promise.all([
      fetch("/api/admin/orders?page=1"),
      fetch("/api/admin/products"),
    ])
    const ordData  = await ordRes.json()
    const prodData = await prodRes.json()
    setOrders(ordData.orders || [])
    setProducts(Array.isArray(prodData) ? prodData : [])
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => { if (user?.role === "ADMIN") fetchData() }, [user])

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
  if (!user || user.role !== "ADMIN") return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Acceso denegado</p>
    </div>
  )

  // Stats
  const totalRevenue  = orders.filter(o => ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(o.status)).reduce((s, o) => s + o.totalMxn, 0)
  const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PAID").length
  const shippedOrders = orders.filter(o => o.status === "SHIPPED").length
  const activeProducts = products.filter(p => p.active).length
  const lowStock      = products.filter(p => p.active && p.stock <= 10).length
  const recentOrders  = [...orders].slice(0, 8)

  const statsByStatus = Object.entries(STATUS_LABELS).map(([key, val]) => ({
    key, ...val,
    count: orders.filter(o => o.status === key).length,
  })).filter(s => s.count > 0)

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Panel de administración
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Actualizado: {lastRefresh.toLocaleTimeString("es-MX")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Link href="/admin/pedidos">
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-1" />Pedidos
                </Button>
              </Link>
              <Link href="/admin/productos">
                <Button variant="outline" size="sm">
                  <ShoppingBag className="h-4 w-4 mr-1" />Productos
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ingresos (última página)</p>
                    <p className="text-2xl font-bold text-foreground">{fmtMXN(totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pedidos pagados / enviados / entregados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pendientes de atender</p>
                    <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pendientes + Pagados sin procesar</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">En tránsito</p>
                    <p className="text-2xl font-bold text-foreground">{shippedOrders}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pedidos enviados</p>
                  </CardContent>
                </Card>
                <Card className={lowStock > 0 ? "border-orange-500/40" : ""}>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Productos</p>
                    <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
                    <p className={`text-xs mt-1 ${lowStock > 0 ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}`}>
                      {lowStock > 0 ? `⚠ ${lowStock} con stock ≤ 10` : "Stock saludable"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status breakdown + recent orders */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Status breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      Pedidos por estado
                      <Link href="/admin/pedidos" className="text-xs text-primary hover:underline font-normal flex items-center gap-0.5">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {statsByStatus.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin pedidos aún</p>
                    ) : (
                      statsByStatus.map(s => (
                        <div key={s.key} className="flex items-center justify-between">
                          <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>
                          <span className="font-semibold text-foreground text-sm">{s.count}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent orders */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      Pedidos recientes
                      <Link href="/admin/pedidos" className="text-xs text-primary hover:underline font-normal flex items-center gap-0.5">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sin pedidos aún</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map(order => {
                          const st = STATUS_LABELS[order.status] || { label: order.status, color: "" }
                          return (
                            <div key={order.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-mono text-foreground">{order.folio}</span>
                                  <Badge variant="outline" className={`text-xs ${st.color}`}>{st.label}</Badge>
                                  {order.trackingNumber && (
                                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                      <Truck className="h-2.5 w-2.5 mr-0.5" />{order.trackingNumber}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {order.user?.name} · {fmt(order.createdAt)}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-foreground shrink-0">{fmtMXN(order.totalMxn)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Low stock alert */}
              {lowStock > 0 && (
                <Card className="border-orange-500/40 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-orange-700 dark:text-orange-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Productos con stock bajo (≤ 10 unidades)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {products.filter(p => p.active && p.stock <= 10).map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-orange-500/20">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.presentation}</p>
                          </div>
                          <Badge variant="outline" className="ml-2 border-orange-500/40 text-orange-600 dark:text-orange-400 shrink-0">
                            {p.stock} uds
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Link href="/admin/productos" className="mt-3 inline-flex">
                      <Button size="sm" variant="outline" className="mt-3 border-orange-500/40 text-orange-700 dark:text-orange-400 hover:bg-orange-500/10">
                        Actualizar inventario <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Quick links */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/admin/pedidos">
                  <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Gestión de pedidos</p>
                        <p className="text-sm text-muted-foreground">Cambiar estado, asignar guía de envío</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/admin/productos">
                  <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Gestión de productos</p>
                        <p className="text-sm text-muted-foreground">Editar precio, stock, imagen, agregar</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}
