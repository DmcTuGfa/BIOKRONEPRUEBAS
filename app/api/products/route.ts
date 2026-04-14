import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get("category")

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true, slug: true, name: true, description: true, presentation: true,
      type: true, category: true, image: true, priceMxn: true, stock: true,
    },
  })

  return NextResponse.json(products)
}
