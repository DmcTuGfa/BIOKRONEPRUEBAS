import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent
      // Aquí: guardar pedido en BD, enviar email de confirmación, etc.
      console.log("✅ Pago completado:", pi.id, "— MXN", (pi.amount / 100).toFixed(2))
      break
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log("❌ Pago fallido:", pi.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
