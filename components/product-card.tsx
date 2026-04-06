"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Droplets, FlaskConical, ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export interface Product {
  id: string
  name: string
  slug: string
  presentation: string
  type: string
  description: string
  fullDescription?: string
  benefits?: string[]
  application?: string
  category: string
  image?: string
}

interface ProductCardProps {
  product: Product
}

const getProductIcon = (type: string) => {
  if (type.toLowerCase().includes("líquido") || type.toLowerCase().includes("solución") || type.toLowerCase().includes("liquido")) {
    return <Droplets className="h-8 w-8 text-primary" />
  }
  if (type.toLowerCase().includes("polvo") || type.toLowerCase().includes("gránulos") || type.toLowerCase().includes("granulos")) {
    return <FlaskConical className="h-8 w-8 text-primary" />
  }
  return <Package className="h-8 w-8 text-primary" />
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10">
            {getProductIcon(product.type)}
          </div>
          <Badge variant="secondary" className="text-xs">
            {product.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.presentation}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          asChild
          className="flex-1"
          variant="outline"
        >
          <Link href={`/tienda/producto/${product.slug}`}>Ver detalle</Link>
        </Button>
        <Button 
          onClick={handleAddToCart}
          size="icon"
          variant={inCart ? "default" : "secondary"}
          className="shrink-0"
        >
          {inCart ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          <span className="sr-only">{inCart ? "En carrito" : "Agregar al carrito"}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
