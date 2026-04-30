import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

    // Solo el dueño o un admin puede ver el pedido
    if (order.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error("[orders/id/GET]", err)
    return NextResponse.json({ error: "Error al obtener el pedido" }, { status: 500 })
  }
}
