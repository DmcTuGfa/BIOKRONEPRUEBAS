import { prisma } from "./prisma"

export async function generateFolio(): Promise<string> {
  const counter = await prisma.orderCounter.upsert({
    where: { id: 1 },
    update: { count: { increment: 1 } },
    create: { id: 1, count: 1 },
  })
  return `BIO-ORD-${counter.count.toString().padStart(6, "0")}`
}
