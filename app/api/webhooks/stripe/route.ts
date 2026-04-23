import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  // Este es el evento correcto para Checkout Sessions (no payment_intent)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== "paid") {
      // Pago pendiente (ej. OXXO) — no marcar como pagado aún
      return NextResponse.json({ received: true })
    }

    const folio   = session.metadata?.folio
    const paymentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

    if (!folio) {
      console.error("[stripe-webhook] No folio in metadata", session.id)
      return NextResponse.json({ received: true })
    }

    // Verificar que el pago SÍ fue aprobado por Stripe antes de actualizar
    if (paymentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentId)
      if (pi.status !== "succeeded") {
        console.warn("[stripe-webhook] PaymentIntent not succeeded:", pi.status)
        return NextResponse.json({ received: true })
      }
    }

    await prisma.order.update({
      where:  { folio },
      data: {
        status:         "PAID",
        stripePaymentId: paymentId,
        paidAt:          new Date(),
      },
    })

    console.log(`✅ Pedido ${folio} marcado como PAGADO — PI: ${paymentId}`)
  }

  // ── checkout.session.async_payment_succeeded (OXXO, etc.) ─────────────────
  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session
    const folio   = session.metadata?.folio
    const paymentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

    if (folio) {
      await prisma.order.update({
        where: { folio },
        data: {
          status:          "PAID",
          stripePaymentId: paymentId,
          paidAt:          new Date(),
        },
      })
      console.log(`✅ Pago async exitoso — Pedido ${folio}`)
    }
  }

  // ── checkout.session.async_payment_failed ─────────────────────────────────
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session
    const folio   = session.metadata?.folio
    if (folio) {
      await prisma.order.update({
        where: { folio },
        data:  { status: "CANCELLED" },
      })
      console.log(`❌ Pago async fallido — Pedido ${folio} cancelado`)
    }
  }

  return NextResponse.json({ received: true })
}
