"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Leaf, ShoppingCart } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "@/contexts/cart-context"

interface NavbarProps {
  onScrollTo?: (section: string) => void
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { totalItems } = useCart()

  const navItems = [
    { label: "Inicio",    href: "/",           section: "hero" },
    { label: "Cobertura", href: "/#cobertura",  section: "cobertura" },
    { label: "Tienda",    href: "/tienda",      section: "" },
    { label: "Acerca de", href: "/nosotros",    section: "" },
    { label: "Contacto",  href: "/contacto",    section: "contacto" },
  ]

  const handleNavClick = (item: { href: string; section: string }) => {
    if (isHomePage && item.section && onScrollTo) onScrollTo(item.section)
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors">
            <div className="p-1.5 rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            BIOKRONE
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]) && item.href !== "/"
              if (isHomePage && item.section && item.href.includes("#")) {
                return (
                  <Button key={item.section} variant="ghost" onClick={() => handleNavClick(item)}
                    className={isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
                    {item.label}
                  </Button>
                )
              }
              return (
                <Button key={item.href} variant="ghost" asChild
                  className={isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {/* Cart icon — goes to checkout */}
            <Button variant="outline" size="icon" className="relative" asChild>
              <Link href="/tienda/checkout">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/tienda">Comprar</Link>
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" className="relative" asChild>
              <Link href="/tienda/checkout">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                if (isHomePage && item.section && item.href.includes("#")) {
                  return (
                    <Button key={item.section} variant="ghost" onClick={() => handleNavClick(item)}
                      className="justify-start text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Button>
                  )
                }
                return (
                  <Button key={item.href} variant="ghost" asChild
                    className="justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}>
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                )
              })}
              <Button asChild className="mt-2">
                <Link href="/tienda">Comprar en Línea</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
