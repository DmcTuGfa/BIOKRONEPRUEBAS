"use client"

import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ProductCard, type Product } from "./product-card"
import { ProductModal } from "./product-modal"
import { Search, Filter } from "lucide-react"

const productsData: Product[] = [
  // Categoría 1: Biofungicidas, Bactericidas y Nematicidas
  {
    id: "1",
    name: "Baktilis",
    presentation: "Suspensión concentrada 1L",
    type: "Suspensión concentrada",
    description: "Biofungicida y bactericida de amplio espectro para el control de enfermedades causadas por hongos y bacterias fitopatógenas.",
    category: "Biofungicidas, Bactericidas y Nematicidas",
  },
  {
    id: "2",
    name: "NatuControl",
    presentation: "Polvo humectable 400g",
    type: "Polvo humectable",
    description: "Nematicida biológico para el control de nematodos fitoparásitos en cultivos de alto valor.",
    category: "Biofungicidas, Bactericidas y Nematicidas",
  },
  {
    id: "3",
    name: "BioCopper",
    presentation: "Gránulos dispersables 1kg",
    type: "Gránulos dispersables",
    description: "Fungicida cúprico de origen biológico para la prevención y control de enfermedades fúngicas.",
    category: "Biofungicidas, Bactericidas y Nematicidas",
  },
  {
    id: "4",
    name: "BioCopper Mix Pro",
    presentation: "Gránulos dispersables 1kg",
    type: "Gránulos dispersables",
    description: "Formulación mejorada con acción sistémica y de contacto para máxima protección contra fitopatógenos.",
    category: "Biofungicidas, Bactericidas y Nematicidas",
  },
  // Categoría 2: Biofortificantes y Bioestimulantes
  {
    id: "5",
    name: "Glumix Migration",
    presentation: "Sólido 1kg",
    type: "Sólido granulado",
    description: "Biofortificante con microorganismos benéficos que mejora la absorción de nutrientes y fortalece el sistema radicular.",
    category: "Biofortificantes y Bioestimulantes",
  },
  {
    id: "6",
    name: "Glumix",
    presentation: "Polvo 1kg",
    type: "Polvo soluble",
    description: "Bioestimulante a base de aminoácidos y extractos vegetales que promueve el crecimiento y desarrollo vegetal.",
    category: "Biofortificantes y Bioestimulantes",
  },
  {
    id: "7",
    name: "AZSeed",
    presentation: "Polvo humectable 100g",
    type: "Polvo humectable",
    description: "Tratamiento de semillas con bacterias fijadoras de nitrógeno para mejorar la germinación y vigor inicial.",
    category: "Biofortificantes y Bioestimulantes",
  },
  {
    id: "8",
    name: "AmiTone",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Bioestimulante foliar rico en aminoácidos libres que mejora la respuesta a condiciones de estrés.",
    category: "Biofortificantes y Bioestimulantes",
  },
  {
    id: "9",
    name: "BioElicitor",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Activador de defensas naturales de la planta que induce resistencia sistémica adquirida.",
    category: "Biofortificantes y Bioestimulantes",
  },
  {
    id: "10",
    name: "Recento",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Biofortificante que mejora el cuajado de frutos y aumenta la calidad de la cosecha.",
    category: "Biofortificantes y Bioestimulantes",
  },
  // Categoría 3: Bioinsecticidas y Acaricidas
  {
    id: "11",
    name: "EPA 90",
    presentation: "Líquido 1L",
    type: "Líquido emulsionable",
    description: "Bioinsecticida de amplio espectro para el control de plagas de lepidópteros y coleópteros.",
    category: "Bioinsecticidas y Acaricidas",
  },
  {
    id: "12",
    name: "Ajick",
    presentation: "Solución acuosa 1L",
    type: "Solución acuosa",
    description: "Repelente natural a base de extractos de ajo para el manejo integrado de plagas.",
    category: "Bioinsecticidas y Acaricidas",
  },
  {
    id: "13",
    name: "Azanim",
    presentation: "Concentrado emulsionable 1L",
    type: "Concentrado emulsionable",
    description: "Insecticida botánico a base de azadiractina para control de insectos chupadores y masticadores.",
    category: "Bioinsecticidas y Acaricidas",
  },
  {
    id: "14",
    name: "Capsikron",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Bioinsecticida a base de capsaicina con efecto repelente y de contacto.",
    category: "Bioinsecticidas y Acaricidas",
  },
  {
    id: "15",
    name: "Pirelium",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Insecticida natural a base de piretrinas para control rápido de plagas.",
    category: "Bioinsecticidas y Acaricidas",
  },
  {
    id: "16",
    name: "Cinnanim",
    presentation: "Líquido 1L",
    type: "Líquido concentrado",
    description: "Acaricida biológico a base de extracto de canela para el control de ácaros fitófagos.",
    category: "Bioinsecticidas y Acaricidas",
  },
]

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "Biofungicidas, Bactericidas y Nematicidas", label: "Biofungicidas, Bactericidas y Nematicidas" },
  { value: "Biofortificantes y Bioestimulantes", label: "Biofortificantes y Bioestimulantes" },
  { value: "Bioinsecticidas y Acaricidas", label: "Bioinsecticidas y Acaricidas" },
]

export function ProductsSection() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  return (
    <section id="productos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Nuestro Portafolio de Productos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explora nuestra línea completa de soluciones biológicas para la agricultura sostenible.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="sm:w-[280px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} onViewDetail={handleViewDetail} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos con los filtros seleccionados.</p>
          </div>
        )}

        <ProductModal
          product={selectedProduct}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </section>
  )
}
