import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }

  const { status } = z.object({ status: z.enum(["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"]) }).parse(await req.json())

  const order = await prisma.order.update({
    where: { id: params.id },
    data:  { status },
  })
  return NextResponse.json(order)
}
