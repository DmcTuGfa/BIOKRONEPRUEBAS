import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE = "bk_session"

export interface SessionPayload {
  userId: string
  email: string
  role: string
  name: string
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete(COOKIE)
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error("UNAUTHORIZED")
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN")
  return session
}

// Hash password with Web Crypto (no bcrypt dependency issues)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("")
  const encoder = new TextEncoder()
  const data = encoder.encode(saltHex + password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("")
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(":")
  const encoder = new TextEncoder()
  const data = encoder.encode(saltHex + password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("")
  return hashHex === storedHash
}
