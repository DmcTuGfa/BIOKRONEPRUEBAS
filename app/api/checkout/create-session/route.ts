import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateFolio } from "@/lib/folio"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })

const cartItemSchema = z.object({
  productId: z.string(),
  quantity:  z.number().int().positive(),
})

const addressSchema = z.object({
  name:       z.string().min(2),
  street:     z.string().min(3),
  city:       z.string().min(2),
  state:      z.string().min(2),
  postalCode: z.string().min(4),
  country:    z.string().default("México"),
})

const schema = z.object({
  items:   z.array(cartItemSchema).min(1),
  address: addressSchema,
  phone:   z.string().optional(),
  notes:   z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const body = schema.parse(await req.json())

    // ── 1. Fetch products from DB (never trust frontend prices)
    const productIds = body.items.map(i => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Uno o más productos no están disponibles" }, { status: 400 })
    }

    // ── 2. Check stock
    for (const item of body.items) {
      const product = products.find(p => p.id === item.productId)!
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }
      if (product.priceMxn === 0) {
        return NextResponse.json({ error: `${product.name} no tiene precio configurado. Contacta a ventas.` }, { status: 400 })
      }
    }

    // ── 3. Calculate total in backend (never trust frontend total)
    const totalMxn = body.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.priceMxn * item.quantity
    }, 0)

    // ── 4. Generate folio
    const folio = await generateFolio()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // ── 5. Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "mxn",
      customer_email: session.email,
      line_items: body.items.map(item => {
        const product = products.find(p => p.id === item.productId)!
        return {
          price_data: {
            currency: "mxn",
            unit_amount: product.priceMxn,
            product_data: {
              name: product.name,
              description: product.presentation,
              images: product.image.startsWith("http") ? [product.image] : undefined,
            },
          },
          quantity: item.quantity,
        }
      }),
      metadata: {
        folio,
        userId: session.userId,
      },
      success_url: `${appUrl}/tienda/success?folio=${folio}`,
      cancel_url:  `${appUrl}/tienda/checkout?cancelled=1`,
    })

    // ── 6. Save order in DB with PENDING status BEFORE redirecting
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          folio,
          userId:          session.userId,
          status:          "PENDING",
          totalMxn,
          stripeSessionId: stripeSession.id,
          customerEmail:   session.email,
          customerPhone:   body.phone,
          notes:           body.notes,
          shippingName:    body.address.name,
          shippingStreet:  body.address.street,
          shippingCity:    body.address.city,
          shippingState:   body.address.state,
          shippingPostal:  body.address.postalCode,
          shippingCountry: body.address.country,
          items: {
            create: body.items.map(item => {
              const product = products.find(p => p.id === item.productId)!
              return {
                productId: product.id,
                name:      product.name,
                image:     product.image,
                priceMxn:  product.priceMxn,
                quantity:  item.quantity,
              }
            }),
          },
        },
      })

      // Reserve stock optimistically
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        })
      }

      return order
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error("[checkout]", err)
    return NextResponse.json({ error: "Error al crear la sesión de pago" }, { status: 500 })
  }
}
