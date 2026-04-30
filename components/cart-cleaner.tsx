"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"

/**
 * Componente cliente invisible que limpia el carrito al montarse.
 * Se usa en la página de éxito tras el pago.
 */
export function CartCleaner() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
  }, [clearCart])
  return null
}
