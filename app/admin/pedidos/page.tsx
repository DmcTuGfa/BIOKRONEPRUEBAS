"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import {
  Loader2, Package, ChevronDown, ChevronUp, MapPin,
  CreditCard, Truck, Save, X, ExternalLink, Clock, Search
} from "lucide-react"
import Link from "next/link"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  PAID:       { label: "Pagado",      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "Procesando",  color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  SHIPPED:    { label: "Enviado",     color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30" },
  DELIVERED:  { label: "Entregado",   color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30" },
  REFUNDED:   { label: "Reembolsado", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30" },
}

const CARRIERS = ["DHL", "FedEx", "Estafeta", "Paquetexpress", "99 Minutos", "Redpack", "Otro"]

function fmt(d: string) {
  return new Date(d).toLocaleString("es-MX", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
function fmtMXN(c: number) {
  return `$${(c / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function OrderRow({ order, onUpdated }: { order: any; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tracking, setTracking] = useState(order.trackingNumber || "")
  const [carrier, setCarrier] = useState(order.shippingCarrier || "")
  const [status, setStatus] = useState(order.status)
  const st = STATUS_LABELS[status] || { label: status, color: "" }

  const save = async () => {
    setSaving(true)
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking || null, shippingCarrier: carrier || null }),
    })
    setSaving(false)
    onUpdated()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <button onClick={() => setOpen(o => !o)} className="w-full text-left">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-mono">{order.folio}</CardTitle>
                <Badge variant="outline" className={st.color}>{st.label}</Badge>
                {order.trackingNumber && (
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    <Truck className="h-3 w-3 mr-1" />{order.trackingNumber}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.user?.name} · {order.user?.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />{fmt(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
              {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-5 border-t border-border mt-1 pt-4">
          {/* Productos */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos</p>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{fmtMXN(item.priceMxn * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Envío */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Dirección
              </p>
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-0.5">
                <p className="font-medium text-foreground">{order.shippingName}</p>
                <p className="text-muted-foreground">{order.shippingStreet}</p>
                <p className="text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingPostal}</p>
                <p className="text-muted-foreground">{order.shippingCountry}</p>
                {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Pago
              </p>
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
                </div>
                {order.stripePaymentId && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">ID Stripe</span>
                    <span className="text-foreground font-mono text-xs truncate">{order.stripePaymentId}</span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagado</span>
                    <span className="text-foreground text-xs">{fmt(order.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editar estado + guía */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
              <Truck className="h-3 w-3" /> Actualizar estado y envío
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Paquetería</p>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Número de guía</p>
                <Input
                  className="h-9 text-sm"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="ej. 1234567890"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={save} disabled={saving} className="h-8">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                Guardar cambios
              </Button>
              {order.notes && (
                <p className="text-xs text-muted-foreground flex items-center">Notas: {order.notes}</p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function AdminPedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

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

  const filtered = search
    ? orders.filter(o =>
        o.folio.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.trackingNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
              <p className="text-muted-foreground text-sm">{total} pedidos en total</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/productos">
                <Button variant="outline" size="sm">Productos</Button>
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Buscar folio, cliente o guía..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1) }}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => (
                <OrderRow key={order.id} order={order} onUpdated={fetchOrders} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <span className="text-sm text-muted-foreground flex items-center px-3">{page} / {pages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Siguiente</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
