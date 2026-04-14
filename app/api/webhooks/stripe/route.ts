import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { sendEmail, orderConfirmationTemplate } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[webhook] Signature failed:", err)
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== "paid") break

        const order = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
          include: { items: true, user: true },
        })

        if (!order) {
          console.error("[webhook] Order not found for session:", session.id)
          break
        }

        if (order.status === "PAID") break // idempotent

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status:         "PAID",
            stripePaymentId: session.payment_intent as string,
            paidAt:         new Date(),
          },
        })

        // Send confirmation email
        await sendEmail({
          to:      order.customerEmail,
          subject: `Pedido confirmado ${order.folio} — BIOKRONE`,
          html:    orderConfirmationTemplate(order.folio, order.items, order.totalMxn),
        })

        console.log(`✅ Order ${order.folio} PAID`)
        break
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        // Restore stock and mark cancelled
        let sessionId: string | null = null

        if (event.type === "checkout.session.expired") {
          sessionId = (event.data.object as Stripe.Checkout.Session).id
        }

        if (sessionId) {
          const order = await prisma.order.findUnique({
            where: { stripeSessionId: sessionId },
            include: { items: true },
          })

          if (order && order.status === "PENDING") {
            await prisma.$transaction(async (tx) => {
              await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } })
              // Restore stock
              for (const item of order.items) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                })
              }
            })
            console.log(`❌ Order ${order.folio} CANCELLED — stock restored`)
          }
        }
        break
      }
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err)
    // Return 200 so Stripe doesn't retry on business logic errors
  }

  return NextResponse.json({ received: true })
}
