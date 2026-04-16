import { NextResponse } from "next/server"
import { getProductBySlugSafe } from "@/lib/db-safe"

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await getProductBySlugSafe(params.slug)
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(product)
}
