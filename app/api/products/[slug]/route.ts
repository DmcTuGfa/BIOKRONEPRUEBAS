import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, active: true },
  })
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  return NextResponse.json(product)
}
