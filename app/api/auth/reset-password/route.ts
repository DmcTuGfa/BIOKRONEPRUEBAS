import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

const schema = z.object({ token: z.string(), password: z.string().min(8) })

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json())
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    })
    if (!user) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), resetToken: null, resetTokenExpiry: null },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
