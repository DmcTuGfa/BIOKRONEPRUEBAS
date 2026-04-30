import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tracking/[orderId]
 * Devuelve info de tracking de un pedido.
 * Solo el dueño del pedido o un ADMIN puede consultarlo.
 */
export async function GET(_req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: {
        userId:          true,
        status:          true,
        shippingStatus:  true,
        shippingCarrier: true,
        trackingNumber:  true,
        trackingUrl:     true,
        folio:           true,
      },
    })

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    if (order.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    return NextResponse.json({
      folio:           order.folio,
      orderStatus:     order.status,
      shippingStatus:  order.shippingStatus,
      carrier:         order.shippingCarrier,
      trackingNumber:  order.trackingNumber,
      trackingUrl:     order.trackingUrl,
    })
  } catch (err) {
    console.error("[tracking/GET]", err)
    return NextResponse.json({ error: "Error al obtener tracking" }, { status: 500 })
  }
}
