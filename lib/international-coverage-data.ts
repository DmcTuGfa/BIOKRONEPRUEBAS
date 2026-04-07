export type CountryStatus = "tienda" | "vendedor" | "contacto" | "proximamente"

export interface CountryAgent {
  zone: string
  whatsapp: string
}

export interface CountryData {
  name: string
  status: CountryStatus
  observations: string
  storeUrl?: string
  contactUrl?: string
  agents?: CountryAgent[]
}

export const internationalCoverageData: Record<string, CountryData> = {
  Mexico: {
    name: "México",
    status: "tienda",
    observations: "Compra directa disponible en línea para todo México.",
    storeUrl: "/tienda",
  },
  "United States of America": {
    name: "Estados Unidos",
    status: "contacto",
    observations: "Atención comercial internacional disponible.",
    contactUrl: "/contacto",
  },
  Guatemala: {
    name: "Guatemala",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  Belize: {
    name: "Belice",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  Honduras: {
    name: "Honduras",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  "El Salvador": {
    name: "El Salvador",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  Nicaragua: {
    name: "Nicaragua",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  "Costa Rica": {
    name: "Costa Rica",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  Panama: {
    name: "Panamá",
    status: "contacto",
    observations: "Solicita atención comercial para tu zona.",
    contactUrl: "/contacto",
  },
  Colombia: {
    name: "Colombia",
    status: "vendedor",
    observations: "Distribuidor internacional disponible.",
    agents: [{ zone: "Colombia", whatsapp: "573001112233" }],
  },
  Venezuela: {
    name: "Venezuela",
    status: "proximamente",
    observations: "Cobertura en evaluación.",
  },
  Ecuador: {
    name: "Ecuador",
    status: "contacto",
    observations: "Atención comercial disponible bajo solicitud.",
    contactUrl: "/contacto",
  },
  Peru: {
    name: "Perú",
    status: "vendedor",
    observations: "Atención con asesor internacional.",
    agents: [{ zone: "Perú", whatsapp: "51999988777" }],
  },
  Bolivia: {
    name: "Bolivia",
    status: "contacto",
    observations: "Atención comercial disponible bajo solicitud.",
    contactUrl: "/contacto",
  },
  Paraguay: {
    name: "Paraguay",
    status: "contacto",
    observations: "Atención comercial disponible bajo solicitud.",
    contactUrl: "/contacto",
  },
  Chile: {
    name: "Chile",
    status: "contacto",
    observations: "Atención comercial internacional disponible.",
    contactUrl: "/contacto",
  },
  Argentina: {
    name: "Argentina",
    status: "contacto",
    observations: "Solicita información para atención internacional.",
    contactUrl: "/contacto",
  },
  Uruguay: {
    name: "Uruguay",
    status: "contacto",
    observations: "Solicita información para atención internacional.",
    contactUrl: "/contacto",
  },
  Brazil: {
    name: "Brasil",
    status: "proximamente",
    observations: "Expansión internacional en planeación.",
  },
}
