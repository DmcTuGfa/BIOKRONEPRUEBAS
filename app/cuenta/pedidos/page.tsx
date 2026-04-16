"use client"

export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Package, AlertCircle, Loader2 } from "lucide-react"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  PAID:       { label: "Pagado",      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "Procesando",  color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  SHIPPED:    { label: "Enviado",     color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30" },
  DELIVERED:  { label: "Entregado",   color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30" },
  REFUNDED:   { label: "Reembolsado", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30" },
}

export default function PedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch("/api/orders").then(r => r.json()).then(data => { setOrders(data); setLoading(false) })
  }, [user])

  if (authLoading) return null

  if (!user) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Inicia sesión para ver tus pedidos</h2>
          <Button asChild><Link href="/auth/login?redirect=/cuenta/pedidos">Iniciar sesión</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground mb-8">Mis pedidos</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aún no tienes pedidos</h3>
              <Button asChild><Link href="/tienda">Ir a la tienda</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const st = STATUS_LABELS[order.status] || { label: order.status, color: "" }
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-base font-mono">{order.folio}</CardTitle>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">${(order.totalMxn / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                          <Badge variant="outline" className={st.color}>{st.label}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                            <span className="text-muted-foreground">${(item.priceMxn * item.quantity / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
                        Envío a: {order.shippingCity}, {order.shippingState}, {order.shippingCountry}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
