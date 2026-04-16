import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateFolio } from "@/lib/folio"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })

const cartItemSchema = z.object({
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  quantity: z.number().int().positive(),
})

const addressSchema = z.object({
  name: z.string().min(2),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default("México"),
})

const schema = z.object({
  items: z.array(cartItemSchema).min(1),
  address: addressSchema,
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const body = schema.parse(await req.json())

    const requestedItems = body.items.map((item) => ({
      lookup: item.productSlug || item.productId || "",
      quantity: item.quantity,
    }))

    const lookups = requestedItems.map((item) => item.lookup).filter(Boolean)
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { id: { in: lookups } },
          { slug: { in: lookups } },
        ],
      },
    })

    if (products.length !== requestedItems.length) {
      return NextResponse.json({ error: "Uno o más productos no están disponibles" }, { status: 400 })
    }

    const matchedItems = requestedItems.map((item) => {
      const product = products.find((p) => p.slug === item.lookup || p.id === item.lookup)
      if (!product) throw new Error("Producto no encontrado")
      return { product, quantity: item.quantity }
    })

    for (const item of matchedItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.product.name}` }, { status: 400 })
      }
      if (item.product.priceMxn <= 0) {
        return NextResponse.json({ error: `${item.product.name} no tiene precio configurado. Contacta a ventas.` }, { status: 400 })
      }
    }

    const totalMxn = matchedItems.reduce((sum, item) => sum + item.product.priceMxn * item.quantity, 0)
    const folio = await generateFolio()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "mxn",
      customer_email: session.email,
      line_items: matchedItems.map(({ product, quantity }) => ({
        price_data: {
          currency: "mxn",
          unit_amount: product.priceMxn,
          product_data: {
            name: product.name,
            description: product.presentation,
            images: product.image.startsWith("http") ? [product.image] : undefined,
          },
        },
        quantity,
      })),
      metadata: {
        folio,
        userId: session.userId,
      },
      success_url: `${appUrl}/tienda/success?folio=${folio}`,
      cancel_url: `${appUrl}/tienda/checkout?cancelled=1`,
    })

    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          folio,
          userId: session.userId,
          status: "PENDING",
          totalMxn,
          stripeSessionId: stripeSession.id,
          customerEmail: session.email,
          customerPhone: body.phone,
          notes: body.notes,
          shippingName: body.address.name,
          shippingStreet: body.address.street,
          shippingCity: body.address.city,
          shippingState: body.address.state,
          shippingPostal: body.address.postalCode,
          shippingCountry: body.address.country,
          items: {
            create: matchedItems.map(({ product, quantity }) => ({
              productId: product.id,
              name: product.name,
              image: product.image,
              priceMxn: product.priceMxn,
              quantity,
            })),
          },
        },
      })

      for (const item of matchedItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        })
      }
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error("[checkout]", err)
    return NextResponse.json({ error: "Error al crear la sesión de pago" }, { status: 500 })
  }
}
