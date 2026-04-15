-- =============================================================================
-- BIOKRONE — Script completo de base de datos
-- Ejecutar en Neon: Dashboard → SQL Editor → pega todo y ejecuta
-- =============================================================================

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM (
    'PENDING', 'PAID', 'PROCESSING', 'SHIPPED',
    'DELIVERED', 'CANCELLED', 'REFUNDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── TABLA: User ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  "id"                TEXT        NOT NULL PRIMARY KEY,
  "email"             TEXT        NOT NULL UNIQUE,
  "passwordHash"      TEXT        NOT NULL,
  "name"              TEXT        NOT NULL,
  "phone"             TEXT,
  "role"              "Role"      NOT NULL DEFAULT 'CUSTOMER',
  "emailVerified"     BOOLEAN     NOT NULL DEFAULT false,
  "verifyToken"       TEXT,
  "verifyTokenExpiry" TIMESTAMPTZ,
  "resetToken"        TEXT,
  "resetTokenExpiry"  TIMESTAMPTZ,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- ─── TABLA: Address ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Address" (
  "id"         TEXT    NOT NULL PRIMARY KEY,
  "userId"     TEXT    NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name"       TEXT    NOT NULL,
  "street"     TEXT    NOT NULL,
  "city"       TEXT    NOT NULL,
  "state"      TEXT    NOT NULL,
  "postalCode" TEXT    NOT NULL,
  "country"    TEXT    NOT NULL DEFAULT 'México',
  "isDefault"  BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");

-- ─── TABLA: Product ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Product" (
  "id"              TEXT        NOT NULL PRIMARY KEY,
  "slug"            TEXT        NOT NULL UNIQUE,
  "name"            TEXT        NOT NULL,
  "description"     TEXT        NOT NULL,
  "fullDescription" TEXT        NOT NULL DEFAULT '',
  "benefits"        TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  "application"     TEXT        NOT NULL DEFAULT '',
  "presentation"    TEXT        NOT NULL,
  "type"            TEXT        NOT NULL,
  "category"        TEXT        NOT NULL,
  "image"           TEXT        NOT NULL,
  "priceMxn"        INTEGER     NOT NULL DEFAULT 0,
  "stock"           INTEGER     NOT NULL DEFAULT 0,
  "active"          BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Product_slug_idx"     ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_active_idx"   ON "Product"("active");

-- ─── TABLA: Order ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Order" (
  "id"              TEXT          NOT NULL PRIMARY KEY,
  "folio"           TEXT          NOT NULL UNIQUE,
  "userId"          TEXT          NOT NULL REFERENCES "User"("id"),
  "addressId"       TEXT          REFERENCES "Address"("id"),
  "status"          "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "totalMxn"        INTEGER       NOT NULL,
  "stripeSessionId" TEXT          UNIQUE,
  "stripePaymentId" TEXT,
  "shippingName"    TEXT          NOT NULL,
  "shippingStreet"  TEXT          NOT NULL,
  "shippingCity"    TEXT          NOT NULL,
  "shippingState"   TEXT          NOT NULL,
  "shippingPostal"  TEXT          NOT NULL,
  "shippingCountry" TEXT          NOT NULL DEFAULT 'México',
  "customerEmail"   TEXT          NOT NULL,
  "customerPhone"   TEXT,
  "notes"           TEXT,
  "paidAt"          TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Order_userId_idx"          ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx"          ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_stripeSessionId_idx" ON "Order"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "Order_folio_idx"           ON "Order"("folio");

-- ─── TABLA: OrderItem ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"        TEXT    NOT NULL PRIMARY KEY,
  "orderId"   TEXT    NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" TEXT    NOT NULL REFERENCES "Product"("id"),
  "name"      TEXT    NOT NULL,
  "image"     TEXT    NOT NULL,
  "priceMxn"  INTEGER NOT NULL,
  "quantity"  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- ─── TABLA: OrderCounter ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderCounter" (
  "id"    INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
  "count" INTEGER NOT NULL DEFAULT 0
);
-- Una sola fila, siempre id=1
INSERT INTO "OrderCounter" ("id", "count") VALUES (1, 0)
ON CONFLICT ("id") DO NOTHING;

-- ─── TABLA: _prisma_migrations (para que Prisma no rompa) ───────────────────
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                   TEXT        NOT NULL PRIMARY KEY,
  "checksum"             TEXT        NOT NULL,
  "finished_at"          TIMESTAMPTZ,
  "migration_name"       TEXT        NOT NULL,
  "logs"                 TEXT,
  "rolled_back_at"       TIMESTAMPTZ,
  "started_at"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count"  INTEGER     NOT NULL DEFAULT 0
);

-- =============================================================================
-- SEED: Productos BIOKRONE
-- priceMxn en centavos: $360.00 = 36000
-- =============================================================================

INSERT INTO "Product" (
  "id", "slug", "name", "description", "fullDescription",
  "benefits", "application", "presentation", "type",
  "category", "image", "priceMxn", "stock", "active",
  "createdAt", "updatedAt"
) VALUES

-- ── FUNGICIDAS ────────────────────────────────────────────────────────────────
(
  gen_random_uuid()::text, 'baktillis', 'Baktillis',
  'Fungicida microbiológico a base de Bacillus subtilis de amplio espectro.',
  'Baktillis es un fungicida microbiológico formulado con Bacillus subtilis de alta concentración. Su acción multisitio permite el control efectivo de enfermedades causadas por hongos y bacterias en diversos cultivos. Actúa por competencia, antibiosis y activación de las defensas naturales de la planta.',
  ARRAY['Control de hongos y bacterias fitopatógenas','Acción preventiva y curativa','Compatible con manejo integrado de plagas','Sin periodo de carencia, apto para cosecha'],
  'Aplicar de forma preventiva o a los primeros síntomas. Dosis: 1-2 L/ha en aspersión foliar o drench al suelo. Repetir cada 10-14 días.',
  'Suspensión concentrada 1L', 'Suspensión concentrada',
  'FUNGICIDAS', '/images/products/baktillis.png',
  36000, 200, true, now(), now()
),
(
  gen_random_uuid()::text, 'natucontrol', 'NatuControl',
  'Fungicida biológico a base de Trichoderma harzianum para patógenos del suelo.',
  'NatuControl es un fungicida biológico a base de Trichoderma harzianum, un hongo benéfico que parasita y controla hongos patógenos del suelo como Rhizoctonia, Fusarium y Pythium. Ideal para protección radicular en cultivos de alto valor como fresa, tomate, chile y aguacate.',
  ARRAY['Control de hongos del suelo (Rhizoctonia, Fusarium, Pythium)','Mejora el desarrollo y volumen del sistema radicular','Seguro para uso en cultivos orgánicos certificados','Efecto prolongado por colonización radicular'],
  'Aplicar al suelo al momento del trasplante o durante el desarrollo del cultivo. Dosis: 400-800g/ha en drench o incorporado al sustrato.',
  'Polvo humectable 400g', 'Polvo humectable',
  'FUNGICIDAS', '/images/products/natucontrol-new.png',
  58000, 150, true, now(), now()
),
(
  gen_random_uuid()::text, 'alteza', 'Alteza',
  'Inoculante bioprotector radicular con consorcio de microorganismos benéficos.',
  'Alteza es un inoculante de bioprotección radicular que combina Bacillus subtilis, Trichoderma asperellum y Pseudomonas fluorescens. Protege las raíces de patógenos y estimula el crecimiento. Contiene además Molibdeno y Ácido Indolacético para mayor vigor y enraizamiento.',
  ARRAY['Triple acción: bioprotección + estimulación + nutrición','Compatible con la mayoría de tratamientos de semilla','Estimula el enraizamiento por Ácido Indolacético','Certificado para uso en agricultura orgánica (OMRI)'],
  'Aplicar en semilla al trasplante o como drench. Dosis: 500g/ha o 2-4 g/L en tratamiento de semilla antes de siembra.',
  'Polvo humectable 500g', 'Polvo humectable — Inoculante',
  'FUNGICIDAS', '/images/products/alteza.png',
  75000, 100, true, now(), now()
),
(
  gen_random_uuid()::text, 'nemagyne', 'Nemagyne',
  'Coadyuvante nematicida con biopolímeros y extractos botánicos bioactivados.',
  'Nemagyne es un coadyuvante especializado formulado con extractos botánicos bioactivados y biopolímeros de aminopolisacáridos. Actúa como potenciador del control de nematodos y mejora la acción de nematicidas biológicos. Reduce la movilidad y penetración de nematodos en raíces.',
  ARRAY['Potencia el control de nematodos parasíticos','Biopolímeros naturales de alta biodegradabilidad','Compatible con todos los nematicidas biológicos','Sin residuos ni periodo de carencia'],
  'Aplicar al suelo vía drench o fertirriego. Dosis: 1-2 L/ha. Puede mezclarse con otros nematicidas o biológicos.',
  'Concentrado emulsionable 1L', 'Concentrado emulsionable',
  'FUNGICIDAS', '/images/products/nemagyne.png',
  55000, 80, true, now(), now()
),
(
  gen_random_uuid()::text, 'nemakron', 'Nemakron',
  'Fungicida nematicida biológico con consorcio de hongos entomopatógenos.',
  'Nemakron es un nematicida biológico que combina Pochonia chlamydosporia, Paecilomyces lilacinus, extracto de yuca y quitina. Este consorcio parasita huevos y hembras de nematodos fitoparásitos, reduciendo significativamente las poblaciones en el suelo.',
  ARRAY['Control de nematodos (Meloidogyne, Pratylenchus)','Múltiples modos de acción simultáneos','Mejora la estructura y microbioma del suelo','Apto para programa de agricultura orgánica'],
  'Incorporar al suelo antes de siembra o trasplante. Dosis: 1-2 kg/ha. Para mejores resultados aplicar 2 semanas antes de trasplante.',
  'Polvo humectable 1kg', 'Polvo humectable',
  'FUNGICIDAS', '/images/products/nemakron.png',
  0, 120, true, now(), now()
),
(
  gen_random_uuid()::text, 'bac-ilia', 'Bac Ilia',
  'Fungicida microbiológico a base de Bacillus subtilis de alta pureza.',
  'Bac Ilia es un fungicida biológico desarrollado con Bacillus subtilis de alta pureza a concentración mínima de 1×10¹² UFC/mL. Su formulación en suspensión concentrada garantiza máxima cobertura foliar y del suelo. Protege contra mildiu, tizón tardío, botrytis y otras enfermedades fúngicas. OMRI Listed.',
  ARRAY['Bacillus subtilis a 1×10¹² UFC/mL concentración mínima','Acción preventiva y curativa contra múltiples hongos','OMRI Listed — apto para agricultura orgánica certificada','Compatible con bioestimulantes y otros biológicos'],
  'Aplicar foliarmente cada 7-10 días en modo preventivo. Dosis: 2-4 mL/L en mezcla de tanque, o 2-4 L/ha en aplicación aérea.',
  'Suspensión concentrada 1L', 'Suspensión concentrada — Fungicida microbiológico',
  'FUNGICIDAS', '/images/products/bac-ilia.png',
  0, 90, true, now(), now()
),

-- ── BIOINSECTICIDAS ──────────────────────────────────────────────────────────
(
  gen_random_uuid()::text, 'aba-krone', 'Aba Krone',
  'Insecticida a base de Abamectina 1.8% para control de ácaros, trips y minadores.',
  'Aba Krone es un insecticida concentrado emulsionable a base de Abamectina 1.8%. Actúa por contacto e ingestión afectando el sistema nervioso de insectos y ácaros. Efectivo contra araña roja, trips, minadores de hoja y mosquita blanca en una amplia gama de cultivos hortícolas y frutícolas.',
  ARRAY['Amplio espectro de acción insecticida y acaricida','Control de ácaros, trips, minadores y mosquita blanca','Acción por contacto, ingestión y translaminar','Rápida acción residual de hasta 14 días'],
  'Aplicar al detectar la plaga. Dosis: 0.5-1 L/ha. Respetar intervalo de 7 días entre aplicaciones. No aplicar más de 3 veces por ciclo.',
  'Concentrado emulsionable 1L', 'Concentrado emulsionable — Insecticida',
  'BIOINSECTICIDAS', '/images/products/abakrone.png',
  50000, 180, true, now(), now()
),
(
  gen_random_uuid()::text, 'ajick', 'Ajick',
  'Repelente botánico a base de extracto de ajo (Allium sativum).',
  'Ajick es un repelente botánico formulado con extracto esencial de ajo al 87% (Allium sativum). Sus compuestos azufrados (alicina y derivados) actúan como potente repelente de insectos y ácaros, siendo una herramienta efectiva en programas de manejo integrado. OMRI Listed y apto para agricultura orgánica certificada.',
  ARRAY['87% extracto esencial de ajo (Allium sativum)','Repelente natural de amplio espectro sin toxicidad para humanos','Compatible con insectos benéficos y abejas','OMRI Listed — certificado para producción orgánica'],
  'Aplicar preventivamente o al detectar primeras plagas. Dosis: 1-2 L/ha cada 5-7 días. Aplicar en horas de baja temperatura.',
  'Solución acuosa 1L', 'Solución acuosa — Repelente botánico',
  'BIOINSECTICIDAS', '/images/products/ajick-new.png',
  24000, 250, true, now(), now()
),
(
  gen_random_uuid()::text, 'ak-neem', 'AK-Neem',
  'Insecticida botánico con Alicina y Capsaicina para control de plagas.',
  'AK-Neem combina extracto de ajo (Alicina 67.0%) y Capsaicina (3.5%) en un concentrado emulsionable de amplio espectro. Su doble modo de acción repelente y de contacto controla eficazmente moscas blancas, pulgones, trips y ácaros. Apto para uso en agricultura orgánica.',
  ARRAY['Doble modo de acción: Alicina 67% + Capsaicina 3.5%','Control de moscas blancas, pulgones, trips y ácaros','Sin periodo de carencia — apto para cosecha inmediata','Compatible con polinizadores y fauna benéfica'],
  'Aplicar al detectar la plaga. Dosis: 1-2 L/ha. Repetir cada 7-10 días según presión de plaga. Mezclar bien antes de aplicar.',
  'Concentrado emulsionable 1L', 'Concentrado emulsionable — Insecticida botánico',
  'BIOINSECTICIDAS', '/images/products/ak-neem.png',
  0, 110, true, now(), now()
),
(
  gen_random_uuid()::text, 'azanim', 'Azaním',
  'Insecticida botánico a base de Azadiractina 3% (Neem).',
  'Azaním es un insecticida botánico de alta pureza a base de Azadiractina al 3%. Controla eficazmente moscas blancas, pulgones, trips, minadores, orugas y otras plagas mediante su acción antialimentaria, reguladora del crecimiento y ovicida. Sin resistencias conocidas por su mecanismo de acción múltiple.',
  ARRAY['Azadiractina al 3% — máxima concentración disponible','Control simultáneo de insectos en múltiples estadios','Acción ovicida — interrumpe el ciclo de la plaga','Bajo impacto ambiental — se degrada en 5-7 días'],
  'Aplicar en aspersión total cubriendo bien follaje por ambas caras. Dosis: 0.5-1 L/ha cada 7 días en periodo de alta presión.',
  'Concentrado emulsionable 1L', 'Concentrado emulsionable — Insecticida botánico',
  'BIOINSECTICIDAS', '/images/products/azanim-new.png',
  63000, 130, true, now(), now()
),

-- ── BIOFORTIFICANTES ─────────────────────────────────────────────────────────
(
  gen_random_uuid()::text, 'glumix', 'Glumix',
  'Inoculante a base de hongos endomicorrízicos VAM para mejorar absorción de nutrientes.',
  'Glumix es un inoculante micorrízico que contiene esporas de hongos endomicorrízicos VAM (20,000 esporas viables/kg). Establece simbiosis con las raíces ampliando significativamente su área de absorción, mejorando la captación de fósforo, agua y micronutrientes. Ganador del Premio Nacional de Tecnología e Innovación.',
  ARRAY['20,000 esporas de hongos endomicorrízicos viables/kg','Mayor absorción de fósforo, agua y micronutrientes','Aumenta resistencia al estrés hídrico y salino','Premio Nacional de Tecnología e Innovación'],
  'Incorporar al suelo en surco de siembra o en contacto directo con la raíz al trasplante. Dosis: 1-2 kg/ha. También puede aplicarse vía fertirriego.',
  'Polvo inoculante 1kg', 'Polvo — Inoculante micorrízico',
  'BIOFORTIFICANTES', '/images/products/glumix-new.png',
  33000, 200, true, now(), now()
),
(
  gen_random_uuid()::text, 'glumix-irrigation', 'Glumix Irrigation',
  'Bioactivador radicular con micorrizas, ácidos húmicos y fúlvicos para fertirriego.',
  'Glumix Irrigation es un bioactivador formulado específicamente para aplicación vía fertirriego. Combina esporas de hongos endomicorrízicos (20%), ácidos húmicos y fúlvicos (20%), extracto de Ascophyllum nodosum (8%), extracto de yuca (5%) y ácido indolacético (1,000 ppm). Premio Nacional de Innovación e Innovagro Internacional.',
  ARRAY['Formulado para aplicación directa vía fertirriego','Ácidos húmicos y fúlvicos al 20% para mayor retención','Extracto de algas Ascophyllum nodosum como bioestimulante','Premio Nacional de Tecnología + Premio Innovagro Internacional'],
  'Aplicar vía fertirriego. Dosis: 1-2 kg/ha por aplicación. Se recomienda 3-4 aplicaciones por ciclo en etapas críticas de desarrollo.',
  'Sólido granulado 1kg', 'Sólido — Inoculante bioactivador',
  'BIOFORTIFICANTES', '/images/products/glumix-irrigation.png',
  80000, 160, true, now(), now()
),
(
  gen_random_uuid()::text, 'azseed', 'AZSeed',
  'Inoculante de semillas con bacterias fijadoras de nitrógeno.',
  'AZSeed es un inoculante de semillas a base de Azospirillum brasilense, Azotobacter spp., Rhizobium spp. y Bacillus spp. a concentración de 1×10⁸ UFC/g. Las bacterias fijadoras de nitrógeno mejoran la germinación, el vigor inicial y el desarrollo radicular, reduciendo hasta un 30% la dependencia de fertilizantes nitrogenados.',
  ARRAY['Fijación biológica de nitrógeno atmosférico','Mejora la tasa de germinación y vigor inicial','Consorcio de 4 géneros bacterianos sinérgicos','OMRI Listed — apto para semilla orgánica certificada'],
  'Aplicar directamente a las semillas antes de la siembra. Dosis: 100g por 50 kg de semilla. Mezclar hasta cubrir uniformemente. No exponer a luz solar directa.',
  'Polvo humectable 100g', 'Polvo humectable — Inoculante de semilla',
  'BIOFORTIFICANTES', '/images/products/azseed-new.png',
  21000, 300, true, now(), now()
),
(
  gen_random_uuid()::text, 'amikrone-1l', 'Amikrone 1L',
  'Fertilizante orgánico líquido a base de L-Aminoácidos libres.',
  'Amikrone es un fertilizante orgánico formulado con L-Aminoácidos libres de alta concentración (materia orgánica 90.73%). Contiene un perfil completo de aminoácidos esenciales y microelementos (Cu, Mn, Zn, Ca) que estimulan el metabolismo vegetal, mejoran la respuesta al estrés y aumentan rendimientos en calidad y cantidad.',
  ARRAY['90.73% materia orgánica en aminoácidos libres de alta asimilación','Perfil completo de L-Aminoácidos esenciales y no esenciales','Incluye microelementos: Cu, Mn, Zn, Ca disponibles','Estimula el metabolismo y reduce el estrés biótico y abiótico'],
  'Aplicar foliarmente o en fertirrigación. Dosis foliar: 1-2 mL/L. Fertirrigación: 3-5 L/ha. Aplicar en etapas de crecimiento activo, floración y llenado de fruto.',
  'Líquido concentrado 1L', 'Líquido — Fertilizante orgánico',
  'BIOFORTIFICANTES', '/images/products/amikrone.png',
  31000, 220, true, now(), now()
),
(
  gen_random_uuid()::text, 'amikrone-500ml', 'Amikrone 500mL',
  'Presentación 500mL del fertilizante orgánico L-Aminoácidos.',
  'Amikrone 500mL es la presentación compacta del fertilizante orgánico L-Aminoácidos de Biokrone. Misma fórmula de alta concentración (materia orgánica 90.73%) con perfil completo de aminoácidos esenciales y microelementos. Ideal para productores con superficies menores o para quienes desean probar el producto.',
  ARRAY['Misma fórmula concentrada de Amikrone en presentación compacta','Ideal para pequeños productores o primeras aplicaciones','L-Aminoácidos de hidrólisis enzimática de alta calidad','Fácil dosificación y almacenamiento'],
  'Aplicar foliarmente o en fertirrigación. Dosis foliar: 1-2 mL/L. Fertirrigación: 3-5 L/ha. Misma dosificación que presentación 1L.',
  'Líquido concentrado 500mL', 'Líquido — Fertilizante orgánico',
  'BIOFORTIFICANTES', '/images/products/amikrone-500ml.png',
  16800, 280, true, now(), now()
),
(
  gen_random_uuid()::text, 'bioelicitor', 'BioElicitor',
  'Fertilizante orgánico a base de extracto de algas marinas con citocininas.',
  'BioElicitor es un fertilizante orgánico líquido formulado con extracto de algas Ascophyllum nodosum, rico en citocininas naturales, ácidos orgánicos y microelementos (K, S, Mg, Zn). Activa los mecanismos de defensa de la planta, mejora el cuajado de frutos y aumenta la tolerancia al estrés abiótico. Producido en Irlanda con certificación triple lavado.',
  ARRAY['Extracto de Ascophyllum nodosum — alga de máxima calidad','Citocininas naturales que activan defensas vegetales','Mejora el cuajado, calibre y color de frutos','Fabricado en Irlanda con certificación de calidad ISO'],
  'Aplicar foliarmente en etapas clave del cultivo. Dosis: 1-2 L/ha. Aplicar cada 10-15 días especialmente en floración, cuajado y engorde de fruto.',
  'Líquido concentrado 1L', 'Líquido — Fertilizante orgánico — Bioestimulante',
  'BIOFORTIFICANTES', '/images/products/bio-elicitor.png',
  32200, 190, true, now(), now()
)

ON CONFLICT ("slug") DO UPDATE SET
  "name"            = EXCLUDED."name",
  "description"     = EXCLUDED."description",
  "fullDescription" = EXCLUDED."fullDescription",
  "benefits"        = EXCLUDED."benefits",
  "application"     = EXCLUDED."application",
  "presentation"    = EXCLUDED."presentation",
  "type"            = EXCLUDED."type",
  "category"        = EXCLUDED."category",
  "image"           = EXCLUDED."image",
  "priceMxn"        = EXCLUDED."priceMxn",
  "stock"           = EXCLUDED."stock",
  "active"          = EXCLUDED."active",
  "updatedAt"       = now();

-- ─── Verificación ────────────────────────────────────────────────────────────
SELECT
  category,
  COUNT(*) as total,
  SUM(stock) as stock_total,
  STRING_AGG(name || ' ($' || (priceMxn/100)::text || ')', ', ') as productos
FROM "Product"
GROUP BY category
ORDER BY category;

SELECT 'BD lista. Total productos: ' || COUNT(*)::text as resultado FROM "Product";
