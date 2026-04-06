import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  presentation: string
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail }: { items: CartItem[]; customerEmail: string } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos en el carrito" }, { status: 400 })
    }

    const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
      receipt_email: customerEmail || undefined,
      metadata: {
        productos: items.map(i => `${i.name} x${i.quantity}`).join(", "),
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
