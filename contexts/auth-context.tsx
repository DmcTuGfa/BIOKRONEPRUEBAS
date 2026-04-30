"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string; user?: User | null }>
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string; user?: User | null }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await res.json()
      // Siempre usar null cuando no hay usuario, nunca undefined
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error }
      setUser(data.user ?? null)
      return { user: data.user ?? null }
    } catch {
      return { error: "Error de red al iniciar sesión" }
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error }
      setUser(data.user ?? null)
      return { user: data.user ?? null }
    } catch {
      return { error: "Error de red al registrarse" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    setUser(null)
    // Limpiar carrito del localStorage al cerrar sesión
    try {
      localStorage.removeItem("biokrone_cart")
      sessionStorage.removeItem("biokrone_cart")
    } catch {}
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
