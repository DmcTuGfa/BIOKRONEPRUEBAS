import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendEmail, resetPasswordTemplate } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(await req.json())
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return ok to prevent user enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
      })
      const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
      await sendEmail({ to: user.email, subject: "Restablecer contraseña — BIOKRONE", html: resetPasswordTemplate(user.name, link) })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
