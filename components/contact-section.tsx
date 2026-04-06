"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hola, me interesa información sobre productos BIOKRONE")
    window.open(`https://wa.me/524611021115?text=${message}`, "_blank")
  }

  return (
    <section id="contacto" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Contactanos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Estamos aqui para ayudarte. Comunicate con nosotros y un asesor te atendera a la brevedad.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Informacion de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <button 
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors group text-left"
                >
                  <div className="p-3 rounded-xl bg-green-600 text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-green-600 transition-colors">WhatsApp - Contacto Directo</p>
                    <p className="text-sm text-muted-foreground">+52 461 102 1115</p>
                  </div>
                </button>

                <a 
                  href="mailto:ventas@biokrone.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group"
                >
                  <div className="p-3 rounded-xl bg-primary text-primary-foreground">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">Correo electronico</p>
                    <p className="text-sm text-muted-foreground">ventas@biokrone.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <div className="p-3 rounded-xl bg-muted-foreground/20 text-muted-foreground">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefono</p>
                    <p className="text-sm text-muted-foreground">+52 461 102 1115</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <div className="p-3 rounded-xl bg-muted-foreground/20 text-muted-foreground">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ubicacion</p>
                    <p className="text-sm text-muted-foreground">Leon, Guanajuato, Mexico</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Envianos un mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" placeholder="Tu nombre" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo</Label>
                    <Input id="email" type="email" placeholder="tu@correo.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" type="tel" placeholder="+52 000 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" placeholder="En que podemos ayudarte?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aqui..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitted}>
                  {submitted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mensaje enviado
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
