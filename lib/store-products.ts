export interface StoreProduct {
  id: string
  name: string
  slug: string
  presentation: string
  category: "FUNGICIDAS" | "BIOINSECTICIDAS" | "BIOFORTIFICANTES"
  description: string
  price: number // MXN cents (for Stripe)
  priceDisplay: string
  image: string
  inStock: boolean
  stripePriceId?: string // se llena con tu dashboard de Stripe
}

export const storeProducts: StoreProduct[] = [
  { id: "1",  name: "Baktilis",           slug: "baktilis",           presentation: "Suspensión concentrada 1L",    category: "FUNGICIDAS",       description: "Biofungicida y bactericida de amplio espectro.", price: 89000, priceDisplay: "$890.00", image: "/images/products/baktilis.jpg",           inStock: true },
  { id: "2",  name: "NatuControl",        slug: "natucontrol",        presentation: "Polvo humectable 400g",        category: "FUNGICIDAS",       description: "Nematicida biológico para cultivos de alto valor.", price: 76000, priceDisplay: "$760.00", image: "/images/products/natucontrol.jpg",        inStock: true },
  { id: "3",  name: "BioCopper",          slug: "biocopper",          presentation: "Gránulos dispersables 1kg",    category: "FUNGICIDAS",       description: "Fungicida cúprico de origen biológico.", price: 65000, priceDisplay: "$650.00", image: "/images/products/biocopper.jpg",          inStock: true },
  { id: "4",  name: "BioCopper Mix Pro",  slug: "biocopper-mix-pro",  presentation: "Gránulos dispersables 1kg",    category: "FUNGICIDAS",       description: "Formulación mejorada de acción sistémica y contacto.", price: 82000, priceDisplay: "$820.00", image: "/images/products/biocopper-mix-pro.jpg",  inStock: true },
  { id: "5",  name: "Glumix Migration",   slug: "glumix-migration",   presentation: "Sólido granulado 1kg",         category: "BIOFORTIFICANTES", description: "Biofortificante con microorganismos benéficos.", price: 59000, priceDisplay: "$590.00", image: "/images/products/glumix-migration.jpg",   inStock: true },
  { id: "6",  name: "Glumix",             slug: "glumix",             presentation: "Polvo soluble 1kg",            category: "BIOFORTIFICANTES", description: "Bioestimulante a base de aminoácidos y extractos vegetales.", price: 54000, priceDisplay: "$540.00", image: "/images/products/glumix.jpg",             inStock: true },
  { id: "7",  name: "AZSeed",             slug: "azseed",             presentation: "Polvo humectable 100g",        category: "BIOFORTIFICANTES", description: "Tratamiento de semillas con bacterias fijadoras de nitrógeno.", price: 38000, priceDisplay: "$380.00", image: "/images/products/azseed.jpg",             inStock: true },
  { id: "8",  name: "AmiTone",            slug: "amitone",            presentation: "Líquido concentrado 1L",       category: "BIOFORTIFICANTES", description: "Bioestimulante foliar rico en aminoácidos libres.", price: 61000, priceDisplay: "$610.00", image: "/images/products/amitone.jpg",            inStock: true },
  { id: "9",  name: "BioElicitor",        slug: "bioelicitor",        presentation: "Líquido concentrado 1L",       category: "BIOFORTIFICANTES", description: "Activador de defensas naturales de la planta.", price: 72000, priceDisplay: "$720.00", image: "/images/products/bioelicitor.jpg",        inStock: true },
  { id: "10", name: "Recento",            slug: "recento",            presentation: "Líquido concentrado 1L",       category: "BIOFORTIFICANTES", description: "Biofortificante que mejora cuajado de frutos.", price: 67000, priceDisplay: "$670.00", image: "/images/products/recento.jpg",            inStock: true },
  { id: "11", name: "EPA 90",             slug: "epa-90",             presentation: "Líquido emulsionable 1L",      category: "BIOINSECTICIDAS",  description: "Bioinsecticida de amplio espectro a base de Neem.", price: 78000, priceDisplay: "$780.00", image: "/images/products/epa-90.jpg",             inStock: true },
  { id: "12", name: "Ajick",              slug: "ajick",              presentation: "Solución acuosa 1L",           category: "BIOINSECTICIDAS",  description: "Repelente natural a base de extractos de ajo.", price: 42000, priceDisplay: "$420.00", image: "/images/products/ajick.jpg",              inStock: true },
  { id: "13", name: "Azanim",             slug: "azanim",             presentation: "Concentrado emulsionable 1L",  category: "BIOINSECTICIDAS",  description: "Insecticida botánico a base de azadiractina.", price: 85000, priceDisplay: "$850.00", image: "/images/products/azanim.jpg",             inStock: true },
  { id: "14", name: "Capsikron",          slug: "capsikron",          presentation: "Líquido concentrado 1L",       category: "BIOINSECTICIDAS",  description: "Bioinsecticida a base de capsaicina.", price: 48000, priceDisplay: "$480.00", image: "/images/products/capsikron.jpg",          inStock: true },
  { id: "15", name: "Pirelium",           slug: "pirelium",           presentation: "Líquido concentrado 1L",       category: "BIOINSECTICIDAS",  description: "Insecticida natural a base de piretrinas.", price: 55000, priceDisplay: "$550.00", image: "/images/products/pirelium.jpg",           inStock: true },
  { id: "16", name: "CinnAnim",           slug: "cinnanim",           presentation: "Líquido concentrado 1L",       category: "BIOINSECTICIDAS",  description: "Fungicida e insecticida a base de extracto de canela.", price: 51000, priceDisplay: "$510.00", image: "/images/products/cinnanim.jpg",           inStock: true },
]

export const storeCategoryLabels: Record<string, string> = {
  all: "Todos los productos",
  FUNGICIDAS: "Fungicidas",
  BIOINSECTICIDAS: "Bioinsecticidas",
  BIOFORTIFICANTES: "Biofortificantes",
}
