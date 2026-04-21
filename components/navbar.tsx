"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Leaf, ShoppingCart, User, Package, LogOut, ShieldCheck, ChevronDown } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

interface NavbarProps {
  onScrollTo?: (section: string) => void
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { totalItems } = useCart()
  const { user, loading, logout } = useAuth()

  const navItems = [
    { label: "Inicio",    href: "/",          section: "hero" },
    { label: "Cobertura", href: "/#cobertura", section: "cobertura" },
    { label: "Tienda",    href: "/tienda",     section: "" },
    { label: "Acerca de", href: "/nosotros",   section: "" },
    { label: "Contacto",  href: "/contacto",   section: "contacto" },
  ]

  const handleNavClick = (item: { href: string; section: string }) => {
    if (isHomePage && item.section && onScrollTo) onScrollTo(item.section)
    setIsOpen(false)
  }

  const desktopNavClass = (isActive: boolean) =>
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"

  const mobileNavClass = "justify-start text-muted-foreground hover:text-foreground"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors">
            <div className="p-1.5 rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            BIOKRONE
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("#")[0]) && item.href !== "/"

              if (isHomePage && item.section && item.href.includes("#")) {
                return (
                  <Button key={item.section} variant="ghost" onClick={() => handleNavClick(item)} className={desktopNavClass(isActive)}>
                    {item.label}
                  </Button>
                )
              }
              return (
                <Button key={item.href} variant="ghost" asChild className={desktopNavClass(isActive)}>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {/* Carrito */}
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

            {!loading && (user ? (
              <div className="flex items-center gap-1.5">
                {/* Dropdown de cuenta */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 max-w-[200px] h-9">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm">{user.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/cuenta/pedidos" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />Mis pedidos
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <ShieldCheck className="h-4 w-4 mr-2" />Panel admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botón de cerrar sesión siempre visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Cerrar sesión"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`}>Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Crear cuenta</Link>
                </Button>
              </>
            ))}
          </div>

          {/* Mobile right */}
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
            {/* Cerrar sesión directo en mobile si está logueado */}
            {user && (
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Cerrar sesión"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                if (isHomePage && item.section && item.href.includes("#")) {
                  return (
                    <Button key={item.section} variant="ghost" onClick={() => handleNavClick(item)} className={mobileNavClass}>
                      {item.label}
                    </Button>
                  )
                }
                return (
                  <Button key={item.href} variant="ghost" asChild className={mobileNavClass} onClick={() => setIsOpen(false)}>
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                )
              })}

              <div className="pt-2 mt-2 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm rounded-lg bg-muted">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" asChild className={mobileNavClass} onClick={() => setIsOpen(false)}>
                      <Link href="/cuenta/pedidos"><Package className="h-4 w-4 mr-2" />Mis pedidos</Link>
                    </Button>
                    {user.role === "ADMIN" && (
                      <Button variant="ghost" asChild className={mobileNavClass} onClick={() => setIsOpen(false)}>
                        <Link href="/admin"><ShieldCheck className="h-4 w-4 mr-2" />Panel admin</Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className={`${mobileNavClass} text-destructive hover:text-destructive`}
                      onClick={async () => { setIsOpen(false); await logout() }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className={mobileNavClass} onClick={() => setIsOpen(false)}>
                      <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`}>Iniciar sesión</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/auth/register">Crear cuenta</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
