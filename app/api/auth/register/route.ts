import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth"

const schema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
  phone:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 })
    }

    const passwordHash = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        phone: data.phone,
        passwordHash,
        // emailVerified = true: sin confirmación por correo por ahora
        emailVerified: true,
      },
    })

    // Auto-login after register
    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name })
    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: true },
    })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error("[register]", err)
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}
