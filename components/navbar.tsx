"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Leaf, ShoppingCart, User, LogOut, Package, Settings } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

interface NavbarProps { onScrollTo?: (section: string) => void }

export function Navbar({ onScrollTo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { totalItems } = useCart()
  const { user, logout } = useAuth()

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
            <div className="p-1.5 rounded-lg bg-primary"><Leaf className="h-5 w-5 text-primary-foreground" /></div>
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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/pedidos" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />Mis pedidos
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/pedidos" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />Admin — Pedidos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/productos" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />Admin — Productos
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive flex items-center gap-2">
                    <LogOut className="h-4 w-4" />Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            )}
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
                      className="justify-start text-muted-foreground hover:text-foreground">{item.label}</Button>
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
              <div className="border-t border-border pt-2 mt-1">
                {user ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start w-full" onClick={() => setIsOpen(false)}>
                      <Link href="/cuenta/pedidos"><Package className="h-4 w-4 mr-2" />Mis pedidos</Link>
                    </Button>
                    {user.role === "ADMIN" && (
                      <Button variant="ghost" asChild className="justify-start w-full" onClick={() => setIsOpen(false)}>
                        <Link href="/admin/pedidos"><Settings className="h-4 w-4 mr-2" />Admin</Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start w-full text-destructive" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full mt-1">
                    <Link href="/auth/login">Iniciar sesión</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
