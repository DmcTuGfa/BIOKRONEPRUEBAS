import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

/**
 * GET /api/admin/tracking?carrier=Estafeta&number=XXXX
 *
 * Consulta el estado de rastreo de una guía.
 * - Estafeta: usa su endpoint público REST
 * - DHL México: usa su API pública de rastreo
 * - Paquetexpress / Redpack / otros: redirige al sitio
 *
 * NOTA: Las APIs de paqueterías mexicanas requieren credenciales
 * de cliente en producción. Esta implementación usa los endpoints
 * públicos disponibles. Para DHL y Estafeta con credenciales
 * propias, reemplaza las constantes de env.
 */

interface TrackingEvent {
  date:        string
  description: string
  location?:   string
}

interface TrackingResult {
  status:       string
  statusLabel:  string
  events:       TrackingEvent[]
  estimatedDelivery?: string
  carrier:      string
  trackingUrl:  string
}

async function trackEstafeta(trackingNumber: string): Promise<TrackingResult> {
  const trackingUrl = `https://www.estafeta.com/herramientas/rastreo?wayBillType=0&waybill=${trackingNumber}`

  // Estafeta tiene una API pública de consulta
  // Endpoint: POST https://services.estafeta.com.mx/EstafetaServicesInternet/WaybillQueryService
  // En producción se requieren credenciales. Aquí usamos el endpoint público web-scrape-safe.
  try {
    const res = await fetch(
      `https://api.estafeta.com/v3/rastreo/${trackingNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          // "login": process.env.ESTAFETA_LOGIN ?? "",
          // "password": process.env.ESTAFETA_PASSWORD ?? "",
          // "suscriberId": process.env.ESTAFETA_SUBSCRIBER ?? "",
        },
        next: { revalidate: 0 },
      }
    )

    if (res.ok) {
      const data = await res.json()
      const events: TrackingEvent[] = (data.events || data.wayPoints || []).map((e: any) => ({
        date:        e.date || e.fecha || "",
        description: e.description || e.evento || e.descripcion || "",
        location:    e.city || e.ciudad || e.location || "",
      }))

      return {
        status:      data.statusCode || "UNKNOWN",
        statusLabel: data.status || data.estado || "Consultando...",
        events,
        carrier:     "Estafeta",
        trackingUrl,
      }
    }
  } catch { /* fallthrough to manual link */ }

  // Si la API no responde, devolvemos link para consulta manual
  return {
    status:      "MANUAL",
    statusLabel: "Consultar en sitio de Estafeta",
    events:      [],
    carrier:     "Estafeta",
    trackingUrl,
  }
}

async function trackDHL(trackingNumber: string): Promise<TrackingResult> {
  const trackingUrl = `https://www.dhl.com/mx-es/home/tracking.html?tracking-id=${trackingNumber}`

  // DHL provee una API pública (MyDHL API) — requiere API key en producción
  // Endpoint: GET https://api-eu.dhl.com/track/shipments?trackingNumber=XXX
  try {
    const apiKey = process.env.DHL_API_KEY
    if (!apiKey) throw new Error("No DHL API key")

    const res = await fetch(
      `https://api-eu.dhl.com/track/shipments?trackingNumber=${trackingNumber}`,
      {
        headers: {
          "DHL-API-Key": apiKey,
          "Accept": "application/json",
        },
        next: { revalidate: 0 },
      }
    )

    if (res.ok) {
      const data = await res.json()
      const shipment = data.shipments?.[0]
      const events: TrackingEvent[] = (shipment?.events || []).map((e: any) => ({
        date:        e.timestamp || "",
        description: e.description || e.status?.description || "",
        location:    e.location?.address?.addressLocality || "",
      }))

      return {
        status:             shipment?.status?.statusCode || "UNKNOWN",
        statusLabel:        shipment?.status?.description || "En tránsito",
        events,
        estimatedDelivery: shipment?.estimatedTimeOfDelivery,
        carrier:            "DHL",
        trackingUrl,
      }
    }
  } catch { /* fallthrough */ }

  return {
    status:      "MANUAL",
    statusLabel: "Consultar en sitio de DHL",
    events:      [],
    carrier:     "DHL",
    trackingUrl,
  }
}

async function trackFedEx(trackingNumber: string): Promise<TrackingResult> {
  const trackingUrl = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}&locale=es_MX`
  // FedEx API requiere OAuth. Sin credenciales, devolvemos link.
  return {
    status:      "MANUAL",
    statusLabel: "Consultar en sitio de FedEx",
    events:      [],
    carrier:     "FedEx",
    trackingUrl,
  }
}

async function trackPaquetexpress(trackingNumber: string): Promise<TrackingResult> {
  const trackingUrl = `https://www.paquetexpress.com.mx/rastreo?guia=${trackingNumber}`
  return {
    status:      "MANUAL",
    statusLabel: "Consultar en sitio de Paquetexpress",
    events:      [],
    carrier:     "Paquetexpress",
    trackingUrl,
  }
}

async function trackRedpack(trackingNumber: string): Promise<TrackingResult> {
  const trackingUrl = `https://www.redpack.com.mx/es/rastreo/?guia=${trackingNumber}`
  return {
    status:      "MANUAL",
    statusLabel: "Consultar en sitio de Redpack",
    events:      [],
    carrier:     "Redpack",
    trackingUrl,
  }
}

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const carrier = req.nextUrl.searchParams.get("carrier") || ""
  const number  = req.nextUrl.searchParams.get("number")  || ""

  if (!carrier || !number) {
    return NextResponse.json({ error: "Se requiere carrier y number" }, { status: 400 })
  }

  let result: TrackingResult

  switch (carrier.toLowerCase()) {
    case "estafeta":     result = await trackEstafeta(number);     break
    case "dhl":          result = await trackDHL(number);          break
    case "fedex":        result = await trackFedEx(number);        break
    case "paquetexpress":result = await trackPaquetexpress(number);break
    case "redpack":      result = await trackRedpack(number);      break
    default:
      result = {
        status:      "MANUAL",
        statusLabel: `Consultar en sitio de ${carrier}`,
        events:      [],
        carrier,
        trackingUrl: "#",
      }
  }

  return NextResponse.json(result)
}
