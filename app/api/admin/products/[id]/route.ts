import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().optional(), description: z.string().optional(),
  priceMxn: z.number().int().min(0).optional(), stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(), image: z.string().optional(),
  fullDescription: z.string().optional(), benefits: z.array(z.string()).optional(),
  application: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  const data = schema.parse(await req.json())
  const product = await prisma.product.update({ where: { id: params.id }, data })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  await prisma.product.update({ where: { id: params.id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
