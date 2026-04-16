import { prisma } from "@/lib/prisma"
import { storeProducts } from "@/lib/store-products"

export async function getProductsSafe() {
  try {
    return await prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  } catch (error) {
    console.warn("[db-safe] fallback products", error)
    return storeProducts.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, description: p.description, fullDescription: p.description, benefits: [], application: "", presentation: p.presentation, type: p.presentation, category: p.category, image: p.image, priceMxn: p.price, stock: p.inStock ? 999 : 0, active: p.inStock, createdAt: new Date(), updatedAt: new Date(),
    }))
  }
}

export async function getProductBySlugSafe(slug: string) {
  try {
    return await prisma.product.findUnique({ where: { slug } })
  } catch (error) {
    console.warn("[db-safe] fallback product", error)
    const p = storeProducts.find((x) => x.slug === slug)
    if (!p) return null
    return { id: p.id, slug: p.slug, name: p.name, description: p.description, fullDescription: p.description, benefits: [], application: "", presentation: p.presentation, type: p.presentation, category: p.category, image: p.image, priceMxn: p.price, stock: p.inStock ? 999 : 0, active: p.inStock, createdAt: new Date(), updatedAt: new Date() }
  }
}
