import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name:            z.string().optional(),
  description:     z.string().optional(),
  presentation:    z.string().optional(),
  category:        z.string().optional(),
  priceMxn:        z.number().int().min(0).optional(),
  stock:           z.number().int().min(0).optional(),
  active:          z.boolean().optional(),
  image:           z.string().optional(),
  fullDescription: z.string().optional(),
  benefits:        z.array(z.string()).optional(),
  application:     z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }
  try {
    const data = schema.parse(await req.json())
    const product = await prisma.product.update({ where: { id: params.id }, data })
    return NextResponse.json(product)
  } catch (err) {
    console.error("[products/PATCH]", err)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }
  try {
    const { permanent } = await req.json().catch(() => ({ permanent: false }))

    if (permanent) {
      // Borrado definitivo — solo si no tiene pedidos asociados
      const hasOrders = await prisma.orderItem.count({ where: { productId: params.id } })
      if (hasOrders > 0) {
        // Si tiene pedidos, solo desactivar para no romper historial
        await prisma.product.update({ where: { id: params.id }, data: { active: false } })
        return NextResponse.json({ ok: true, note: "Producto desactivado (tiene pedidos asociados)" })
      }
      await prisma.product.delete({ where: { id: params.id } })
      return NextResponse.json({ ok: true, deleted: true })
    }

    // Desactivar (ocultar de la tienda sin borrar)
    await prisma.product.update({ where: { id: params.id }, data: { active: false } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[products/DELETE]", err)
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
