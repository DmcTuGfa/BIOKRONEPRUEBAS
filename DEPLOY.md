# BIOKRONE — Guía de Deploy en Railway

## Variables de entorno requeridas en Railway

```
DATABASE_URL=postgresql://...            # Neon PostgreSQL
JWT_SECRET=clave-larga-y-aleatoria
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://tu-dominio.railway.app
```

## Pasos después de cada deploy con cambios en schema

### 1. Ejecutar la migración SQL manualmente en Neon

Abre el SQL Editor en Neon y ejecuta el contenido de:
`prisma/add-shipping-fields.sql`

Es seguro ejecutarlo múltiples veces (usa IF NOT EXISTS).

### 2. Regenerar el cliente de Prisma

Railway lo hace automáticamente con el build command:
```bash
npx prisma generate && next build
```

Asegúrate de que tu `package.json` tenga en scripts:
```json
"build": "prisma generate && next build"
```

## Checklist de variables para Stripe

- [ ] `STRIPE_SECRET_KEY` → Panel Stripe → API Keys → Secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Panel Stripe → API Keys → Publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` → Panel Stripe → Webhooks → tu endpoint → Signing secret
- [ ] URL del webhook en Stripe: `https://tu-dominio.railway.app/api/webhooks/stripe`

## Credenciales opcionales de paqueterías (tracking automático)

```
DHL_API_KEY=              # API key de DHL MyDHL
ESTAFETA_LOGIN=           # Login de API Estafeta
ESTAFETA_PASSWORD=        # Password de API Estafeta
ESTAFETA_SUBSCRIBER=      # Subscriber ID de Estafeta
```

Sin estas variables, el tracking muestra un link directo al sitio de la paquetería.

## Imágenes de productos

Actualmente las rutas de imágenes se guardan como texto (ej: `/products/abakrone.png`).
Para usar almacenamiento externo (recomendado para producción):

### Opción A: Cloudinary
1. Crea cuenta en cloudinary.com
2. Agrega `CLOUDINARY_URL=cloudinary://...` a Railway
3. Usa el widget de upload en admin productos

### Opción B: UploadThing
1. Crea cuenta en uploadthing.com
2. Agrega `UPLOADTHING_SECRET` y `UPLOADTHING_APP_ID`
3. Instala: `npm install uploadthing @uploadthing/react`

Por ahora las imágenes se sirven desde `/public/images/` o rutas externas HTTP.

## Crear primer usuario ADMIN

```sql
-- En el SQL Editor de Neon, actualizar el role de tu usuario:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

O usa el archivo: `prisma/make-admin.sql`
