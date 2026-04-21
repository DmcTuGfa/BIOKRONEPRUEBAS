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
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: { select: { name: true, email: true, phone: true } } },
  })
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  const data = schema.parse(await req.json())
  const order = await prisma.order.update({
    where: { id: params.id },
    data:  { ...data },
  })
  return NextResponse.json(order)
}
