"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Lock, ShieldCheck } from "lucide-react"

export function StripePaymentForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const stripeRef = useRef<any>(null)
  const cardRef = useRef<any>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const init = async () => {
      try {
        const { loadStripe } = await import("@stripe/stripe-js")
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

        if (!stripe) {
          setError("No se pudo cargar Stripe. Verifica tu conexión.")
          return
        }

        stripeRef.current = stripe
        const elements = stripe.elements({ clientSecret })

        const card = elements.create("card", {
          style: {
            base: {
              fontSize: "16px",
              color: "#ffffff",
              fontFamily: "inherit",
              "::placeholder": { color: "#6b7280" },
            },
            invalid: { color: "#ef4444" },
          },
          hidePostalCode: true,
        })

        cardRef.current = card
        card.mount("#card-element")
        card.on("ready", () => setCardReady(true))
        card.on("change", (e: any) => setError(e.error?.message ?? null))
      } catch {
        setError("Error al inicializar el formulario de pago.")
      }
    }

    init()

    return () => {
      if (cardRef.current) {
        try {
          cardRef.current.unmount()
        } catch {}
      }
    }
  }, [clientSecret])

  const handlePay = async () => {
    if (!stripeRef.current || !cardRef.current) return

    setLoading(true)
    setError(null)

    try {
      const { error: stripeError, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardRef.current },
      })

      if (stripeError) {
        setError(stripeError.message ?? "Error al procesar el pago.")
        setLoading(false)
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess()
      }
    } catch {
      setError("Error inesperado. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border bg-muted/30 min-h-[60px]">
        <Label className="text-sm font-medium mb-3 block text-foreground">Número de tarjeta</Label>
        <div id="card-element" className="py-1" />
        {!cardReady && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando formulario seguro...
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button className="w-full h-12 text-base" onClick={handlePay} disabled={loading || !cardReady}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Pagar ahora
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        Pago cifrado y procesado por Stripe. No almacenamos tus datos.
      </p>
    </div>
  )
}
