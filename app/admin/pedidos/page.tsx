"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import {
  Loader2, Package, MapPin, CreditCard, Truck, Save,
  Clock, Search, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, RefreshCw, ChevronRight
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30", icon: Clock },
  PAID:       { label: "Pagado",      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",         icon: CheckCircle2 },
  PROCESSING: { label: "Procesando",  color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30", icon: RefreshCw },
  SHIPPED:    { label: "Enviado",     color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30", icon: Truck },
  DELIVERED:  { label: "Entregado",   color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",     icon: CheckCircle2 },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",             icon: XCircle },
  REFUNDED:   { label: "Reembolsado", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30",         icon: AlertCircle },
}

const SHIPPING_STATUS_LABELS: Record<string, string> = {
  PENDIENTE:   "Pendiente",
  PREPARANDO:  "Preparando",
  ENVIADO:     "Enviado",
  EN_TRANSITO: "En tránsito",
  ENTREGADO:   "Entregado",
}

const CARRIERS = ["DHL", "FedEx", "Estafeta", "Paquetexpress", "99 Minutos", "Redpack", "Otro"]

const CARRIER_URLS: Record<string, string> = {
  DHL:          "https://www.dhl.com/mx-es/home/tracking.html?tracking-id=",
  FedEx:        "https://www.fedex.com/apps/fedextrack/?tracknumbers=",
  Estafeta:     "https://www.estafeta.com/herramientas/rastreo?wayBillType=0&waybill=",
  Paquetexpress:"https://www.paquetexpress.com.mx/rastreo?guia=",
  Redpack:      "https://www.redpack.com.mx/es/rastreo/?guia=",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  return new Date(d).toLocaleString("es-MX", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
function fmtMXN(c: number) {
  return `$${(c / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}
function autoTrackingUrl(carrier: string, number: string) {
  const base = CARRIER_URLS[carrier]
  return base ? base + encodeURIComponent(number) : "#"
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({
  order, open, onClose, onUpdated,
}: {
  order: any
  open: boolean
  onClose: () => void
  onUpdated: (updated: any) => void
}) {
  const [saving, setSaving]           = useState(false)
  const [tracking, setTracking]       = useState(order.trackingNumber || "")
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "")
  const [carrier, setCarrier]         = useState(order.shippingCarrier || "")
  const [status, setStatus]           = useState(order.status)
  const [shippingStatus, setShippingStatus] = useState(order.shippingStatus || "PENDIENTE")
  const [trackInfo, setTrackInfo]     = useState<any>(null)
  const [trackLoading, setTrackLoading] = useState(false)
  const [saveMsg, setSaveMsg]         = useState("")

  useEffect(() => {
    setTracking(order.trackingNumber || "")
    setTrackingUrl(order.trackingUrl || "")
    setCarrier(order.shippingCarrier || "")
    setStatus(order.status)
    setShippingStatus(order.shippingStatus || "PENDIENTE")
    setTrackInfo(null)
    setSaveMsg("")
  }, [order.id])

  // Auto-generar URL de tracking cuando cambia carrier + número
  useEffect(() => {
    if (carrier && tracking && !trackingUrl) {
      const auto = autoTrackingUrl(carrier, tracking)
      if (auto !== "#") setTrackingUrl(auto)
    }
  }, [carrier, tracking])

  const save = async () => {
    setSaving(true)
    setSaveMsg("")
    try {
      const payload: any = {
        status,
        trackingNumber:  tracking.trim() || null,
        shippingCarrier: carrier || null,
        shippingStatus,
        trackingUrl:     trackingUrl.trim() || null,
      }
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const updated = await res.json()
      setSaving(false)
      if (res.ok) {
        setStatus(updated.status)
        setShippingStatus(updated.shippingStatus || "PENDIENTE")
        onUpdated(updated)
        setSaveMsg("✅ Cambios guardados correctamente")
        setTimeout(() => setSaveMsg(""), 4000)
      } else {
        setSaveMsg(`❌ ${updated.error || "Error al guardar"}`)
      }
    } catch {
      setSaving(false)
      setSaveMsg("❌ Error de red al guardar")
    }
  }

  const fetchTracking = async () => {
    if (!carrier || !tracking) return
    setTrackLoading(true)
    try {
      const res = await fetch(
        `/api/admin/tracking?carrier=${encodeURIComponent(carrier)}&number=${encodeURIComponent(tracking)}`
      )
      const data = await res.json()
      setTrackInfo(data)
    } catch {
      setTrackInfo({ status: "MANUAL", statusLabel: "Error al consultar", events: [], carrier, trackingUrl: "#" })
    }
    setTrackLoading(false)
  }

  const st = STATUS_LABELS[status] || { label: status, color: "", icon: Clock }
  const StatusIcon = st.icon
  const isPaid = ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(status)

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-primary">{order.folio}</span>
            <Badge variant="outline" className={st.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {st.label}
            </Badge>
            {isPaid ? (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />Pago verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />Pago pendiente
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* Cliente + fecha */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex-1 min-w-[180px]">
              <p className="text-xs text-muted-foreground mb-1">Cliente</p>
              <p className="font-medium text-foreground">{order.user?.name}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
              {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fecha del pedido</p>
              <p className="text-foreground">{fmt(order.createdAt)}</p>
            </div>
          </div>

          {/* Productos */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Productos</p>
            <div className="space-y-2 rounded-lg border border-border overflow-hidden">
              {(order.items || []).map((item: any, i: number) => (
                <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 ${i < (order.items?.length ?? 0) - 1 ? "border-b border-border" : ""}`}>
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="40px"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity} · {fmtMXN(item.priceMxn)} c/u</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">{fmtMXN(item.priceMxn * item.quantity)}</p>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2.5 bg-muted/40 border-t border-border">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
              </div>
            </div>
          </div>

          {/* Estado del pago */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" /> Estado del pago
            </p>
            <div className="rounded-lg border border-border p-3 text-sm space-y-1">
              {isPaid ? (
                <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Aprobado por Stripe
                </p>
              ) : (
                <p className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Pendiente de confirmación
                </p>
              )}
              {order.stripePaymentId && (
                <p className="text-xs font-mono text-muted-foreground">{order.stripePaymentId}</p>
              )}
              {order.paidAt && (
                <p className="text-xs text-muted-foreground">Confirmado el {fmt(order.paidAt)}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Dirección de entrega
            </p>
            <div className="bg-muted/40 rounded-lg border border-border p-3 text-sm">
              <p className="font-medium text-foreground">{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingStreet}</p>
              <p className="text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingPostal}</p>
              <p className="text-muted-foreground">{order.shippingCountry}</p>
            </div>
          </div>

          {/* Gestión de envío */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Gestión de envío
            </p>
            <div className="space-y-3">

              <div className="grid grid-cols-2 gap-3">
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
                  <Input className="h-9 text-sm font-mono" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="ej. 1234567890" />
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">URL de rastreo (se genera automático)</p>
                <Input className="h-9 text-sm font-mono" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estado del pedido</p>
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
                  <p className="text-xs text-muted-foreground mb-1">Estado de envío</p>
                  <Select value={shippingStatus} onValueChange={setShippingStatus}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SHIPPING_STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button onClick={save} disabled={saving} size="sm" className="h-9">
                  {saving
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Guardando...</>
                    : <><Save className="h-3.5 w-3.5 mr-1.5" />Guardar cambios</>
                  }
                </Button>

                {tracking && carrier && (
                  <a href={trackingUrl || autoTrackingUrl(carrier, tracking)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />Rastrear en {carrier}
                  </a>
                )}

                {tracking && carrier && ["DHL","Estafeta"].includes(carrier) && (
                  <Button variant="outline" size="sm" className="h-9" onClick={fetchTracking} disabled={trackLoading}>
                    {trackLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                    Ver rastreo aquí
                  </Button>
                )}
              </div>

              {saveMsg && (
                <p className={`text-sm font-medium ${saveMsg.startsWith("✅") ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {saveMsg}
                </p>
              )}

              {trackInfo && (
                <div className="rounded-lg border border-border overflow-hidden mt-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      {trackInfo.carrier} · {trackInfo.statusLabel}
                    </p>
                    {trackInfo.estimatedDelivery && (
                      <p className="text-xs text-muted-foreground">
                        Entrega estimada: {new Date(trackInfo.estimatedDelivery).toLocaleDateString("es-MX")}
                      </p>
                    )}
                  </div>
                  {trackInfo.events?.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-3">
                      {trackInfo.status === "MANUAL"
                        ? `Consulta directo en el sitio de ${trackInfo.carrier}.`
                        : "Sin eventos registrados aún."}
                    </p>
                  ) : (
                    <div className="divide-y divide-border max-h-48 overflow-y-auto">
                      {(trackInfo.events || []).map((ev: any, i: number) => (
                        <div key={i} className="px-3 py-2 flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs text-foreground">{ev.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {ev.location && `${ev.location} · `}
                              {ev.date && new Date(ev.date).toLocaleString("es-MX")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notas del cliente</p>
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg border border-border px-3 py-2">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order, onClick }: { order: any; onClick: () => void }) {
  const st = STATUS_LABELS[order.status] || { label: order.status, color: "", icon: Clock }
  const StatusIcon = st.icon
  const isPaid = ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(order.status)

  return (
    <Card className="cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-mono font-semibold text-primary">{order.folio}</span>
              <Badge variant="outline" className={`text-xs ${st.color}`}>
                <StatusIcon className="h-3 w-3 mr-0.5" />{st.label}
              </Badge>
              {isPaid && (
                <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" /> Pago verificado
                </span>
              )}
              {order.trackingNumber && (
                <Badge variant="outline" className="text-xs border-orange-400/40 text-orange-600 dark:text-orange-400">
                  <Truck className="h-2.5 w-2.5 mr-0.5" />
                  {order.shippingCarrier} {order.trackingNumber}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{order.user?.name} · {order.user?.email}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" /> {fmt(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders]   = useState<any[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch]   = useState("")
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [selected, setSelected] = useState<any>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (filterStatus !== "all") params.set("status", filterStatus)
      const res  = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cargar")
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus])

  useEffect(() => {
    if (user?.role === "ADMIN") fetchOrders()
  }, [user, fetchOrders])

  const handleOrderUpdated = (updated: any) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o))
    setSelected((prev: any) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
  }

  const filtered = search
    ? orders.filter(o =>
        o.folio.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.trackingNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Acceso denegado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
              <p className="text-muted-foreground text-sm">{total} pedidos · haz clic para ver detalle y gestionar</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Link href="/admin/productos">
                <Button variant="outline" size="sm">Productos</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>

          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Buscar folio, cliente, guía..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1) }}>
              <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
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
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchOrders}>Reintentar</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(order => (
                <OrderRow key={order.id} order={order} onClick={() => setSelected(order)} />
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

      {selected && (
        <OrderModal
          order={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onUpdated={handleOrderUpdated}
        />
      )}
    </div>
  )
}
