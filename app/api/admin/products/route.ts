import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(products)
}

const schema = z.object({
  slug: z.string(), name: z.string(), description: z.string(),
  fullDescription: z.string().optional(), benefits: z.array(z.string()).optional(),
  application: z.string().optional(), presentation: z.string(), type: z.string(),
  category: z.string(), image: z.string(), priceMxn: z.number().int().min(0),
  stock: z.number().int().min(0), active: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  const data = schema.parse(await req.json())
  const product = await prisma.product.create({ data })
  return NextResponse.json(product, { status: 201 })
}
