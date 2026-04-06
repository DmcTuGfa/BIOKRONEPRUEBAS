"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Droplets, FlaskConical, ShoppingCart, Check, Plus, Minus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "./product-card"

interface ProductModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getProductIcon = (type: string) => {
  if (type.toLowerCase().includes("líquido") || type.toLowerCase().includes("solución") || type.toLowerCase().includes("liquido")) {
    return <Droplets className="h-12 w-12 text-primary" />
  }
  if (type.toLowerCase().includes("polvo") || type.toLowerCase().includes("gránulos") || type.toLowerCase().includes("granulos")) {
    return <FlaskConical className="h-12 w-12 text-primary" />
  }
  return <Package className="h-12 w-12 text-primary" />
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { addToCart, isInCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  
  if (!product) return null
  
  const inCart = isInCart(product.id)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setQuantity(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-primary/10">
              {getProductIcon(product.type)}
            </div>
            <div>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <DialogDescription className="text-base">
                {product.presentation}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.type}</Badge>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Descripcion</h4>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Presentacion</h4>
            <p className="text-muted-foreground">{product.presentation}</p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Agrega este producto a tu carrito de cotizacion.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                variant={inCart ? "secondary" : "default"}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Agregar mas
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar al carrito
                  </>
                )}
              </Button>
            </div>
            
            {inCart && (
              <p className="text-sm text-primary mt-2 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Este producto ya esta en tu carrito
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
