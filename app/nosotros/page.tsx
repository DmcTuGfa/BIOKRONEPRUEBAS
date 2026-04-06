import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Leaf, Shield, Users, TrendingUp, Globe2, FlaskConical,
  Sprout, Target, Heart, ArrowRight, CheckCircle2, Star, Building2
} from "lucide-react"

// ✏️ Cambia estas variables para actualizar imágenes fácilmente
const HERO_BG_IMAGE    = "/images/campo-hero.jpg"
const COVERAGE_BG_IMAGE = "/images/campo-hero.jpg" // misma que hero, puedes cambiarla

const stats = [
  { value: "15+",    label: "Años de experiencia",    icon: TrendingUp },
  { value: "18+",    label: "Productos registrados",  icon: FlaskConical },
  { value: "20+",    label: "Estados con cobertura",  icon: Globe2 },
  { value: "5,000+", label: "Productores atendidos",  icon: Users },
]

const values = [
  { icon: Leaf,        title: "Sustentabilidad",        description: "Desarrollamos productos que respetan el ciclo natural de la tierra, promoviendo una agricultura en equilibrio con el medio ambiente.", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  { icon: FlaskConical,title: "Innovación Científica",  description: "Nuestro equipo de investigación trabaja constantemente en el desarrollo de nuevas formulaciones biológicas de alta eficacia.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { icon: Shield,      title: "Calidad Certificada",    description: "Todos nuestros productos cuentan con registros COFEPRIS y certificaciones internacionales de calidad e inocuidad.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  { icon: Heart,       title: "Compromiso con el Campo",description: "Más que proveedores, somos socios estratégicos del agricultor mexicano, acompañándolo con asesoría técnica especializada.", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
]

// Cada hito tiene su propia imagen ilustrativa (Unsplash libre de derechos)
const milestones = [
  {
    year: "2009", title: "Fundación de BIOKRONE",
    desc: "Nacemos en León, Guanajuato, con la misión de revolucionar la agricultura mexicana con biotecnología.",
    img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80",
    imgAlt: "Campo agrícola al amanecer",
  },
  {
    year: "2012", title: "Primer laboratorio propio",
    desc: "Inauguramos nuestras instalaciones de investigación y producción certificadas.",
    img: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&q=80",
    imgAlt: "Laboratorio de biotecnología",
  },
  {
    year: "2015", title: "Expansión nacional",
    desc: "Alcanzamos cobertura en 10 estados de la República Mexicana con red de distribuidores.",
    img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80",
    imgAlt: "Mapa de México",
  },
  {
    year: "2018", title: "Portafolio de 15 productos",
    desc: "Completamos líneas de fungicidas, bioinsecticidas y biofortificantes registrados ante COFEPRIS.",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
    imgAlt: "Productos agrícolas biológicos",
  },
  {
    year: "2021", title: "Certificación orgánica",
    desc: "Recibimos certificaciones que avalan el uso de nuestros productos en agricultura orgánica.",
    img: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80",
    imgAlt: "Agricultura orgánica",
  },
  {
    year: "2024", title: "Liderazgo en biotecnología",
    desc: "Consolidados como referente nacional en soluciones biológicas para el agro mexicano.",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80",
    imgAlt: "Líder en biotecnología agrícola",
  },
]

const team = [
  { name: "Dr. Alejandro Méndez",  role: "Director General & Fundador", specialty: "Biotecnología Agrícola", years: "25 años de experiencia" },
  { name: "Ing. Carmen Reyes",     role: "Directora de I+D",            specialty: "Microbiología del Suelo", years: "18 años de experiencia" },
  { name: "M.C. Roberto Flores",   role: "Director Técnico",            specialty: "Fitopatología",           years: "15 años de experiencia" },
  { name: "Ing. Laura Vázquez",    role: "Directora Comercial",         specialty: "Agronegocios",            years: "12 años de experiencia" },
]

const certifications = [
  "COFEPRIS — Registro de plaguicidas biológicos",
  "SENASICA — Insumos de uso agrícola",
  "Certificación de Buenas Prácticas de Manufactura",
  "Certificación para uso en agricultura orgánica",
  "ISO 9001:2015 — Sistema de gestión de calidad",
  "OMRI Listed® — Inputs for organic use",
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── HERO con imagen de fondo ── */}
        <section
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-20 md:py-32"
          style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />Empresa Mexicana
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance leading-tight drop-shadow-lg">
                Transformando la Agricultura{" "}
                <span className="text-primary">Mexicana</span> con Biotecnología
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto text-pretty leading-relaxed">
                Desde 2009, BIOKRONE desarrolla soluciones biológicas de alta tecnología que
                permiten a productores mexicanos aumentar sus rendimientos, reducir costos y
                cuidar el medio ambiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/tienda">
                    <Leaf className="h-5 w-5" />Ver nuestros productos<ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link href="/contacto">Hablar con un experto</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary/5 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary text-primary-foreground"><Target className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-bold text-foreground">Nuestra Misión</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-pretty">
                    Desarrollar, producir y comercializar soluciones biotecnológicas de alta calidad que impulsen la productividad del campo mexicano de manera sustentable, acompañando al productor con servicio técnico especializado en cada etapa de sus cultivos.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Star className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-bold text-foreground">Nuestra Visión</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-pretty">
                    Ser la empresa líder en México en el desarrollo y distribución de insumos biológicos para la agricultura, reconocida por la eficacia de nuestros productos, la calidad de nuestro servicio técnico y nuestro compromiso inquebrantable con el campo y el medio ambiente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Nuestros Valores</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">Los principios que guían cada decisión, cada producto y cada relación con nuestros clientes.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((v) => {
                const Icon = v.icon
                return (
                  <Card key={v.title} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${v.bg} mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${v.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── TIMELINE con imágenes por hito ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Nuestra Historia</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">Más de 15 años transformando el campo mexicano con ciencia y dedicación.</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
              {milestones.map((m, i) => (
                <div key={m.year}
                  className={`flex flex-col md:flex-row gap-6 items-center ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>

                  {/* Image side */}
                  <div className="w-full md:w-5/12 flex-shrink-0">
                    <div className="relative h-52 rounded-2xl overflow-hidden shadow-lg border border-border">
                      <Image
                        src={m.img}
                        alt={m.imgAlt}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 40vw"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1">
                          {m.year}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Connector dot (hidden on mobile) */}
                  <div className="hidden md:flex flex-col items-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />
                    <div className="w-px h-16 bg-border mt-1" />
                  </div>

                  {/* Text side */}
                  <div className="w-full md:w-5/12">
                    <Card className="border-border hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3 text-primary border-primary/30">{m.year}</Badge>
                        <h3 className="text-xl font-bold text-foreground mb-2">{m.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{m.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Nuestro Equipo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">Profesionales apasionados por la biotecnología agrícola y el desarrollo del campo mexicano.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {team.map((member) => (
                <Card key={member.name} className="group hover:shadow-lg transition-all text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{member.role}</p>
                    <p className="text-xs text-muted-foreground mb-1">{member.specialty}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{member.years}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Certificaciones y Registros</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">Respaldados por los organismos reguladores más exigentes de México y el mundo.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA con imagen de fondo (igual que hero) ── */}
        <section
          className="relative py-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${COVERAGE_BG_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance drop-shadow-lg">
                ¿Listo para trabajar juntos?
              </h2>
              <p className="text-lg text-white/80 mb-8 text-pretty">
                Nuestro equipo técnico está disponible para asesorarte y diseñar el programa biológico ideal para tus cultivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/contacto">Contactar a un asesor<ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link href="/tienda">Ver tienda en línea</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
