"use client"

import { useState } from "react"
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
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, CreditCard, ShieldCheck, Truck, AlertCircle, Loader2, Minus, Plus, Trash2, Lock } from "lucide-react"

interface Address { name: string; street: string; city: string; state: string; postalCode: string; country: string }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart()
  const { user } = useAuth()

  const [address, setAddress] = useState<Address>({ name: user?.name || "", street: "", city: "", state: "", postalCode: "", country: "México" })
  const [phone, setPhone] = useState(user?.phone || "")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalDisplay = (totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })

  const setAddr = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [k]: e.target.value }))

  const handleCheckout = async () => {
    if (!user) { router.push("/auth/login?redirect=/tienda/checkout"); return }
    if (!address.name || !address.street || !address.city || !address.state || !address.postalCode) {
      setError("Completa todos los campos de envío"); return
    }
    setLoading(true); setError(null)

    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        address,
        phone,
        notes,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    window.location.href = data.url // Redirect to Stripe Checkout
  }

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Tu carrito está vacío</h2>
          <Button asChild><Link href="/tienda">Ir a la tienda</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tienda"><ArrowLeft className="h-4 w-4 mr-1" />Volver</Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Finalizar compra</h1>
            <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />Pago seguro con Stripe
            </div>
          </div>

          {!user && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Necesitas <Link href="/auth/login?redirect=/tienda/checkout" className="underline font-medium">iniciar sesión</Link> para completar tu compra.
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Dirección de envío</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre completo *</Label>
                      <Input value={address.name} onChange={setAddr("name")} placeholder="Nombre del receptor" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 000 000 0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Calle y número *</Label>
                    <Input value={address.street} onChange={setAddr("street")} placeholder="Calle, número interior/exterior" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ciudad *</Label>
                      <Input value={address.city} onChange={setAddr("city")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado *</Label>
                      <Input value={address.state} onChange={setAddr("state")} placeholder="Ej: Guanajuato" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Código postal *</Label>
                      <Input value={address.postalCode} onChange={setAddr("postalCode")} />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input value={address.country} onChange={setAddr("country")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas del pedido (opcional)</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales de entrega..." />
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}

              <Button className="w-full h-12 text-base" onClick={handleCheckout} disabled={loading || !user}>
                {loading
                  ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Redirigiendo a Stripe...</>
                  : <><CreditCard className="h-5 w-5 mr-2" />Continuar al pago seguro</>}
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader><CardTitle className="text-lg">Tu pedido</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.presentation}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-muted transition-colors">
                              <Minus className="h-3 w-3 text-foreground" />
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold text-foreground min-w-[2rem] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-muted transition-colors">
                              <Plus className="h-3 w-3 text-foreground" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${totalDisplay} MXN</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Envío</span><span className="text-green-600 dark:text-green-400">Se cotiza por zona</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${totalDisplay} MXN</span></div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />El total final se confirma en Stripe.
                  </p>
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
