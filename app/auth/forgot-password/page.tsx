"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Loader2, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setSent(true); setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-foreground">
            <div className="p-2 rounded-xl bg-primary"><Leaf className="h-6 w-6 text-primary-foreground" /></div>
            BIOKRONE
          </Link>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-xl text-center">Recuperar contraseña</CardTitle></CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-foreground mb-2">Revisa tu correo</p>
                <p className="text-sm text-muted-foreground">Si el correo existe, recibirás un enlace de recuperación.</p>
                <Link href="/auth/login" className="text-primary hover:underline text-sm mt-4 block">Volver al login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Correo electrónico</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Enviar enlace"}
                </Button>
                <p className="text-center text-sm"><Link href="/auth/login" className="text-primary hover:underline">Volver al login</Link></p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
