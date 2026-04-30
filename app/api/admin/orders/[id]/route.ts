import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  status:          z.enum(["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"]).optional(),
  trackingNumber:  z.string().optional().nullable(),
  trackingUrl:     z.string().url().optional().nullable(),
  shippingCarrier: z.string().optional().nullable(),
  shippingStatus:  z.enum(["PENDIENTE","PREPARANDO","ENVIADO","EN_TRANSITO","ENTREGADO"]).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }
  try {
    const order = await prisma.order.findUnique({
      where:   { id: params.id },
      include: { items: true, user: { select: { name: true, email: true, phone: true } } },
    })
    if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json(order)
  } catch (err) {
    console.error("[admin/orders/GET]", err)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  try {
    const body = schema.parse(await req.json())

    const current = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true },
    })

    if (!current) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

    // Auto-avanzar a SHIPPED si se asigna guía y no está en estado final
    const FINAL_STATUSES = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
    let newStatus = body.status ?? current.status
    if (
      body.trackingNumber &&
      body.trackingNumber.trim() !== "" &&
      !FINAL_STATUSES.includes(current.status) &&
      (!body.status || body.status === current.status)
    ) {
      newStatus = "SHIPPED"
    }

    // Calcular shippingStatus automático al marcar como ENVIADO si no viene en body
    let newShippingStatus = body.shippingStatus
    if (newStatus === "SHIPPED" && !newShippingStatus) {
      newShippingStatus = "ENVIADO"
    } else if (newStatus === "DELIVERED" && !newShippingStatus) {
      newShippingStatus = "ENTREGADO"
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status:          newStatus,
        trackingNumber:  body.trackingNumber  !== undefined ? body.trackingNumber  : undefined,
        trackingUrl:     body.trackingUrl     !== undefined ? body.trackingUrl     : undefined,
        shippingCarrier: body.shippingCarrier !== undefined ? body.shippingCarrier : undefined,
        shippingStatus:  newShippingStatus    !== undefined ? newShippingStatus    : undefined,
      },
    })

    return NextResponse.json(order)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error("[admin/orders/PATCH]", err)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}
