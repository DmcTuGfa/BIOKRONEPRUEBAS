"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const verified = searchParams.get("verified") === "1"
  const redirect  = searchParams.get("redirect") || "/"

  useEffect(() => { if (user) router.push(redirect) }, [user, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const result = await login(email, password)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push(redirect)
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
          <CardHeader><CardTitle className="text-xl text-center">Iniciar sesión</CardTitle></CardHeader>
          <CardContent>
            {verified && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle2 className="h-4 w-4" />Correo verificado. Ya puedes iniciar sesión.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ingresando...</> : "Iniciar sesión"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">Regístrate</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
