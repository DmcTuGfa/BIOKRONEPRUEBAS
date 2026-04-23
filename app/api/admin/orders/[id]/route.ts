import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  status:          z.enum(["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"]).optional(),
  trackingNumber:  z.string().optional().nullable(),
  shippingCarrier: z.string().optional().nullable(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }
  const order = await prisma.order.findUnique({
    where:   { id: params.id },
    include: { items: true, user: { select: { name: true, email: true, phone: true } } },
  })
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const body = schema.parse(await req.json())

  // ── Regla: si se asigna guía y el status no estaba ya en SHIPPED+,
  //    auto-avanzar a SHIPPED ────────────────────────────────────────
  const current = await prisma.order.findUnique({ where: { id: params.id }, select: { status: true } })

  const FINAL_STATUSES = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
  let newStatus = body.status ?? current?.status

  if (
    body.trackingNumber &&                           // se está asignando guía
    body.trackingNumber.trim() !== "" &&
    current?.status &&
    !FINAL_STATUSES.includes(current.status) &&      // no está ya en estado final
    (!body.status || body.status === current.status) // el admin no eligió uno diferente
  ) {
    newStatus = "SHIPPED"
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status:          newStatus,
      trackingNumber:  body.trackingNumber  !== undefined ? body.trackingNumber  : undefined,
      shippingCarrier: body.shippingCarrier !== undefined ? body.shippingCarrier : undefined,
    },
  })

  return NextResponse.json(order)
}
