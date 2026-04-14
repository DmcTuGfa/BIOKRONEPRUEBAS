import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth"

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name })
    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
    })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error("[login]", err)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
