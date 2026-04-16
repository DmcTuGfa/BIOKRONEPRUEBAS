const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const products = [
  { slug: "baktilis", name: "Baktilis", description: "Biofungicida y bactericida de amplio espectro.", fullDescription: "Biofungicida y bactericida de amplio espectro.", benefits: ["Amplio espectro"], application: "Segun recomendación técnica", presentation: "Suspensión concentrada 1L", type: "Suspensión concentrada", category: "FUNGICIDAS", image: "/images/products/baktilis.jpg", priceMxn: 89000, stock: 50, active: true },
  { slug: "natucontrol", name: "NatuControl", description: "Nematicida biológico para cultivos de alto valor.", fullDescription: "Nematicida biológico para cultivos de alto valor.", benefits: ["Control biológico"], application: "Segun recomendación técnica", presentation: "Polvo humectable 400g", type: "Polvo humectable", category: "FUNGICIDAS", image: "/images/products/natucontrol.jpg", priceMxn: 76000, stock: 50, active: true },
  { slug: "biocopper", name: "BioCopper", description: "Fungicida cúprico de origen biológico.", fullDescription: "Fungicida cúprico de origen biológico.", benefits: ["Protección foliar"], application: "Segun recomendación técnica", presentation: "Gránulos dispersables 1kg", type: "Gránulos dispersables", category: "FUNGICIDAS", image: "/images/products/biocopper.jpg", priceMxn: 65000, stock: 50, active: true }
];

async function main(){
  for (const product of products){
    await prisma.product.upsert({ where:{slug:product.slug}, update:product, create:product});
  }
  await prisma.orderCounter.upsert({where:{id:1}, update:{}, create:{id:1,count:0}});
  console.log('Seed completado');
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
