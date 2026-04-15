"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()

  const goToCheckout = () => {
    window.location.href = "/tienda/checkout"
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Carrito</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              Explora nuestro catálogo y agrega productos.
            </p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-auto py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate mb-2">{item.presentation}</p>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1.5 hover:bg-muted transition-colors">
                          <Minus className="h-3 w-3 text-foreground" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-foreground min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1.5 hover:bg-muted transition-colors">
                          <Plus className="h-3 w-3 text-foreground" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          ${((item.price * item.quantity) / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </span>
                        <button onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  ${(totalPrice / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              <Button className="w-full h-11 text-base" onClick={goToCheckout}>
                <CreditCard className="h-5 w-5 mr-2" />
                Pagar con Stripe
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar carrito
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
