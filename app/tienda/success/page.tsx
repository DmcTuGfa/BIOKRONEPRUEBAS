import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Package, ArrowRight, Mail } from "lucide-react"

export default async function SuccessPage({ searchParams }: { searchParams: { folio?: string } }) {
  const folio = searchParams.folio

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-muted/30 py-20">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="text-center border-green-500/30 shadow-lg">
            <CardContent className="p-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">¡Pago exitoso!</h1>
              {folio && <p className="text-primary font-mono font-bold text-lg mb-4">{folio}</p>}
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Tu pedido ha sido confirmado. Recibirás un correo con los detalles y número de seguimiento.
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-border mb-8 flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Revisa tu correo</p>
                  <p className="text-xs text-muted-foreground">Te enviamos la confirmación y los detalles del envío.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="gap-2">
                  <Link href="/cuenta/pedidos"><Package className="h-4 w-4" />Ver mis pedidos<ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/tienda">Seguir comprando</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
