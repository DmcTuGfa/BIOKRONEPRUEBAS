"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  Trash2,
  User,
  Package,
} from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart()
  const { user, loading: authLoading } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("México")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "")
      setEmail(user.email || "")
      setPhone((prev) => prev || user.phone || "")
    }
  }, [user])

  const totalDisplay = (totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent("/tienda/checkout")}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            productSlug: item.slug,
            quantity: item.quantity,
          })),
          address: {
            name,
            street,
            city,
            state,
            postalCode,
            country,
          },
          phone,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago")
      if (!data.url) throw new Error("Stripe no devolvió la URL de pago")

      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Tu carrito está vacío</h2>
            <Button asChild>
              <Link href="/tienda">Ir a la tienda</Link>
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
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tienda">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Finalizar compra</h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {authLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando sesión...
                    </div>
                  ) : user ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        El pedido quedará ligado a tu cuenta para verlo después en <strong>Mis pedidos</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                      <p className="font-medium text-foreground">Necesitas iniciar sesión para continuar.</p>
                      <p className="text-sm text-muted-foreground">
                        Así tu compra queda guardada en la base de datos y luego podrás verla en tu cuenta.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild>
                          <Link href="/auth/login?redirect=/tienda/checkout">Iniciar sesión</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/auth/register?redirect=/tienda/checkout">Crear cuenta</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Datos de envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del receptor" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="442..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código postal *</Label>
                      <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="38000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Calle y número *</Label>
                    <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Calle, número, colonia" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Celaya" />
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="state">Estado *</Label>
                      <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Guanajuato" />
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="country">País *</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="México" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas del pedido</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Referencias, horario, indicaciones..." />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-base"
                    onClick={handleCheckout}
                    disabled={loading || authLoading || !user || !name || !street || !city || !state || !postalCode || !country}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Redirigiendo a Stripe...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Continuar al pago
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Tu pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.presentation}</p>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Minus className="h-3 w-3 text-foreground" />
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold text-foreground min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-3 w-3 text-foreground" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <span className="text-sm font-semibold whitespace-nowrap text-foreground">
                        ${((item.price * item.quantity) / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${totalDisplay} MXN</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-green-600 dark:text-green-400">Se cotiza por zona</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${totalDisplay} MXN</span>
                  </div>

                  <div className="pt-2 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      Pago procesado por Stripe Checkout
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      Tu pedido quedará guardado en tu cuenta
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      Envío confirmado por correo
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
