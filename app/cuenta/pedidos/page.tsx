"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import {
  Package, AlertCircle, Loader2, ChevronDown, ChevronUp,
  MapPin, CreditCard, Clock, Truck, ExternalLink, RefreshCw
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

const CARRIER_URLS: Record<string, string> = {
  DHL:           "https://www.dhl.com/mx-es/home/tracking.html",
  FedEx:         "https://www.fedex.com/es-mx/tracking.html",
  Estafeta:      "https://www.estafeta.com/herramientas/rastreo",
  Paquetexpress: "https://www.paquetexpress.com.mx/rastreo",
  "99 Minutos":  "https://www.99minutos.com/rastreo",
  Redpack:       "https://www.redpack.com.mx/es/rastreo/",
}

function fmt(date: string) {
  return new Date(date).toLocaleString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
function fmtMXN(cents: number) {
  return `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
}

function OrderCard({ order }: { order: any }) {
  const [open, setOpen] = useState(false)
  const st = STATUS_LABELS[order.status] || { label: order.status, color: "" }
  const trackingUrl = order.trackingUrl || (order.shippingCarrier ? CARRIER_URLS[order.shippingCarrier] : null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <button onClick={() => setOpen(o => !o)} className="w-full text-left">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-mono">{order.folio}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmt(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
              <Badge variant="outline" className={st.color}>{st.label}</Badge>
              {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-5">
          {/* Productos */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos</p>
            <div className="space-y-2">
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="40px"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity} · {fmtMXN(item.priceMxn)} c/u</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{fmtMXN(item.priceMxn * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-sm font-bold text-foreground">{fmtMXN(order.totalMxn)}</span>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Dirección de entrega
            </p>
            <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground space-y-0.5">
              <p className="font-medium">{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingStreet}</p>
              <p className="text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingPostal}</p>
              <p className="text-muted-foreground">{order.shippingCountry}</p>
            </div>
          </div>

          {/* Pago */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Pago
            </p>
            <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método</span>
                <span className="text-foreground font-medium">Stripe</span>
              </div>
              {order.stripePaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de pago</span>
                  <span className="text-foreground font-mono text-xs truncate max-w-[180px]">{order.stripePaymentId}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagado el</span>
                  <span className="text-foreground">{fmt(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guía de envío */}
          {(order.trackingNumber || order.shippingCarrier) && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Truck className="h-3 w-3" /> Guía de envío
              </p>
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-2">
                {order.shippingCarrier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paquetería</span>
                    <span className="text-foreground font-medium">{order.shippingCarrier}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Número de guía</span>
                    <span className="text-foreground font-mono font-semibold">{order.trackingNumber}</span>
                  </div>
                )}
                {/* Estado de envío manual */}
                {order.shippingStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado de envío</span>
                    <span className="text-foreground font-medium capitalize">
                      {order.shippingStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
                {trackingUrl && order.trackingNumber && (
                  <a
                    href={order.trackingUrl || trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline text-xs mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Rastrear en {order.shippingCarrier}
                  </a>
                )}
              </div>
            </div>
          )}

          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function PedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/orders", { cache: "no-store" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Error ${res.status}`)
      }
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadOrders()
  }, [user])

  // Mientras carga la autenticación, mostrar spinner mínimo
  if (authLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Inicia sesión para ver tus pedidos</h2>
            <Button asChild>
              <Link href="/auth/login?redirect=/cuenta/pedidos">Iniciar sesión</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground">Mis pedidos</h1>
            <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
          <p className="text-muted-foreground mb-8">
            Hola, {user.name}. Aquí puedes ver el historial y detalle de tus compras.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se pudieron cargar los pedidos</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button onClick={loadOrders}>Reintentar</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aún no tienes pedidos</h3>
              <Button asChild><Link href="/tienda">Ir a la tienda</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
