"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4 hover:opacity-80 transition-opacity">
              <div className="p-1.5 rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              BIOKRONE
            </Link>
            <p className="text-background/70 text-sm max-w-md">
              Empresa mexicana líder en el desarrollo y comercialización de productos biológicos para la agricultura sustentable.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {[
                { label: "Inicio", href: "/" },
                { label: "Cobertura", href: "/#cobertura" },
                { label: "Tienda", href: "/tienda" },
                { label: "Acerca de nosotros", href: "/nosotros" },
                { label: "Contacto", href: "/contacto" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-background transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {[
                { label: "Fungicidas",        href: "/tienda?categoria=FUNGICIDAS" },
                { label: "Biofortificantes",  href: "/tienda?categoria=BIOFORTIFICANTES" },
                { label: "Bioinsecticidas",   href: "/tienda?categoria=BIOINSECTICIDAS" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-background transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">{new Date().getFullYear()} BIOKRONE. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-background/50">
            <a href="#" className="hover:text-background transition-colors">Aviso de privacidad</a>
            <a href="#" className="hover:text-background transition-colors">Términos y condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
