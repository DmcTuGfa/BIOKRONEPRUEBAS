"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export const dynamic = "force-dynamic"

export default function CuentaPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/auth/login?redirect=/cuenta/pedidos")
      return
    }
    router.replace(user.role === "ADMIN" ? "/admin" : "/cuenta/pedidos")
  }, [user, loading, router])

  return null
}
