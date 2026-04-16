"use client"

export const dynamic = 'force-dynamic'

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Loader2, AlertCircle } from "lucide-react"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/cuenta/pedidos"
  const { register } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    setLoading(true)
    setError(null)
    const result = await register(form.name, form.email, form.password, form.phone || undefined)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push(redirect)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

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
          <CardHeader><CardTitle className="text-xl text-center">Crear cuenta</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={form.name} onChange={set("name")} required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input type="email" value={form.email} onChange={set("email")} required />
              </div>
              <div className="space-y-2">
                <Label>Contraseña (mín. 8 caracteres)</Label>
                <Input type="password" value={form.password} onChange={set("password")} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono (opcional)</Label>
                <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+52 000 000 0000" />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />{error}
                </div>
              )}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registrando...</> : "Crear cuenta"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Ya tienes cuenta? <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary hover:underline font-medium">Inicia sesión</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <RegisterContent />
    </Suspense>
  )
}
