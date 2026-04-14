import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const page   = parseInt(searchParams.get("page") || "1")
  const limit  = 20

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: { items: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip:  (page - 1) * limit,
    take:  limit,
  })

  const total = await prisma.order.count({ where: status ? { status: status as any } : undefined })

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}
