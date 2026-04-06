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
    { label: "Inicio", href: "/", section: "hero" },
    { label: "Cobertura", href: "/#cobertura", section: "cobertura" },
    { label: "Tienda", href: "/tienda", section: "" },
    { label: "Acerca de", href: "/nosotros", section: "" },
    { label: "Contacto", href: "/contacto", section: "contacto" },
  ]

  const handleNavClick = (item: { href: string; section: string }) => {
    if (isHomePage && item.section && onScrollTo) onScrollTo(item.section)
    setIsOpen(false)
  }

  const desktopNavClass = (isActive: boolean) =>
    isActive
      ? isHomePage
        ? "text-white"
        : "text-black"
      : isHomePage
        ? "text-white/70 hover:text-white"
        : "text-muted-foreground hover:text-black"

  const mobileNavClass = isHomePage
    ? "justify-start text-white/70 hover:text-white"
    : "justify-start text-muted-foreground hover:text-black"

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-colors ${
        isHomePage
          ? "bg-black/70 border-white/10 text-white supports-[backdrop-filter]:bg-black/60"
          : "bg-white/90 border-border text-black supports-[backdrop-filter]:bg-white/70"
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-xl transition-colors ${
              isHomePage ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"
            }`}
          >
            <div className="p-1.5 rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            BIOKRONE
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]) && item.href !== "/"

              if (isHomePage && item.section && item.href.includes("#")) {
                return (
                  <Button
                    key={item.section}
                    variant="ghost"
                    onClick={() => handleNavClick(item)}
                    className={desktopNavClass(isActive)}
                  >
                    {item.label}
                  </Button>
                )
              }

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={desktopNavClass(isActive)}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="outline"
              size="icon"
              className={`relative ${
                isHomePage
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  : ""
              }`}
              asChild
            >
              <Link href="/tienda/checkout">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            <Button
              variant="outline"
              size="icon"
              className={`relative ${
                isHomePage
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  : ""
              }`}
              asChild
            >
              <Link href="/tienda/checkout">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={isHomePage ? "text-white hover:text-white hover:bg-white/10" : ""}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div
            className={`md:hidden py-4 border-t animate-in slide-in-from-top-2 duration-200 ${
              isHomePage ? "border-white/10" : "border-border"
            }`}
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                if (isHomePage && item.section && item.href.includes("#")) {
                  return (
                    <Button
                      key={item.section}
                      variant="ghost"
                      onClick={() => handleNavClick(item)}
                      className={mobileNavClass}
                    >
                      {item.label}
                    </Button>
                  )
                }

                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className={mobileNavClass}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
